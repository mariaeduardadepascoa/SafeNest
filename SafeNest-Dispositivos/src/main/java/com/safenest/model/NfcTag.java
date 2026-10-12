package com.safenest.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "nfc_tags")
public class NfcTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tag")
    private Long idTag;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "uid_nfc")
    private String uidNfc;

    @Column(name = "id_fechadura")
    private Long idFechadura;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    @Column(name = "nome_tag")
    private String nomeTag;

}
