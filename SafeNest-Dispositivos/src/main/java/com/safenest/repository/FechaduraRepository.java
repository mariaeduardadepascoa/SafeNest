package com.safenest.repository;

import com.safenest.model.Fechadura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FechaduraRepository extends JpaRepository<Fechadura, Long> {
    Optional<Fechadura> findByMacAddress(String macAddress);
    Optional<Fechadura> findByIdUsuario(Long idUsuario);
}
