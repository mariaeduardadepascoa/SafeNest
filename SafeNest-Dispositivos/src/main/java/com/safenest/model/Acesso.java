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
@Table(name = "acessos")
public class Acesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id_acesso")
    private Long id;

    @Column(name = "id_tag")
    private Long idTag;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "data_hora")
    private LocalDateTime dataHora = LocalDateTime.now();

}
