package com.safenest.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.safenest.model.NfcTag;
import com.safenest.service.DispositivosService;
import com.safenest.service.MqttListenerService;
import com.safenest.service.SalaDeEsperaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@RestController
@RequestMapping("/fechadura")
public class FechaduraController {

    private final DispositivosService dispositivosService;
    private final SalaDeEsperaService salaDeEsperaService;
    private final MqttListenerService mqttListenerService;

    public FechaduraController(DispositivosService dispositivosService,
                                SalaDeEsperaService salaDeEsperaService,
                                MqttListenerService mqttListenerService) {
        this.dispositivosService = dispositivosService;
        this.salaDeEsperaService = salaDeEsperaService;
        this.mqttListenerService = mqttListenerService;
    }

    // POST /fechadura/tag  { "nome_dono": "..." }
    @PostMapping("/tag")
    public ResponseEntity<?> cadastrarTag(HttpServletRequest request, @RequestBody Map<String, String> body) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        String nomeDono = body.get("nome_dono");
        if (nomeDono == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem nome do dono"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }

        String address = dispositivosService.buscarFechadura(idFechadura);
        if (address == null) {
            return ResponseEntity.status(404).body(Map.of("erro", "Fechadura não encontrada"));
        }

        String correlationId = UUID.randomUUID().toString();

        mqttListenerService.publish(
                "fechadura/" + address + "/comando",
                "{\"comando\":\"registrartag\",\"correlationId\":\"" + correlationId + "\"}"
        );

        try {
            JsonNode resposta = (JsonNode) salaDeEsperaService
                    .aguardarResposta(correlationId, 8000)
                    .get(8, TimeUnit.SECONDS);

            String tagUid = resposta.get("tag_uid").asText();

            NfcTag registro = dispositivosService.salvarRegistroNoBanco(idUsuario, tagUid, idFechadura, nomeDono);
            if (registro == null) {
                return ResponseEntity.status(500).body(Map.of("erro", "Erro ao salvar tag no banco"));
            }

            return ResponseEntity.ok(Map.of(
                    "mensagem", "tag cadastrada com sucesso!",
                    "resposta", resposta
            ));

        } catch (TimeoutException | ExecutionException | InterruptedException e) {
            return ResponseEntity.status(504).body(Map.of("erro", "fechadura não respondeu a tempo"));
        }
    }

    // GET /fechadura/status
    @GetMapping("/status")
    public ResponseEntity<?> statusFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }

        Boolean blocked = dispositivosService.verificarTrancada(idFechadura);
        if (blocked == null) {
            return ResponseEntity.status(404).body(Map.of("erro", "Fechadura não encontrada"));
        }

        return ResponseEntity.ok(Map.of("blocked", blocked));
    }

    // POST /fechadura/abrir
    @PostMapping("/abrir")
    public ResponseEntity<?> abrirFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }

        String address = dispositivosService.buscarFechadura(idFechadura);
        if (address == null) {
            return ResponseEntity.status(404).body(Map.of("erro", "Fechadura nao encontrada"));
        }

        mqttListenerService.publish("fechadura/" + address + "/comando", "{\"comando\":\"abrirfechadura\"}");

        return ResponseEntity.ok(Map.of("mensagem", "comando de abrir enviado"));
    }

    // DELETE /fechadura
    @DeleteMapping
    public ResponseEntity<?> removerFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem id"));
        }

        boolean deletado = dispositivosService.removerFechaduraDoBanco(idFechadura);
        if (!deletado) {
            return ResponseEntity.status(404).body(Map.of("erro", "Não foi possivel remover a fechadura"));
        }

        return ResponseEntity.ok(Map.of("mensagem", "fechadura removida"));
    }

    // POST /fechadura/travar
    @PostMapping("/travar")
    public ResponseEntity<?> travarFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }

        String address = dispositivosService.buscarFechadura(idFechadura);
        if (address == null) {
            return ResponseEntity.status(404).body(Map.of("erro", "Fechadura nao encontrada"));
        }

        mqttListenerService.publish("fechadura/" + address + "/comando", "{\"comando\":\"travar\"}");
        dispositivosService.atualizarStatusFechadura(idFechadura, true);

        return ResponseEntity.ok(Map.of("mensagem", "fechadura travada"));
    }

    // POST /fechadura/destravar
    @PostMapping("/destravar")
    public ResponseEntity<?> destravarFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem usuario"));
        }

        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        if (idFechadura == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }

        String address = dispositivosService.buscarFechadura(idFechadura);
        if (address == null) {
            return ResponseEntity.status(404).body(Map.of("erro", "Fechadura nao encontrada"));
        }

        mqttListenerService.publish("fechadura/" + address + "/comando", "{\"comando\":\"destravar\"}");
        dispositivosService.atualizarStatusFechadura(idFechadura, false);

        return ResponseEntity.ok(Map.of("mensagem", "fechadura destravada"));
    }

    // GET /fechadura
    @GetMapping
    public ResponseEntity<?> listarFechadura(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        Long idFechadura = dispositivosService.buscarFechaduraPorUsuario(idUsuario);
        return ResponseEntity.ok(Collections.singletonMap("id_fechadura", idFechadura));
    }

    // GET /fechadura/acessos
    @GetMapping("/acessos")
    public ResponseEntity<?> listarAcessos(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }
        return ResponseEntity.ok(dispositivosService.obterAcessos(idUsuario));
    }

    // GET /fechadura/alertas
    @GetMapping("/alertas")
    public ResponseEntity<?> listarAlertas(HttpServletRequest request) {
        Long idUsuario = (Long) request.getAttribute("id_usuario");
        if (idUsuario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "requisição sem ID"));
        }
        return ResponseEntity.ok(dispositivosService.obterAlertas(idUsuario));
    }

    // POST /fechadura/incendio - chamado pelo proprio ESP, sem JWT de usuario (ver WebConfig)
    @PostMapping("/incendio")
    public ResponseEntity<?> receberIncendio(@RequestBody Map<String, Object> body) {
        Number nivelGas = (Number) body.get("nivelGas");
        System.out.println("Sensor de gás reportou nível: " + nivelGas);

        if (nivelGas != null && nivelGas.doubleValue() > 400) {
            return ResponseEntity.status(201).body(Map.of(
                    "alarme_disparado", true,
                    "mensagem", "Fumaça/Gás detectado! Alerta enviado."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "alarme_disparado", false,
                "mensagem", "Níveis de gás normais."
        ));
    }
}
