package com.safenest.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id_alerta")
    private Long id;

    @Column(name = "tipo_alerta")
    private String tipoAlerta;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "data_hora")
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(name = "imagem_url")
    private String imagemUrl;

}
