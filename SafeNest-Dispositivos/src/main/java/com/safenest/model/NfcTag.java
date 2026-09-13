package com.safenest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

    public Long getIdTag() { return idTag; }
    public void setIdTag(Long idTag) { this.idTag = idTag; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getUidNfc() { return uidNfc; }
    public void setUidNfc(String uidNfc) { this.uidNfc = uidNfc; }

    public Long getIdFechadura() { return idFechadura; }
    public void setIdFechadura(Long idFechadura) { this.idFechadura = idFechadura; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public String getNomeTag() { return nomeTag; }
    public void setNomeTag(String nomeTag) { this.nomeTag = nomeTag; }
}
