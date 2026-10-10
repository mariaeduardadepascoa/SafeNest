from ultralytics import YOLO
from fastapi import Body, FastAPI, HTTPException
import httpx
import cv2
from datetime import datetime
import traceback
import time
import threading
import base64
import os
os.environ.setdefault("OPENCV_FFMPEG_CAPTURE_OPTIONS", "rtsp_transport;tcp")

FRAMES_PARA_CONFIRMAR = 10
INTERVALO_ENTRE_ALERTAS = 30
MAX_CAMERAS = 10
LARGURA_MAXIMA_FOTO = 800
ESPERA_RECONEXAO = 5

app = FastAPI(title="SafeNest-IA")
modelo = YOLO("best.pt")
trava_modelo = threading.Lock()
cameras = {}


def agora_texto():
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")


def detectar_fogo(frame):
    with trava_modelo:
        resultados = modelo.predict(
            frame, conf=0.6, device=None, verbose=False)
    resultado = resultados[0]

    deteccoes = []
    for caixa in resultado.boxes:
        numero_classe = int(caixa.cls)
        nome_classe = modelo.names[numero_classe]

        if nome_classe in "fogo":
            x1, y1, x2, y2 = caixa.xyxy[0].tolist()
            deteccoes.append({
                "classe": nome_classe,
                "confianca": round(float(caixa.conf), 2),
                "caixa": [int(x1), int(y1), int(x2), int(y2)],
            })
    return deteccoes


def gerar_foto_base64(id_camera, frame, deteccoes):
    try:
        foto = frame.copy()

        escala = 1.0
        altura, largura = foto.shape[:2]
        if LARGURA_MAXIMA_FOTO and largura > LARGURA_MAXIMA_FOTO:
            escala = LARGURA_MAXIMA_FOTO / largura
            foto = cv2.resize(
                foto, (LARGURA_MAXIMA_FOTO, int(altura * escala)))

        for d in deteccoes:
            x1, y1, x2, y2 = [int(valor * escala) for valor in d["caixa"]]
            cv2.rectangle(foto, (x1, y1), (x2, y2), (0, 0, 255), 2)

        deu_certo, buffer = cv2.imencode(
            ".jpg", foto, [cv2.IMWRITE_JPEG_QUALITY, 70])
        if not deu_certo:
            return None
        return base64.b64encode(buffer.tobytes()).decode("utf-8")
    except Exception as erro:
        print(f"[{id_camera}] erro ao gerar a foto: {erro}")
        return None


def enviar_webhook(url, alerta):
    for tentativa in range(1, 4):
        try:
            resposta = httpx.post(url, json=alerta, timeout=5)
            resposta.raise_for_status()
            return
        except Exception as erro:
            print(f"webhook falhou (tentativa {tentativa}/3): {erro}")
            time.sleep(2)


def criar_alerta(camera, frame, deteccoes):
    id_camera = camera["id_camera"]

    alerta = {
        "numero": camera["total_alertas"] + 1,
        "id_camera": id_camera,
        "tipo": "fogo",
        "horario": agora_texto(),
        "deteccoes": deteccoes,
        "foto_base64": gerar_foto_base64(id_camera, frame, deteccoes),
    }

    camera["alertas"].append(alerta)
    if len(camera["alertas"]) > 10:
        camera["alertas"].pop(0)
    camera["total_alertas"] += 1

    print(f"[{id_camera}] ALERTA DE FOGO! {deteccoes}")

    if camera["url_webhook"]:
        threading.Thread(target=enviar_webhook, args=(
            camera["url_webhook"], alerta), daemon=True).start()


def monitorar(camera):
    id_camera = camera["id_camera"]
    sequencia = 0
    ultima_analise = 0
    ultimo_alerta = 0

    while camera["rodando"]:

        captura = cv2.VideoCapture(
            camera["url_rtsp"],
            cv2.CAP_FFMPEG,
            [cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
                cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000],
        )

        if not captura.isOpened():
            captura.release()
            camera["estado"] = "reconectando"
            camera["erro"] = "não consegui abrir o stream"
            camera["reconexoes"] += 1
            time.sleep(ESPERA_RECONEXAO)
            continue

        camera["estado"] = "monitorando"
        camera["erro"] = None
        print(f"[{id_camera}] conectado")

        while camera["rodando"]:

            deu_certo, frame = captura.read()
            if not deu_certo:
                camera["erro"] = "o stream foi interrompido"
                break

            if time.time() - ultima_analise < 0.5:
                continue
            ultima_analise = time.time()
            camera["ultima_analise_em"] = agora_texto()

            try:
                deteccoes = detectar_fogo(frame)

                if len(deteccoes) > 0:
                    sequencia = sequencia + 1
                else:
                    sequencia = 0

                if sequencia >= 10:
                    camera["fogo"] = True
                else:
                    camera["fogo"] = False

                passou_tempo = (
                    time.time() - ultimo_alerta) >= INTERVALO_ENTRE_ALERTAS
                if camera["fogo"] and passou_tempo:
                    ultimo_alerta = time.time()
                    criar_alerta(camera, frame, deteccoes)

            except Exception as erro:
                camera["erro"] = f"erro na análise: {erro}"
                print(f"[{id_camera}] erro na análise:")
                traceback.print_exc()
        captura.release()
        camera["fogo"] = False
        sequencia = 0

        if camera["rodando"]:
            print(f"[{id_camera}] stream caiu, reconectando...")
            camera["estado"] = "reconectando"
            camera["reconexoes"] += 1
            time.sleep(ESPERA_RECONEXAO)


def sem_foto(alerta):
    resumo = dict(alerta)
    resumo.pop("foto_base64", None)
    return resumo


def montar_status(camera):
    if len(camera["alertas"]) > 0:
        ultimo_alerta = sem_foto(camera["alertas"][-1])
    else:
        ultimo_alerta = None

    monitorando = camera["estado"] == "monitorando"

    return {
        "id_camera": camera["id_camera"],
        "url_rtsp": camera["url_rtsp"],
        "estado": camera["estado"],
        "monitorando": monitorando,
        "fogo_detectado": camera["fogo"] and monitorando,
        "iniciada_em": camera["iniciada_em"],
        "ultima_analise_em": camera["ultima_analise_em"],
        "reconexoes": camera["reconexoes"],
        "total_alertas": camera["total_alertas"],
        "ultimo_alerta": ultimo_alerta,
        "ultimo_erro": camera["erro"],
    }


def buscar_camera(id_camera):
    if id_camera not in cameras:
        raise HTTPException(404, f"câmera '{id_camera}' não encontrada")
    return cameras[id_camera]


@app.post("/yolo", status_code=201)
async def adicionar_camera(
    id_camera: str = Body(...),
    url_rtsp: str = Body(...),
    url_webhook: str = Body(None),
):
    if "/" in id_camera or "\\" in id_camera or ".." in id_camera:
        raise HTTPException(400, "id_camera não pode ter barras nem '..'")
    if not url_rtsp.startswith("rtsp://"):
        raise HTTPException(400, "url_rtsp precisa começar com rtsp://")
    if id_camera in cameras:
        raise HTTPException(
            409, f"câmera '{id_camera}' já está sendo monitorada")
    if len(cameras) >= MAX_CAMERAS:
        raise HTTPException(503, f"limite de {MAX_CAMERAS} câmeras atingido")

    camera = {
        "id_camera": id_camera,
        "url_rtsp": url_rtsp,
        "url_webhook": url_webhook,
        "rodando": True,
        "estado": "iniciando",
        "iniciada_em": agora_texto(),
        "ultima_analise_em": None,
        "erro": None,
        "reconexoes": 0,
        "fogo": False,
        "alertas": [],
        "total_alertas": 0,
    }
    cameras[id_camera] = camera

    thread = threading.Thread(target=monitorar, args=(camera,), daemon=True)
    thread.start()

    return montar_status(camera)


@app.delete("/yolo/{id_camera}")
async def parar_camera(id_camera: str):
    camera = buscar_camera(id_camera)
    camera["rodando"] = False
    camera["estado"] = "parada"
    del cameras[id_camera]
    return {"id_camera": id_camera, "estado": "parada"}


@app.get("/yolo")
async def listar_cameras():
    lista = []
    for camera in cameras.values():
        lista.append(montar_status(camera))
    return lista


@app.get("/yolo/{id_camera}/status")
async def status_da_camera(id_camera: str):
    camera = buscar_camera(id_camera)
    return montar_status(camera)


@app.get("/yolo/{id_camera}/alertas")
async def alertas_da_camera(id_camera: str):
    camera = buscar_camera(id_camera)
    return list(reversed(camera["alertas"]))


@app.post("/yolo/sincronizar")
async def sincronizar_cameras(lista: list[dict] = Body(...)):
    for item in lista:
        id_camera = str(item.get("id_camera") or "")
        if id_camera == "":
            continue
        try:
            await adicionar_camera(
                id_camera=id_camera,
                url_rtsp=item.get("url_rtsp") or "",
                url_webhook=item.get("url_webhook"),
            )
        except HTTPException as erro:
            if erro.status_code != 409:
                print(f"[{id_camera}] sincronizar recusou: {erro.detail}")
