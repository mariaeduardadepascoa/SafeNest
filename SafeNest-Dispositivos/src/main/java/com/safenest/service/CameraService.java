package com.safenest.service;

import com.safenest.model.Alerta;
import com.safenest.model.Camera;
import com.safenest.repository.AlertaRepository;
import com.safenest.repository.CamerasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import java.util.Comparator;
import java.net.http.HttpClient;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CameraService {

    private final CamerasRepository repository;
    private final AlertaRepository alertaRepository;

    private String iaUrl = "${safenest.ia.url:http://localhost:8000}";

    private String webhookUrl = "${safenest.webhook.url:http://localhost:8080/cameras/alerta}";

    public List<Camera> listarPorUsuario(Long idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }

    public Camera criar(Camera camera) {
        camera.setId(null);
        camera.setDataHora(LocalDateTime.now());
        return repository.save(camera);
    }

    public Camera atualizar(Long id, Camera dados) {
        Camera camera = buscarTratar(id);

        if (dados.getNomeUsuario() != null) {
            camera.setNomeUsuario(dados.getNomeUsuario());
        }
        if (dados.getEndereco() != null) {
            camera.setEndereco(dados.getEndereco());
        }
        if (dados.getStatus() != null) {
            camera.setStatus(dados.getStatus());
        }

        return repository.save(camera);
    }

    public void deletar(Long id) {
        repository.delete(buscarTratar(id));
    }

    public Map<String, Object> buscarStatus(Long id) {
        Camera camera = buscarTratar(id);
        return Collections.singletonMap("status", camera.getStatus());
    }

    public Map<String, Object> sincronizarComIa(Long idUsuario) {
        return enviarParaIa(repository.findByIdUsuario(idUsuario));
    }

    public Map<String, Object> sincronizarCameraComIa(Long id) {
        return enviarParaIa(List.of(buscarTratar(id)));
    }

    private Map<String, Object> enviarParaIa(List<Camera> lista) {
        List<Map<String, Object>> cameras = lista
                .stream()
                .map(camera -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id_camera", String.valueOf(camera.getId()));
                    item.put("url_rtsp", camera.getEndereco());
                    item.put("url_webhook", webhookUrl);
                    return item;
                })
                .toList();

        try {
            return clienteIa()
                    .post()
                    .uri("/yolo/sincronizar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cameras)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não consegui falar com a API de IA: " + erro.getMessage(),
                    erro);
        }
    }

    public Map<String, Object> statusDaIa(Long id) {
        buscarTratar(id);

        try {
            return clienteIa()
                    .get()
                    .uri("/yolo/{id}/status", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (HttpClientErrorException.NotFound erro) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Essa câmera não está sendo monitorada pela IA. Sincronize primeiro.");
        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não consegui falar com a API de IA: " + erro.getMessage(),
                    erro);
        }
    }

    public byte[] ultimaFotoDaIa(Long id) {
        buscarTratar(id);

        List<Map<String, Object>> alertas;
        try {
            alertas = clienteIa()
                    .get()
                    .uri("/yolo/{id}/alertas", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        } catch (HttpClientErrorException.NotFound erro) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Essa câmera não está sendo monitorada pela IA. Sincronize primeiro.");
        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não consegui falar com a API de IA: " + erro.getMessage(),
                    erro);
        }

        if (alertas == null || alertas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Essa câmera ainda não gerou nenhum alerta");
        }

        Object foto = alertas.get(0).get("foto_base64");
        if (!(foto instanceof String base64)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "O último alerta não tem foto");
        }
        return Base64.getDecoder().decode(base64);
    }

    private RestClient clienteIa() {
        return RestClient.builder()
                .baseUrl(iaUrl)
                .requestFactory(new JdkClientHttpRequestFactory(
                        HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build()))
                .build();
    }

    public void registrarAlertaFogo(Map<String, Object> dados) {
        Long idCamera;
        try {
            idCamera = Long.valueOf(String.valueOf(dados.get("id_camera")));
        } catch (NumberFormatException erro) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_camera inválido");
        }

        Camera camera = buscarTratar(idCamera);

        Alerta alerta = new Alerta();
        alerta.setTipoAlerta("fogo");
        alerta.setIdUsuario(camera.getIdUsuario());
        alerta.setImagemUrl(fotoParaBanco(dados.get("foto_base64")));
        alertaRepository.save(alerta);
    }

    private String fotoParaBanco(Object fotoBase64) {
        if (fotoBase64 instanceof String base64 && !base64.isBlank()) {
            return "data:image/jpeg;base64," + base64;
        }
        return null;
    }
    public List<Alerta> listarAlertasDoUsuario(Long idUsuario) {
        return alertaRepository.findByIdUsuario(idUsuario)
                .stream()
                .sorted(Comparator.comparing(Alerta::getId).reversed())
                .toList();
    }
    private Camera buscarTratar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Câmera não encontrada"));
    }

}