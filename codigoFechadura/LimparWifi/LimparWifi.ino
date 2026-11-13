#include <WiFiManager.h>

// Programa temporário: apaga o Wi-Fi salvo e abre a configuração da rede.
// Na Arduino IDE, instale a biblioteca WiFiManager, de tzapu.
// Depois de usar, envie novamente o programa original da fechadura.
// Este programa não controla a fechadura nem apaga tokens salvos separadamente.

void setup() {
  Serial.begin(115200);

  WiFiManager gerenciadorWifi;

  Serial.println("Apagando a rede e a senha Wi-Fi salvas...");
  gerenciadorWifi.resetSettings();

  Serial.println("Conecte o celular à rede SafeNest-Setup.");
  Serial.println("Se a configuração não abrir, acesse http://192.168.4.1.");
  gerenciadorWifi.autoConnect("SafeNest-Setup");

  Serial.println("Wi-Fi configurado. Envie novamente o programa original da fechadura.");
}

void loop() {
  // Não reinicie mantendo este programa: ele apaga o Wi-Fi a cada inicialização.
  delay(1000);
}
