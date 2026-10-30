package com.safenest.repository;

import com.safenest.model.NfcTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NfcTagRepository extends JpaRepository<NfcTag, Long> {

    Optional<NfcTag> findByUidNfcAndIdFechadura(String uidNfc, Long idFechadura);

    List<NfcTag> findByIdUsuario(Long idUsuario);

    Optional<NfcTag> findByIdTagAndIdUsuario(Long idTag, Long idUsuario);
}