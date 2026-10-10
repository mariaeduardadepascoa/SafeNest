package com.safenest.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Cameras")
@Getter
@Setter
@NoArgsConstructor
public class Camera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id")
    private Long id;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "endereco")
    private String endereco;

    private String status;

    @Column(name = "nome_usuario")
    private String nomeUsuario;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

}
