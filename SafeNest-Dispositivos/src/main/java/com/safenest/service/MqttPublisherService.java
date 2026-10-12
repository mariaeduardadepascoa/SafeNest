
package com.safenest.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

@Service
public class MqttPublisherService {

    private final MqttClient mqttClient;

    public MqttPublisherService(MqttClient mqttClient) {
        this.mqttClient = mqttClient;
    }

    public void publish(String topico, String payload) {
        try {
            if (!mqttClient.isConnected()) {
                System.err.println("Cliente MQTT desconectado.");
                return;
            }
            MqttMessage mensagem =
                    new MqttMessage(payload.getBytes());

            mensagem.setQos(1);

            mqttClient.publish(topico, mensagem);

            System.out.println(
                    "Mensagem MQTT publicada: " + payload
            );

        } catch (MqttException e) {
            System.err.println(
                    "Erro ao publicar mensagem MQTT: "
                            + e.getMessage()
            );
        }
    }
}
