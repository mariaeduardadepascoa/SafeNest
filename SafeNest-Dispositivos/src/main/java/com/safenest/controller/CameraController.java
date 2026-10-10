package com.safenest.controller;

import com.safenest.model.Alerta;
import com.safenest.model.Camera;
import com.safenest.service.CameraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cameras")
@RequiredArgsConstructor
public class CameraController {

    private final CameraService service;

    @GetMapping("/usuario/{idUsuario}")
    public List<Camera> listarPorUsuario(@PathVariable Long idUsuario) {
        return service.listarPorUsuario(idUsuario);
    }

    @PostMapping("/usuario")
    @ResponseStatus(HttpStatus.CREATED)
    public Camera criar(@RequestBody Camera camera) {
        return service.criar(camera);
    }

    @PutMapping("/{id}")
    public Camera atualizar(@PathVariable Long id, @RequestBody Camera camera) {
        return service.atualizar(id, camera);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    @GetMapping("/{id}/status")
    public Map<String, Object> buscarStatus(@PathVariable Long id) {
        return service.buscarStatus(id);
    }

    @PostMapping("/usuario/{idUsuario}/sincronizar")
    public Map<String, Object> sincronizar(@PathVariable Long idUsuario) {
        return service.sincronizarComIa(idUsuario);
    }

    @GetMapping("/{id}/ia/status")
    public Map<String, Object> statusDaIa(@PathVariable Long id) {
        return service.statusDaIa(id);
    }

    @GetMapping(value = "/{id}/ia/foto", produces = MediaType.IMAGE_JPEG_VALUE)
    public byte[] fotoDoUltimoAlerta(@PathVariable Long id) {
        return service.ultimaFotoDaIa(id);
    }

    @PostMapping("/{id}/sincronizar")
    public Map<String, Object> sincronizarCamera(@PathVariable Long id) {
        return service.sincronizarCameraComIa(id);
    }
    @PostMapping("/alerta")
    @ResponseStatus(HttpStatus.CREATED)
    public void alerta(@RequestBody Map<String, Object> dados) {
        service.registrarAlertaFogo(dados);
    }
    @GetMapping("/alertas/usuario/{idUsuario}")
    public List<Alerta> alertasDoUsuario(@PathVariable Long idUsuario) {
        return service.listarAlertasDoUsuario(idUsuario);
    }
}
