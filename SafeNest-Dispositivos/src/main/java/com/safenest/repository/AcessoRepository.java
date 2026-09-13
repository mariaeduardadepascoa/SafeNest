package com.safenest.repository;

import com.safenest.model.Acesso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcessoRepository extends JpaRepository<Acesso, Long> {
    List<Acesso> findByIdUsuario(Long idUsuario);
}
