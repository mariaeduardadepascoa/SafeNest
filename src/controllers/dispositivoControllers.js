//module.exports = { client: serverMQTT };;


//DADOS DO ESP E YOLO
const crypto = require("crypto");
const mqtt = require("../config/MQTT");
const fechadura = require("../models/disposisivos");
const { aguardarResposta } = require("../services/saladeespera");
const serviceMQTT = require("../services/mqttServices");

//cadastrar uma tag
exports.cadastrarTag = async (req, res) => {
    try {
        const { id, id_usuario } = req.body;

        if (!id) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }

        if (!id_usuario) {
            return res.status(400).json({ erro: "requisição sem id_usuario" });
        }

        const address = await fechadura.buscarFechadura(id);
        if (!address) {
            return res.status(404).json({ erro: "Fechadura não encontrada" });
        }

        // gera o "número de protocolo" único pra essa requisição
        const correlationId = crypto.randomUUID();

        // manda o comando já incluindo o protocolo, pra fechadura devolver junto
        serviceMQTT.publish(
            "fechadura/" + address + "/comando",
            JSON.stringify({ comando: "registrartag", correlationId })
        );

        try {
            // fica esperando aqui (parado, mas sem travar outras requisições)
            // até 8 segundos pela resposta com esse mesmo correlationId
            const resposta = await aguardarResposta(correlationId, 8000);

            console.log("Resposta recebida da fechadura:", resposta);

            const registro = await fechadura.salvarRegistroNoBanco(
                id_usuario,
                resposta.tag_uid,
                id
            );

            if (!registro) {
                return res.status(500).json({ erro: "Erro ao salvar tag no banco" });
            }

            return res.status(200).json({
                mensagem: "tag cadastrada com sucesso!",
                resposta,
            });
        } catch (timeoutErr) {
            return res.status(504).json({ erro: "fechadura não respondeu a tempo" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};


//listar todas as tags
exports.obterTagsAutorizadas = (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos" });

        }
        mqtt.publish("fechadura/" + uid + "/comando", "abrirfechadura")
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",

        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};

//verificar a autencidade da tag para liberar a fechadura
exports.verificarTag = (req, res) => {

};


// esp vai chamar essa função se detecatr vibracao (arrombamento)
exports.receberVibracao = (req, res) => {

};


// esp vai chamar essa função se detecatr fumaça ou gas
exports.receberIncendio = (req, res) => {
    const { nivelGas } = req.body;

    console.log(`Sensor de gás reportou nível: ${nivelGas}`);

    if (nivelGas > 400) { //exmplo de nivel de gas nao seguro
        return res.status(201).json({ alarme_disparado: true, mensagem: "Fumaça/Gás detectado! Alerta enviado." });
    }

    return res.status(200).json({ alarme_disparado: false, mensagem: "Níveis de gás normais." });
};