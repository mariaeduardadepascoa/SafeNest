package com.safenest.repository;

import com.safenest.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByIdUsuario(Long idUsuario);
}
