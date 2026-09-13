package com.safenest.repository;

import com.safenest.model.NfcTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NfcTagRepository extends JpaRepository<NfcTag, Long> {
    Optional<NfcTag> findByUidNfcAndIdFechadura(String uidNfc, Long idFechadura);
}
