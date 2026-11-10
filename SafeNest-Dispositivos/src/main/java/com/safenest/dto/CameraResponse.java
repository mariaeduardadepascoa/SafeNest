
package com.safenest.dto;

import com.safenest.model.Camera;

public record CameraResponse(
        Long id,
        Long idUsuario,
        String nomeUsuario,
        String status
) {
    public static CameraResponse from(Camera camera) {
        return new CameraResponse(
                camera.getId(),
                camera.getIdUsuario(),
                camera.getNomeUsuario(),
                camera.getStatus()
        );
    }
}
