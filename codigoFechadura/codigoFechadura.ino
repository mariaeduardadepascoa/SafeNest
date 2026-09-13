#include <WiFiManager.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include "secrets.h"

//==================== MQTT ====================

WiFiClientSecure espClient;
PubSubClient mqtt(espClient);

//==================== WiFi ====================

WiFiManager internet;
WiFiManagerParameter campo_user_id("user_id", "User ID", "", 512);
String userId;

//==================== RFID ====================

const int rfid_rst = 22;
const int rfid_sda = 5;

MFRC522 rfid(rfid_sda, rfid_rst);

//==================== Pinos ====================

const int led_vermelho = 26;
const int led_verde = 27;
const int buzzer = 25;
const int rele = 4;

//==================== Variáveis ====================

String uid;
String deviceAddress;

String topicComando;
String topicResposta;
String correlationId;

String lockState;

bool modoCadastro = false;
unsigned long inicioCadastro = 0;
const unsigned long TIMEOUT_CADASTRO = 8000; 

//====================================================

void conectarWiFi() {

  internet.addParameter(&campo_user_id);

  internet.setHostname("Fechadura-SafeNest");

  internet.setTitle("Wifi Manager");

  std::vector<const char *> wm_menu = { "wifi" };
  internet.setMenu(wm_menu);

  const char* customHead = R"rawliteral(
<style>
    :root{
        --wfm-bg:#F8FAFC;
        --wfm-surface:#FFFFFF;
        --wfm-primary:#2B5081;
        --wfm-text:#252525;
        --wfm-border:#CDCDCD;
        --wfm-gray:#E7E9EC;
        --wfm-gray-text:#8A8F98;
    }
    * { box-sizing: border-box; }
    body{
        background:var(--wfm-bg) !important;
        color:var(--wfm-text) !important;
        font-family: Arial, sans-serif !important;
    }
    .wrap{
        text-align:left !important;
        width:92% !important;
        max-width:380px !important;
        margin:32px auto !important;
    }
    h1{
        font-size:24px !important;
        font-weight:700 !important;
        color:var(--wfm-text) !important;
        margin:0 0 4px !important;
    }

    .wfm-subtitle{
        font-size:15px;
        color:var(--wfm-text);
        margin:0 0 24px;
    }
    .wfm-circle {
    width: 120px !important;
    height: 120px !important;
    border-radius: 50% !important;

    background: var(--wfm-gray) !important;

    margin: 0 auto 28px !important;

    display: grid !important;
    place-items: center !important;
}

.wfm-circle svg {
    width: 100px !important;
    height: 100px !important;

    display: block !important;

    margin: 0 !important;
    padding: 0 !important;
}
    .wfm-steps{ margin-bottom:8px; }
    .wfm-step{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
    .wfm-step p{ margin:0; font-size:15px; color:var(--wfm-text); }
    .wfm-badge{
        flex:0 0 22px; width:22px; height:22px;
        border-radius:50%; background:var(--wfm-primary); color:#fff;
        font-size:12px; display:flex; align-items:center; justify-content:center;
    }

    label{
        display:block !important;
        font-size:14px !important;
        color:var(--wfm-text) !important;
        margin:14px 0 6px !important;
        font-weight:400 !important;
    }
    input:not([type="submit"]):not([type="button"]):not([type="checkbox"]){
    width:100% !important;
    padding:12px !important;
    height:auto !important;

    background:var(--wfm-surface) !important;
    color:var(--wfm-text) !important;

    border:2px solid var(--wfm-border) !important;
    border-radius:10px !important;

    outline:none !important;
    box-shadow:none !important;

    font-size:15px !important;
    font-family:Arial, sans-serif !important;

    margin:0 !important;
}

input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):focus{
    border-color:var(--wfm-primary) !important;
}
    /* checkbox "mostrar senha" (o WiFiManager já traz isso pronto, #showpass) */
    input#showpass{
        width:18px !important; height:18px !important;
        margin-right:8px !important; vertical-align:middle !important;
    }
    label[for="showpass"]{
        display:inline !important; margin:0 !important; font-size:14px !important;
    }

    button, input[type="submit"]{
        width:100% !important;
        height:56px !important;
        padding:0 !important;
        background:var(--wfm-primary) !important;
        color:#fff !important;
        border:none !important;
        border-radius:20px !important;
        font-size:17px !important;
        font-weight:700 !important;
        margin:18px 0 0 !important;
    }
    button:active, input[type="submit"]:active{ opacity:.85 !important; }

    /* botão secundário (Reiniciar) */
    .wfm-btn-outline{
        background:var(--wfm-surface) !important;
        color:var(--wfm-primary) !important;
        border:2px solid var(--wfm-primary) !important;
    }
    .wfm-restart-form{ margin-top:12px !important; }

    /* botão de "refresh" da lista de redes -- fica discreto, tipo secundário */
    form[action*="refresh"] button{
        background:var(--wfm-surface) !important;
        color:var(--wfm-primary) !important;
        border:2px solid var(--wfm-primary) !important;
        height:44px !important;
        font-size:14px !important;
        margin-top:6px !important;
    }

    /* campo ID (readonly) -- [AJUSTAR ID] troque "id" abaixo se o seu parametro usar outro id */
    label[for="id"]{
        color:var(--wfm-gray-text) !important;
        font-size:12px !important;
        text-transform:uppercase !important;
        margin-top:26px !important;
        position:relative !important;
    }
    label[for="id"]::before{
        content:'';
        display:block;
        height:2px;
        background:var(--wfm-gray);
        margin-bottom:20px;
    }
    input#id{
        background:var(--wfm-gray) !important;
        border-color:var(--wfm-gray-text) !important;
        color:var(--wfm-gray-text) !important;
    }

    /* lista de redes escaneadas */
    .wrap > div > a{ color:var(--wfm-text) !important; font-weight:400 !important; text-decoration:none !important; }
</style>
<script>
document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.querySelector('.wrap');
    if (!wrap) return;
    var path = window.location.pathname;

    var textos = {
        'Configure WiFi': 'Configurar',
        'Save': 'Salvar',
        'Restart': 'Reiniciar',
        'Show Password': 'Mostrar senha',
        'SSID': 'Rede (Escolha na lista acima!)',
        'Password': 'Senha'
    };
    wrap.querySelectorAll('button, label').forEach(function (el) {
        var t = el.textContent.trim();
        if (textos[t]) el.textContent = textos[t];
    });

    if (path === '/') {
        var h1 = wrap.querySelector('h1');
        var h3 = wrap.querySelector('h3'); 
        if (h3) h3.remove();
        if (h1) {
            h1.textContent = 'Wifi Manager';
            var intro = document.createElement('div');
            intro.innerHTML = `
                <p class="wfm-subtitle">Configure sua rede wifi para cadastrar sua fechadura inteligente</p>
                <div class="wfm-circle">
                    <svg width="90" height="90" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" alt="wifi">
                      <path d="M25.0001 62.75C34.8829 54.5183 47.3381 50.0106 60.2001 50.0106C73.0621 50.0106 85.5173 54.5183 95.4001 62.75M7.1001 45C21.7122 32.1198 40.5216 25.0132 60.0001 25.0132C79.4786 25.0132 98.288 32.1198 112.9 45M42.6501 80.55C47.7261 76.9437 53.7985 75.0063 60.0251 75.0063C66.2517 75.0063 72.3241 76.9437 77.4001 80.55M60.0001 100H60.0501" stroke="#2B5081" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                </div>
                <div class="wfm-steps">
                    <div class="wfm-step"><span class="wfm-badge">1</span><p>Escolha sua rede.</p></div>
                    <div class="wfm-step"><span class="wfm-badge">2</span><p>Insira sua senha.</p></div>
                    <div class="wfm-step"><span class="wfm-badge">3</span><p>Pronto! Sua fechadura está online.</p></div>
                </div>`;
            h1.insertAdjacentElement('afterend', intro);
        }
    }


    if (path === '/wifi' || path === '/0wifi') {
        var forms = wrap.querySelectorAll('form');
        var principal = null;
        forms.forEach(function (f) {
            if (f.querySelector('input[type="password"]')) principal = f;
        });
        if (principal) {
            var reiniciar = document.createElement('form');
            reiniciar.action = '/restart';
            reiniciar.method = 'get';
            reiniciar.className = 'wfm-restart-form';
            reiniciar.innerHTML = '<button type="submit" class="wfm-btn-outline">Reiniciar</button>';
            principal.insertAdjacentElement('afterend', reiniciar);
        }
    }
});
</script>
)rawliteral";

  internet.setCustomHeadElement(customHead);

  bool conectado = internet.autoConnect("SafeNest-Setup", AP_SETUP_PASSWORD);

  if (!conectado) {
    ESP.restart();
  }

  userId = campo_user_id.getValue();

}

//======================Comunicação servidor==============================

void callback(char* topic, byte* payload, unsigned int length) {

  String mensagem = "";
  for (int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }

  Serial.print("Topico: ");
  Serial.println(topic);
  Serial.print("Mensagem recebida: ");
  Serial.println(mensagem);

  StaticJsonDocument<256> doc;
  DeserializationError erro = deserializeJson(doc, mensagem);

  if (erro) {
    Serial.print("Erro ao interpretar JSON: ");
    Serial.println(erro.c_str());
    return; 
  }

  String comando = doc["comando"].as<String>();

  if (doc.containsKey("correlationId")) {
    correlationId = doc["correlationId"].as<String>();
  }

  
  Serial.print("comando: ");
  Serial.println(comando);


  if (comando == "destravar") {
    lockState = "destravada";
  }

  if(lockState == "travada"){
    return;
  }
  if (comando == "travar") {
    lockState = "travada";
  }

  if (comando == "registrartag") {
    modoCadastro = true;
    inicioCadastro = millis();
    Serial.println("Modo cadastro ativado, aproxime a tag...");
  }               
  if (comando == "abrirfechadura") {
    Serial.println("abrir fechadura");
    digitalWrite(rele, HIGH);
    digitalWrite(led_verde, HIGH);
    delay(1000);
    digitalWrite(rele, LOW);
    digitalWrite(led_verde, LOW);
    Serial.println("Abriu fechadura e já fechou");
    return;
  }

  if (comando == "acessonegado") {
    Serial.println("acesso negado");
    digitalWrite(led_vermelho, HIGH);
    digitalWrite(buzzer,HIGH);
    delay(1000);
    digitalWrite(buzzer,LOW);
    digitalWrite(led_vermelho, LOW);
    delay(1000);
    return;
  }
}

//====================================================

void conectarMQTT() {

  mqtt.setServer(MQTT_BROKER, MQTT_PORT);

  mqtt.setCallback(callback);

  while (!mqtt.connected()) {
    Serial.println("Conectando ao Broker MQTT...");
    if (mqtt.connect(
          deviceAddress.c_str(),
          MQTT_USER,
          MQTT_PASSWORD
        )) {

      Serial.println("Broker conectado!");

      mqtt.subscribe(topicComando.c_str());

      Serial.print("Inscrito em: ");
      Serial.println(topicComando);

    } else {

      Serial.print("Erro MQTT: ");
      Serial.println(mqtt.state());

      delay(2000);
    }
  }
}
//====================================================================
void cadastrarFechadura(){




  JsonDocument doc;

  doc["device_address"] = deviceAddress;
  doc["user_id"] = userId;

  String json;

  String topic = "fechadura/" + deviceAddress + "/cadastrarFechadura";

  serializeJson(doc, json);
  mqtt.publish(topic.c_str(), json.c_str());

}

//====================================================

void lerNFC() {

  static String ultimoUID = "";
  static unsigned long ultimaLeitura = 0;
  const unsigned long INTERVALO_MINIMO = 1000; 

  if (!rfid.PICC_IsNewCardPresent())
    return;

  if (!rfid.PICC_ReadCardSerial())
    return;

  uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10)
      uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }

  uid.toUpperCase();

  unsigned long agora = millis();

  if (uid == ultimoUID && (agora - ultimaLeitura) < INTERVALO_MINIMO) {
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    return;
  }

  ultimoUID = uid;
  ultimaLeitura = agora;

  Serial.print("UID: ");
  Serial.println(uid);

  JsonDocument doc;

  doc["device_address"] = deviceAddress;
  doc["tag_uid"] = uid;

  String json;

  String topic = "fechadura/" + deviceAddress + "/readTag";

  serializeJson(doc, json);
  mqtt.publish(topic.c_str(), json.c_str());

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

//====================================================

String cadastrarTag() {
  if (!rfid.PICC_IsNewCardPresent())
    return "";

  if (!rfid.PICC_ReadCardSerial())
    return "";

  uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {

    if (rfid.uid.uidByte[i] < 0x10)
      uid += "0";

    uid += String(rfid.uid.uidByte[i], HEX);
  }

  uid.toUpperCase();

  JsonDocument doc;

  doc["correlationId"] = correlationId;
  doc["tag_uid"] = uid;

  String json;

  serializeJson(doc, json);

  return json;
}

//====================================================

void setup() {

  Serial.begin(115200);

  pinMode(led_vermelho, OUTPUT);
  pinMode(led_verde, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(rele, OUTPUT);
  digitalWrite(rele, LOW);

  SPI.begin();

  rfid.PCD_Init();

  conectarWiFi();

  espClient.setInsecure();

  deviceAddress = WiFi.macAddress();
  Serial.println(deviceAddress);

  topicComando = "fechadura/" + deviceAddress + "/comando";
  topicResposta = "fechadura/" + deviceAddress + "/resposta";

  lockState = "destravada";

  conectarMQTT();

  cadastrarFechadura();
}

//====================================================

void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
  }

  if (!mqtt.connected()) {
    conectarMQTT();
  }

  mqtt.loop();

  if (modoCadastro) {

    if (millis() - inicioCadastro > TIMEOUT_CADASTRO) {
      modoCadastro = false;
      Serial.println("Timeout: nenhuma tag aproximada a tempo");
    } else {
      String tag = cadastrarTag();

      if (tag != "") {
        mqtt.publish(topicResposta.c_str(), tag.c_str());
        modoCadastro = false;
        Serial.println("Tag cadastrada e enviada ao servidor");
      }
    }

  } else {

    lerNFC();
  }
}