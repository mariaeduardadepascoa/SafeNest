package com.safenest.repository;
import com.safenest.model.Camera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.OptionalInt;

public interface CamerasRepository extends JpaRepository<Camera, Long> {
     List<Camera> findByIdUsuario(Long idUsuario);
}
