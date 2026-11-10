
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
    @Column(name = "id_alerta")
    private Long id;

    @Column(name = "tipo_alerta")
    private String tipoAlerta;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_camera")
    private Long idCamera;

    @Column(name = "data_hora")
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(name = "imagem_url", columnDefinition = "TEXT")
    private String imagemUrl;

    @Column(name = "numero_alerta")
    private Long numeroAlerta;
}
    