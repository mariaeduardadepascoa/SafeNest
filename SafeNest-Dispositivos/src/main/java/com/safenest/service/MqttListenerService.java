package com.safenest.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MqttListenerService implements MqttCallback {

    private final MqttClient mqttClient;
    private final DispositivosService dispositivosService;
    private final SalaDeEsperaService salaDeEsperaService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.secret}")
    private String jwtSecret;

    public MqttListenerService(MqttClient mqttClient,
                                DispositivosService dispositivosService,
                                SalaDeEsperaService salaDeEsperaService) {
        this.mqttClient = mqttClient;
        this.dispositivosService = dispositivosService;
        this.salaDeEsperaService = salaDeEsperaService;
    }

    // equivalente ao mqtt.client.on("connect", ...) + subscribe do Node
    @PostConstruct
    public void iniciar() throws MqttException {
        mqttClient.setCallback(this);
        mqttClient.subscribe(new String[]{
                "fechadura/+/resposta",
                "fechadura/+/heartbeat",
                "fechadura/+/readTag",
                "fechadura/+/cadastrarFechadura"
        });
        System.out.println("Escutando tópicos das fechaduras");
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.err.println("Erro na conexão MQTT: " + cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String[] partes = topic.split("/"); // ["fechadura", "<endereco>", "<tipo>"]
        String endereco = partes[1];
        String tipo = partes[2];
        String payloadStr = new String(message.getPayload());

        switch (tipo) {
            case "heartbeat" -> System.out.println("Fechadura " + endereco + " está online (heartbeat)");
            case "cadastrarFechadura" -> tratarCadastrarFechadura(payloadStr);
            case "resposta" -> tratarResposta(payloadStr, topic);
            case "readTag" -> tratarReadTag(payloadStr);
            default -> System.out.println("Mensagem em tópico não tratado: " + topic + " " + payloadStr);
        }
    }

    private void tratarCadastrarFechadura(String payloadStr) {
        try {
            JsonNode payload = objectMapper.readTree(payloadStr);
            String deviceAddress = payload.get("device_address").asText();

            Long idFechadura = dispositivosService.buscarFechaduraPorMacAddress(deviceAddress);
            if (idFechadura != null) {
                String address = dispositivosService.buscarFechadura(idFechadura);
                Boolean bloqueada = dispositivosService.verificarTrancada(idFechadura);
                String comando = Boolean.TRUE.equals(bloqueada) ? "travar" : "destravar";

                publish("fechadura/" + address + "/comando",
                        objectMapper.writeValueAsString(Map.of("comando", comando)));
                return;
            }

            Long userId = verificarToken(payload.get("user_id").asText());
            if (userId == null) return;

            dispositivosService.cadastrarFechaduraNoBanco(deviceAddress, userId);
            dispositivosService.addAlerta("FECHADURANOVA", userId);

        } catch (Exception erro) {
            System.err.println("Erro ao cadastrar fechadura no banco: " + erro.getMessage());
        }
    }

    private void tratarResposta(String payloadStr, String topic) {
        try {
            JsonNode payload = objectMapper.readTree(payloadStr);
            if (payload.has("correlationId")) {
                salaDeEsperaService.resolverResposta(payload.get("correlationId").asText(), payload);
            } else {
                System.out.println("Resposta sem correlationId recebida em " + topic + " " + payload);
            }
        } catch (Exception erro) {
            System.err.println("Erro ao processar resposta MQTT: " + erro.getMessage());
        }
    }

    private void tratarReadTag(String payloadStr) {
        try {
            JsonNode payload = objectMapper.readTree(payloadStr);
            String deviceAddress = payload.get("device_address").asText();
            String tag = payload.get("tag_uid").asText();

            Long idFechadura = dispositivosService.buscarFechaduraPorMacAddress(deviceAddress);
            System.out.println("idFechadura encontrado: " + idFechadura);

            if (idFechadura == null) {
                System.out.println("Fechadura não encontrada");
                return;
            }

            Long usuario = dispositivosService.buscarUsuarioPorFechadura(idFechadura);

            System.out.println("Verificando tag: " + tag + " na fechadura: " + idFechadura);
            boolean verify = dispositivosService.verificarTag(tag, idFechadura);
            System.out.println("Resultado da verificação: " + verify);

            if (!verify) {
                publish("fechadura/" + deviceAddress + "/comando",
                        objectMapper.writeValueAsString(Map.of("comando", "acessonegado")));
                dispositivosService.addAlerta("ACESSONEGADO", usuario);
            } else {
                publish("fechadura/" + deviceAddress + "/comando",
                        objectMapper.writeValueAsString(Map.of("comando", "abrirfechadura")));
                dispositivosService.addAcesso(tag, usuario);
            }

        } catch (Exception erro) {
            System.err.println("Erro ao processar mensagem readTag: " + erro.getMessage());
        }
    }

    private Long verificarToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("id_usuario", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    // equivalente a função publish() exportada no Node
    public void publish(String topico, String payload) {
        try {
            mqttClient.publish(topico, new MqttMessage(payload.getBytes()));
        } catch (MqttException e) {
            System.err.println("Erro ao publicar mensagem MQTT: " + e.getMessage());
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // sem tratamento necessário
    }
}
