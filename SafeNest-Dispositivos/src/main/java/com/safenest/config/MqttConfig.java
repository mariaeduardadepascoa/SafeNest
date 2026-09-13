package com.safenest.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MqttConfig {

    @Value("${broker.host}")
    private String brokerHost;

    @Value("${broker.port}")
    private int brokerPort;

    @Value("${broker.username}")
    private String brokerUsername;

    @Value("${broker.password}")
    private String brokerPassword;

    @Bean
    public MqttClient mqttClient() throws MqttException {
        String brokerUrl = "ssl://" + brokerHost + ":" + brokerPort; // equivalente ao protocol: "mqtts"

        MqttClient client = new MqttClient(
                brokerUrl,
                MqttClient.generateClientId(),
                new MemoryPersistence()
        );

        MqttConnectOptions options = new MqttConnectOptions();
        options.setUserName(brokerUsername);
        options.setPassword(brokerPassword.toCharArray());
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);

        client.connect(options);
        return client;
    }
}
