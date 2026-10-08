package com.safenest.dto;

import com.safenest.model.Camera;

public record CameraResponse(
        Long id,
        Long idUsuario,
        String nomeUsuario,
        String status,
        String endereco
) {
    public static CameraResponse from(Camera c) {
        return new CameraResponse(
                c.getId(),
                c.getIdUsuario(),
                c.getNomeUsuario(),
                c.getStatus(),
                c.getEndereco()
        );
    }
}