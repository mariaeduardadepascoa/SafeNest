import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
    "rtsp_transport;tcp|threads;1"
)

import cv2
import time
import base64
import threading
import traceback
import httpx
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ultralytics import YOLO

INTERVALO_ENTRE_ALERTAS = 30
MAX_CAMERAS = 10
LARGURA_MAXIMA_FOTO = 800
ESPERA_RECONEXAO = 5
INTERVALO_ANALISE = 0.40
CONFIANCA_MINIMA = 0.5
DETECCOES_CONSECUTIVAS = 5

modelo = YOLO("best.pt")
trava_modelo = threading.Lock()
trava_cameras = threading.RLock()
cameras = {}


class CameraEntrada(BaseModel):
    id_camera: str
    url_rtsp: str
    url_webhook: str | None = None


def agora_texto():
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")


def buscar_camera(id_camera):
    with trava_cameras:
        camera = cameras.get(id_camera)
    if camera is None:
        raise HTTPException(
            status_code=404,
            detail=f"Câmera {id_camera} não encontrada"
        )
    return camera


def detectar_fogo(frame):
    with trava_modelo:
        resultados = modelo.predict(
            frame,
            conf=CONFIANCA_MINIMA,
            device=None,
            verbose=False
        )
    deteccoes = []
    for resultado in resultados:
        for caixa in resultado.boxes:
            numero_classe = int(caixa.cls.item())
            nome_classe = resultado.names[numero_classe]
            confianca = float(caixa.conf.item())
            print(
                f"YOLO DETECTOU: {nome_classe} | "
                f"Confiança: {confianca:.2%}"
            )
            if nome_classe.lower() != "fogo":
                continue
            x1, y1, x2, y2 = caixa.xyxy[0].tolist()
            deteccoes.append({
                "classe": "fogo",
                "confianca": round(confianca, 2),
                "caixa": [
                    int(x1),
                    int(y1),
                    int(x2),
                    int(y2)
                ]
            })
    return deteccoes


def gerar_foto_base64(frame, deteccoes):
    foto = frame.copy()
    altura, largura = foto.shape[:2]
    escala = 1.0
    if largura > LARGURA_MAXIMA_FOTO:
        escala = LARGURA_MAXIMA_FOTO / largura
        foto = cv2.resize(
            foto,
            (LARGURA_MAXIMA_FOTO, int(altura * escala))
        )
    for deteccao in deteccoes:
        x1, y1, x2, y2 = [
            int(valor * escala)
            for valor in deteccao["caixa"]
        ]
        cv2.rectangle(
            foto,
            (x1, y1),
            (x2, y2),
            (0, 0, 255),
            2
        )
    sucesso, buffer = cv2.imencode(
        ".jpg",
        foto,
        [cv2.IMWRITE_JPEG_QUALITY, 70]
    )
    if not sucesso:
        return None
    return base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")


def enviar_webhook(url, alerta):
    for tentativa in range(1, 4):
        try:
            resposta = httpx.post(
                url,
                json=alerta,
                timeout=15
            )
            print(f"Webhook HTTP {resposta.status_code} | URL: {url}")
            resposta.raise_for_status()
            print("Alerta enviado ao Spring Boot")
            return
        except Exception as erro:
            print(
                f"Webhook falhou "
                f"({tentativa}/3): {erro}"
            )
            time.sleep(2)


def criar_alerta(camera, frame, deteccoes):
    with camera["lock"]:
        camera["total_alertas"] += 1
        numero = time.time_ns() // 1_000_000 
    alerta = {
        "numero": numero,
        "id_camera": camera["id_camera"],
        "tipo": "fogo",
        "horario": agora_texto(),
        "deteccoes": deteccoes,
        "foto_base64": gerar_foto_base64(
            frame,
            deteccoes
        )
    }
    with camera["lock"]:
        camera["alertas"].append(alerta)
        camera["alertas"] = camera["alertas"][-10:]
    print(
        f"[{camera['id_camera']}] "
        f"ALERTA DE FOGO!"
    )
    if camera["url_webhook"]:
        threading.Thread(
            target=enviar_webhook,
            args=(camera["url_webhook"], alerta),
            daemon=True
        ).start()


def monitorar(camera):
    id_camera = camera["id_camera"]
    sequencia = 0
    ultima_analise = 0
    ultimo_alerta = 0
    while not camera["parar"].is_set():
        captura = None
        try:
            captura = cv2.VideoCapture(
                camera["url_rtsp"],
                cv2.CAP_FFMPEG,
                [
                    cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
                    cv2.CAP_PROP_READ_TIMEOUT_MSEC, 15000
                ]
            )
            if not captura.isOpened():
                raise RuntimeError(
                    "Não foi possível abrir o stream RTSP"
                )
            with camera["lock"]:
                camera["estado"] = "monitorando"
                camera["erro"] = None
            print(f"[{id_camera}] conectado")
            while not camera["parar"].is_set():
                sucesso, frame = captura.read()
                if not sucesso:
                    raise RuntimeError(
                        "Stream interrompido"
                    )
                agora = time.monotonic()
                if agora - ultima_analise < INTERVALO_ANALISE:
                    continue
                ultima_analise = agora
                with camera["lock"]:
                    camera["ultima_analise_em"] = agora_texto()
                try:
                    deteccoes = detectar_fogo(frame)
                    sequencia = (
                        sequencia + 1 if deteccoes else 0
                    )
                    fogo = (
                        sequencia >= DETECCOES_CONSECUTIVAS
                    )
                    foto = frame.copy()
                    for deteccao in deteccoes:
                        x1, y1, x2, y2 = deteccao["caixa"]
                        cv2.rectangle(
                            foto,
                            (x1, y1),
                            (x2, y2),
                            (0, 0, 255),
                            2
                        )
                    sucesso_jpeg, buffer = cv2.imencode(
                        ".jpg",
                        foto,
                        [cv2.IMWRITE_JPEG_QUALITY, 70]
                    )
                    with camera["lock"]:
                        camera["fogo"] = fogo
                        if sucesso_jpeg:
                            camera["frame_jpeg"] = (
                                buffer.tobytes()
                            )
                    if (
                        fogo and
                        agora - ultimo_alerta >=
                        INTERVALO_ENTRE_ALERTAS
                    ):
                        ultimo_alerta = agora
                        criar_alerta(
                            camera,
                            frame,
                            deteccoes
                        )
                except Exception as erro:
                    with camera["lock"]:
                        camera["erro"] = str(erro)
                    traceback.print_exc()
        except Exception as erro:
            with camera["lock"]:
                camera["erro"] = str(erro)
            print(f"[{id_camera}] {erro}")
        finally:
            if captura is not None:
                captura.release()
            with camera["lock"]:
                camera["fogo"] = False
                camera["frame_jpeg"] = None
            sequencia = 0
        if not camera["parar"].is_set():
            with camera["lock"]:
                camera["estado"] = "reconectando"
                camera["reconexoes"] += 1
            camera["parar"].wait(ESPERA_RECONEXAO)
    with camera["lock"]:
        camera["estado"] = "parada"
    print(f"[{id_camera}] monitoramento encerrado")


def montar_status(camera):
    with camera["lock"]:
        ultimo_alerta = None
        if camera["alertas"]:
            ultimo_alerta = dict(
                camera["alertas"][-1]
            )
            ultimo_alerta.pop("foto_base64", None)
        return {
            "id_camera": camera["id_camera"],
            "estado": camera["estado"],
            "monitorando": (
                camera["estado"] == "monitorando"
            ),
            "fogo_detectado": camera["fogo"],
            "iniciada_em": camera["iniciada_em"],
            "ultima_analise_em": (
                camera["ultima_analise_em"]
            ),
            "reconexoes": camera["reconexoes"],
            "total_alertas": camera["total_alertas"],
            "ultimo_alerta": ultimo_alerta,
            "ultimo_erro": camera["erro"]
        }


def adicionar_camera(dados):
    id_camera = dados.id_camera
    if (
        not id_camera or
        "/" in id_camera or
        "\\" in id_camera or
        ".." in id_camera
    ):
        raise HTTPException(
            400,
            "Identificador inválido"
        )
    if not dados.url_rtsp.startswith("rtsp://"):
        raise HTTPException(
            400,
            "A URL deve começar com rtsp://"
        )
    with trava_cameras:
        if id_camera in cameras:
            raise HTTPException(
                409,
                "Câmera já cadastrada"
            )
        if len(cameras) >= MAX_CAMERAS:
            raise HTTPException(
                503,
                "Limite de câmeras atingido"
            )
        camera = {
            "id_camera": id_camera,
            "url_rtsp": dados.url_rtsp,
            "url_webhook": dados.url_webhook,
            "parar": threading.Event(),
            "lock": threading.RLock(),
            "thread": None,
            "estado": "iniciando",
            "iniciada_em": agora_texto(),
            "ultima_analise_em": None,
            "erro": None,
            "reconexoes": 0,
            "fogo": False,
            "frame_jpeg": None,
            "alertas": [],
            "total_alertas": 0
        }
        cameras[id_camera] = camera
        thread = threading.Thread(
            target=monitorar,
            args=(camera,),
            daemon=True
        )
        camera["thread"] = thread
        thread.start()
    return montar_status(camera)


def parar_camera_interna(id_camera):
    camera = buscar_camera(id_camera)
    camera["parar"].set()
    thread = camera["thread"]
    if thread is not None:
        thread.join(timeout=12)
        if thread.is_alive():
            raise HTTPException(
                503,
                "A câmera ainda está encerrando"
            )
    with trava_cameras:
        if cameras.get(id_camera) is camera:
            del cameras[id_camera]
    return {
        "id_camera": id_camera,
        "estado": "parada"
    }


def gerar_stream(camera):
    ultimo_frame = None
    while not camera["parar"].is_set():
        with camera["lock"]:
            frame = camera["frame_jpeg"]
        if frame is None or frame is ultimo_frame:
            time.sleep(0.1)
            continue
        ultimo_frame = frame
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame +
            b"\r\n"
        )
        time.sleep(0.1)


@asynccontextmanager
async def lifespan(app):
    yield
    with trava_cameras:
        lista = list(cameras.values())
    for camera in lista:
        camera["parar"].set()
    for camera in lista:
        thread = camera["thread"]
        if thread is not None:
            thread.join(timeout=12)


app = FastAPI(
    title="SafeNest-IA",
    lifespan=lifespan
)


@app.post("/yolo", status_code=201)


def cadastrar_camera(dados: CameraEntrada):
    return adicionar_camera(dados)


@app.get("/yolo")


def listar_cameras():
    with trava_cameras:
        lista = list(cameras.values())
    return [montar_status(c) for c in lista]


@app.post("/yolo/sincronizar")


def sincronizar_cameras(
    lista: list[CameraEntrada] = Body(...)
):
    resultado = {
        "sincronizadas": [],
        "ja_existentes": [],
        "erros": []
    }
    for item in lista:
        try:
            with trava_cameras:
                existente = cameras.get(item.id_camera)
            if existente is not None:
                if (
                    existente["url_rtsp"] == item.url_rtsp
                    and existente["url_webhook"] == item.url_webhook
                ):
                    resultado["ja_existentes"].append(
                        item.id_camera
                    )
                    continue
                parar_camera_interna(item.id_camera)
            adicionar_camera(item)
            resultado["sincronizadas"].append(
                item.id_camera
            )
        except Exception as erro:
            resultado["erros"].append({
                "id_camera": item.id_camera,
                "erro": str(erro)
            })
    return resultado


@app.delete("/yolo/{id_camera}")


def parar_camera(id_camera: str):
    return parar_camera_interna(id_camera)


@app.get("/yolo/{id_camera}/status")


def status_da_camera(id_camera: str):
    return montar_status(
        buscar_camera(id_camera)
    )


@app.get("/yolo/{id_camera}/alertas")


def alertas_da_camera(id_camera: str):
    camera = buscar_camera(id_camera)
    with camera["lock"]:
        return list(reversed(camera["alertas"]))


@app.get("/yolo/{id_camera}/video")


def video_da_camera(id_camera: str):
    camera = buscar_camera(id_camera)
    return StreamingResponse(
        gerar_stream(camera),
        media_type=(
            "multipart/x-mixed-replace;boundary=frame"
        ),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )
