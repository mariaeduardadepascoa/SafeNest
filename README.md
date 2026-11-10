# SafeNest

O SafeNest é um projeto de conclusão de curso (TCC) voltado ao monitoramento e à segurança residencial. O sistema integra detecção de incêndios por visão computacional com YOLOv11, uma fechadura inteligente com autenticação por RFID e um aplicativo para acompanhar eventos e controlar o acesso à residência.

O aplicativo oferece dois visuais: o padrão e uma versão acessível, com ajustes de legibilidade nas telas de entrada. A preferência pode ser escolhida no cadastro e alterada nas configurações.

## Download para Android

**[Baixar o APK — SafeNest v1.1.0](https://github.com/mariaeduardadepascoa/SafeNest/releases/download/v1.1.0/application-55db7792-c552-43ad-94b9-8c5d04051b09.apk)**

Todas as versões publicadas estão na página de [Releases](https://github.com/mariaeduardadepascoa/SafeNest/releases).

O APK é a interface do sistema. Para utilizar login e cadastro, a API Node.js precisa estar em execução e conectada ao Supabase; a confirmação de e-mail também depende da configuração de envio de mensagens. Os recursos de fechadura e câmera dependem dos serviços e dispositivos correspondentes.

## Funcionalidades

- Cadastro, login, confirmação de e-mail e recuperação de senha.
- Escolha entre o visual padrão e o acessível, com opção de cores alternativas.
- Controle de acesso por fechadura inteligente e tags RFID.
- Cadastro, listagem, edição do nome e remoção de tags.
- Visualização da câmera por transmissão RTSP.
- Detecção de incêndios por visão computacional e geração de alertas.
- Histórico de acessos e alertas, com data, horário e filtros.
- Gerenciamento de contatos de emergência, fotos e acesso a chamadas telefônicas.

## Tecnologias

| Parte do sistema | Tecnologias |
|---|---|
| Aplicativo | React Native, Expo e JavaScript |
| API de usuários | Node.js, Express, JWT, bcrypt e Nodemailer |
| API de dispositivos | Java e Spring Boot |
| Banco de dados | Supabase e PostgreSQL |
| Visão computacional | Python, FastAPI, OpenCV e YOLOv11 |
| Comunicação com dispositivos | MQTT |
| Fechadura inteligente | ESP32 e leitor RFID |

## Organização do projeto

```text
SafeNest/
├── mobile/                  # Aplicativo e seus dois visuais
├── src/                     # API Node.js: usuários, autenticação e histórico
├── SafeNest-Dispositivos/    # API Java: fechaduras, tags e câmeras
├── api yolo/                # Serviço de detecção de incêndios
├── codigoFechadura/         # Código da fechadura com ESP32
└── supabase/                # Configuração e migrações do banco
```

## Como executar

### 1. Baixar o projeto

```bash
git clone https://github.com/mariaeduardadepascoa/SafeNest.git
cd SafeNest
```

### 2. Iniciar a API de usuários

Com Node.js e npm instalados, configure um arquivo `.env` na raiz do projeto com os dados do seu ambiente:

```dotenv
SUPABASE_URL=URL_DO_SEU_SUPABASE
SUPABASE_KEY=CHAVE_DO_SEU_SUPABASE
JWT_SECRET=SEGREDO_DO_TOKEN_DE_ACESSO
JWT_REFRESH_SECRET=SEGREDO_DO_TOKEN_DE_RENOVACAO
GMAIL_USER=EMAIL_DE_ENVIO
GMAIL_PASSWORD=CREDENCIAL_DE_ENVIO
```

O Supabase configurado precisa conter as tabelas utilizadas pelo projeto. Mantenha as credenciais fora do Git.

```bash
npm install
npm start
```

A API Node.js utiliza a porta **3000**. No navegador, acessar somente a raiz dessa API retorna “Rota não encontrada”; essa resposta é esperada, pois o aplicativo utiliza rotas específicas.

### 3. Utilizar o aplicativo

Para testar no celular, instale o APK disponibilizado acima. O celular precisa conseguir acessar o computador que executa as APIs.

Os endereços das APIs ficam em `mobile/src/services/api.js`. Confira se correspondem ao ambiente antes de gerar um APK, pois os endereços fazem parte da versão instalada.

Para trabalhar no código do aplicativo:

```bash
cd mobile
npm install
npm start
```

O aplicativo utiliza um reprodutor VLC nativo. Para testar todos os recursos, use uma build Android compatível com o projeto; o Expo Go sozinho não inclui esse módulo.

### 4. Executar os recursos de dispositivos e inteligência artificial

- **Fechadura e tags:** configure e inicie a API Java em `SafeNest-Dispositivos/`, o broker MQTT e o ESP32. A API Java também precisa de sua configuração de banco e autenticação. O segredo JWT de acesso deve corresponder ao utilizado pela API Node.js.
- **Câmera:** disponibilize a transmissão RTSP e confira o endereço em `mobile/src/screens/CameraScreen.js`.
- **Detecção de incêndios:** instale as dependências de `api yolo/requirements.txt` e inicie o serviço nessa pasta, onde está o modelo `best.pt`:

```bash
cd "api yolo"
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Os comandos acima partem da raiz do repositório. Após iniciar a inteligência artificial, as câmeras precisam ser cadastradas ou sincronizadas com o serviço para começar o monitoramento.

## Desenvolvido por

- [João Carlos de Lima](https://github.com/oiejota)
- [Maria Catarina Menegon Ferreira](https://github.com/MaryCat2025)
- [Maria Eduarda de Páscoa Carneiro](https://github.com/mariaeduardadepascoa)
