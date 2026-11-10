
package com.safenest.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safenest.dto.CameraResponse;
import com.safenest.model.Alerta;
import com.safenest.model.Camera;
import com.safenest.repository.AlertaRepository;
import com.safenest.repository.CamerasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CameraService {

    private final CamerasRepository repository;
    private final AlertaRepository alertaRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${safenest.ia.url:http://localhost:8000}")
    private String iaUrl;

    @Value("${safenest.webhook.url:http://localhost:8080/cameras/alerta}")
    private String webhookUrl;

    private RestClient clienteIa() {
        return RestClient.builder()
                .baseUrl(iaUrl)
                .build();
    }

    private Camera buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Câmera não encontrada"
                ));
    }

    public List<CameraResponse> listarPorUsuario(Long idUsuario) {
        return repository.findByIdUsuario(idUsuario)
                .stream()
                .map(CameraResponse::from)
                .toList();
    }

    public CameraResponse criar(Camera dados) {
        if (
                dados.getIdUsuario() == null ||
                        dados.getEndereco() == null ||
                        dados.getEndereco().isBlank() ||
                        !dados.getEndereco().startsWith("rtsp://")
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe idUsuario e uma URL RTSP válida"
            );
        }

        Camera camera = new Camera();

        camera.setIdUsuario(dados.getIdUsuario());
        camera.setEndereco(dados.getEndereco());
        camera.setNomeUsuario(dados.getNomeUsuario());
        camera.setStatus("pendente");
        camera.setDataHora(LocalDateTime.now());

        camera = repository.save(camera);

        try {
            sincronizarCameraComIa(camera.getId());
            camera.setStatus("iniciando");

        } catch (ResponseStatusException erro) {
            camera.setStatus("offline");
        }

        return CameraResponse.from(repository.save(camera));
    }

    public CameraResponse atualizar(Long id, Camera dados) {
        Camera camera = buscar(id);

        boolean mudouEndereco = false;

        if (dados.getNomeUsuario() != null) {
            camera.setNomeUsuario(dados.getNomeUsuario());
        }

        if (
                dados.getEndereco() != null &&
                        !dados.getEndereco().equals(camera.getEndereco())
        ) {
            if (!dados.getEndereco().startsWith("rtsp://")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "URL RTSP inválida"
                );
            }

            camera.setEndereco(dados.getEndereco());
            camera.setStatus("pendente");

            mudouEndereco = true;
        }

        repository.save(camera);

        if (mudouEndereco) {
            pararNaIa(id);

            try {
                sincronizarCameraComIa(id);
                camera.setStatus("iniciando");

            } catch (ResponseStatusException erro) {
                camera.setStatus("offline");
            }

            repository.save(camera);
        }

        return CameraResponse.from(camera);
    }

    public void deletar(Long id) {
        Camera camera = buscar(id);

        pararNaIa(id);

        repository.delete(camera);
    }

    private void pararNaIa(Long id) {
        try {
            clienteIa()
                    .delete()
                    .uri("/yolo/{id}", id)
                    .retrieve()
                    .toBodilessEntity();

        } catch (
                org.springframework.web.client.HttpClientErrorException.NotFound erro
        ) {
            // A câmera já não está registrada na IA.

        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não foi possível interromper a câmera na IA",
                    erro
            );
        }
    }

    public Map<String, Object> buscarStatus(Long id) {
        buscar(id);

        try {
            Map<String, Object> status = statusDaIa(id);

            return Map.of(
                    "id", id,
                    "status", status.getOrDefault(
                            "estado", "desconhecido"
                    ),
                    "monitorando", status.getOrDefault(
                            "monitorando", false
                    ),
                    "fogo_detectado", status.getOrDefault(
                            "fogo_detectado", false
                    )
            );

        } catch (ResponseStatusException erro) {
            if (erro.getStatusCode().value() == 404) {
                return Map.of(
                        "id", id,
                        "status", "offline",
                        "monitorando", false,
                        "fogo_detectado", false
                );
            }

            throw erro;
        }
    }

    public Map<String, Object> sincronizarComIa(Long idUsuario) {
        List<Camera> lista = repository.findByIdUsuario(idUsuario);

        return enviarParaIa(lista);
    }

    public Map<String, Object> sincronizarCameraComIa(Long id) {
        return enviarParaIa(List.of(buscar(id)));
    }

    private Map<String, Object> enviarParaIa(List<Camera> lista) {
        List<Map<String, Object>> cameras = new ArrayList<>();

        for (Camera camera : lista) {
            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id_camera", camera.getId().toString());
            item.put("url_rtsp", camera.getEndereco());
            item.put("url_webhook", webhookUrl);

            cameras.add(item);
        }

        try {
            String json = objectMapper.writeValueAsString(cameras);

            String enderecoIa =
                    iaUrl.replaceAll("/+$", "") + "/yolo/sincronizar";


            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(enderecoIa))
                    .version(HttpClient.Version.HTTP_1_1)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(
                            HttpRequest.BodyPublishers.ofString(
                                    json,
                                    StandardCharsets.UTF_8
                            )
                    )
                    .build();

            HttpClient client = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(
                            StandardCharsets.UTF_8
                    )
            );


            if (
                    response.statusCode() < 200 ||
                            response.statusCode() >= 300
            ) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "IA retornou HTTP " +
                                response.statusCode() +
                                ": " + response.body()
                );
            }

            if (
                    response.body() == null ||
                            response.body().isBlank()
            ) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "A IA retornou uma resposta vazia"
                );
            }

            return objectMapper.readValue(
                    response.body(),
                    new TypeReference<Map<String, Object>>() {}
            );

        } catch (ResponseStatusException erro) {
            throw erro;

        } catch (InterruptedException erro) {
            Thread.currentThread().interrupt();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Comunicação com a IA interrompida",
                    erro
            );

        } catch (Exception erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Falha na comunicação com a IA",
                    erro
            );
        }
    }

    public Map<String, Object> statusDaIa(Long id) {
        buscar(id);

        try {
            Map<String, Object> resposta = clienteIa()
                    .get()
                    .uri("/yolo/{id}/status", id)
                    .retrieve()
                    .body(
                            new ParameterizedTypeReference<
                                    Map<String, Object>
                                    >() {}
                    );

            if (resposta == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Resposta vazia da IA"
                );
            }

            resposta.remove("url_rtsp");

            return resposta;

        } catch (
                org.springframework.web.client.HttpClientErrorException.NotFound erro
        ) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Câmera não sincronizada com a IA"
            );

        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Falha na comunicação com a IA",
                    erro
            );
        }
    }

    public byte[] ultimaFotoDaIa(Long id) {
        buscar(id);

        try {
            List<Map<String, Object>> alertas = clienteIa()
                    .get()
                    .uri("/yolo/{id}/alertas", id)
                    .retrieve()
                    .body(
                            new ParameterizedTypeReference<
                                    List<Map<String, Object>>
                                    >() {}
                    );

            if (alertas == null || alertas.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Nenhum alerta encontrado"
                );
            }

            Object foto = alertas.get(0).get("foto_base64");

            if (
                    !(foto instanceof String base64) ||
                            base64.isBlank()
            ) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "O alerta não possui imagem"
                );
            }

            return Base64.getDecoder().decode(base64);

        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Erro ao consultar a IA",
                    erro
            );
        }
    }

    @Value("${mediamtx.url}")
    private String mediaMtxUrl;

    public String urlVideo(Long id) {
        Camera camera = buscar(id);

        URI uri = URI.create(camera.getEndereco());

        return mediaMtxUrl.replaceAll("/+$", "")
                + uri.getPath() + "/";
    }

    public void registrarAlertaFogo(Map<String, Object> dados) {
        Long idCamera;
        Long numero;

        try {
            idCamera = Long.valueOf(
                    String.valueOf(dados.get("id_camera"))
            );

            numero = Long.valueOf(
                    String.valueOf(dados.get("numero"))
            );

        } catch (NumberFormatException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dados do alerta inválidos",
                    erro
            );
        }

        Camera camera = buscar(idCamera);

        if (
                alertaRepository.existsByIdCameraAndNumeroAlerta(
                        idCamera,
                        numero
                )
        ) {
            return;
        }

        Alerta alerta = new Alerta();

        alerta.setIdUsuario(camera.getIdUsuario());
        alerta.setIdCamera(idCamera);
        alerta.setNumeroAlerta(numero);
        alerta.setTipoAlerta("fogo");
        alerta.setDataHora(LocalDateTime.now());

        Object foto = dados.get("foto_base64");

        if (
                foto instanceof String base64 &&
                        !base64.isBlank()
        ) {
            alerta.setImagemUrl(
                    "data:image/jpeg;base64," + base64
            );
        }

        alertaRepository.save(alerta);
        //remover
        System.out.println("FOTO RECEBIDA: " + (foto != null));
        System.out.println("TIPO DA FOTO: " +
                (foto != null ? foto.getClass().getName() : "null"));

        System.out.println("TAMANHO DA IMAGEM: " +
                (alerta.getImagemUrl() != null
                        ? alerta.getImagemUrl().length()
                        : 0));

        System.out.println("INÍCIO DA IMAGEM: " +
                (alerta.getImagemUrl() != null
                        ? alerta.getImagemUrl().substring(
                        0,
                        Math.min(30, alerta.getImagemUrl().length()))
                        : "null"));
    }
// até
    public List<Alerta> listarAlertasDoUsuario(Long idUsuario) {
        return alertaRepository
                .findByIdUsuarioOrderByIdDesc(idUsuario);
    }
}
