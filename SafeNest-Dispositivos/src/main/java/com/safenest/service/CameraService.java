package com.safenest.service;

import com.safenest.model.Camera;
import com.safenest.repository.CamerasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CameraService {

    private final CamerasRepository repository;
    private String iaUrl = "http://localhost:8013";
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
        List<Map<String, Object>> cameras = repository.findByIdUsuario(idUsuario)
                .stream()
                .map(camera -> {
                    // LinkedHashMap aceita null (câmera sem endereço); Map.of não
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id_camera", String.valueOf(camera.getId()));
                    item.put("url_rtsp", camera.getEndereco());
                    return item;
                })
                .toList();

        try {
            return RestClient.create(iaUrl)
                    .post()
                    .uri("/yolo/sincronizar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cameras)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (RestClientException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY, "Nao foi possivel se conectar com a api");
        }
    }
    private Camera buscarTratar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Câmera não encontrada"));
    }
}