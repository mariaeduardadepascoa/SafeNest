const mqtt = require("../config/MQTT");
const { buscarFechaduraPorMacAddress, verificarTag, cadastrarFechaduraNoBanco } = require('../models/disposisivos');
const { resolverResposta } = require('../services/saladeespera');
const jwt = require('jsonwebtoken');

function verificarToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id_usuario;
    } catch (error) {
        return null;
    }
}





mqtt.client.on("connect", () => {
    console.log("Conectado ao broker MQTT");

    mqtt.client.subscribe(["fechadura/+/resposta", "fechadura/+/heartbeat", "fechadura/+/readTag", "fechadura/+/cadastrarFechadura"], (err) => {
        if (err) {
            console.error("Erro ao se inscrever nos tópicos das fechaduras:", err);
        } else {
            console.log("Escutando tópicos das fechaduras");
        }
    });
});

mqtt.client.on("message", async (topic, data) => {
    const partes = topic.split("/"); // ["fechadura", "<endereco>", "<tipo>"]
    const endereco = partes[1];
    const tipo = partes[2];

    if (tipo === "heartbeat") {
        console.log(`Fechadura ${endereco} está online (heartbeat)`);
        return;
    }

    if (tipo === "cadastrarFechadura") {
        try {
            const payload = JSON.parse(data.toString());
            const idFechadura = await buscarFechaduraPorMacAddress(payload.device_address);
            if (idFechadura) {

                return;
            }
            const userid = await verificarToken(payload.user_id);
            if (!userid) {
                return;
            }
            await cadastrarFechaduraNoBanco(payload.device_address, userid);

        }
        catch (erro) {
            console.error("Erro ao cadastrar fechadura no banco:", erro);
        }
        return;

    }

    if (tipo === "resposta") {
        try {
            const payload = JSON.parse(data.toString());

            if (payload.correlationId) {
                resolverResposta(payload.correlationId, payload);
            } else {
                console.warn("Resposta sem correlationId recebida em", topic, payload);
            }
        } catch (erro) {
            console.error("Erro ao processar resposta MQTT:", erro);
        }
        return;
    }

    if (tipo === "readTag") {
        try {
            const payload = JSON.parse(data.toString());
            const idFechadura = await buscarFechaduraPorMacAddress(payload.device_address);

            console.log("idFechadura encontrado:", idFechadura);

            if (!idFechadura) {
                console.warn("Fechadura não encontrada");
                return;
            }

            const tag = payload.tag_uid;
            const address = payload.device_address;

            console.log("Verificando tag:", tag, "na fechadura:", idFechadura);

            const verify = await verificarTag(tag, idFechadura);

            console.log("Resultado da verificação:", verify);

            mqtt.client.publish(
                "fechadura/" + address + "/comando",
                JSON.stringify({ comando: verify ? "abrirfechadura" : "acessonegado" })
            );

        } catch (erro) {
            console.error("Erro ao processar mensagem readTag:", erro);
        }
        return;
    }

    console.warn("Mensagem em tópico não tratado:", topic, data.toString());
});

mqtt.client.on("error", (err) => {
    console.error("Erro na conexão MQTT:", err);
});

// função que os endpoints usam pra mandar comando pra fechadura
function publish(topico, data) {
    mqtt.client.publish(topico, data);
}

module.exports = { publish };