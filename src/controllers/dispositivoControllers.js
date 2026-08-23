//DADOS DO ESP E YOLO
const crypto = require("crypto");
const mqtt = require("../config/MQTT");
const fechadura = require("../models/disposisivos");
const { aguardarResposta } = require("../services/saladeespera");
const serviceMQTT = require("../services/mqttServices");

//cadastrar uma tag
exports.cadastrarTag = async (req, res) => {
    try {
        const user = req.id_usuario;
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }

        const { nome_dono } = req.body;
        if (!nome_dono) {
            return res.status(400).json({ erro: "requisição sem nome do dono" });
        }

        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user);
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }

        const address = await fechadura.buscarFechadura(id_fechadura);
        if (!address) {
            return res.status(404).json({ erro: "Fechadura não encontrada" });
        }

        const correlationId = crypto.randomUUID();

        serviceMQTT.publish(
            "fechadura/" + address + "/comando",
            JSON.stringify({ comando: "registrartag", correlationId })
        );

        try {
            const resposta = await aguardarResposta(correlationId, 8000);
            console.log("Resposta recebida da fechadura:", resposta);

            const registro = await fechadura.salvarRegistroNoBanco(
                user,
                resposta.tag_uid,
                id_fechadura,
                nome_dono 
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
exports.statusFechadura = async (req, res) => {
    try {
        const user = req.id_usuario;
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }

        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user);
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }

        const status = await fechadura.verificarTrancada(id_fechadura);
        if (status === null) {
            return res.status(404).json({ erro: "Fechadura não encontrada" });
        }

        return res.status(200).json({ blocked: status.blocked });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
};
exports.abrirFechadura = async (req, res) => {
    try {
        const user = req.id_usuario
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }
        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user)
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }
        const address = await fechadura.buscarFechadura(id_fechadura);
        if (!address) {
            return res.status(404).json({ erro: "Fechadura nao encontrada" });
        }
        serviceMQTT.publish(
            "fechadura/" + address + "/comando",
            JSON.stringify({ "comando": "abrirfechadura" })
        );

        return res.status(200).json({ mensagem: "comando de abrir enviado" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }

}
exports.removerFechadura = async (req, res) => {
    try {
        const user = req.id_usuario
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }
        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user);
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem id" });
        }
        const deletado = await fechadura.removerFechaduradoBanco(id_fechadura);
        if (!deletado) {
            return res.status(404).json({ erro: "Não foi possivel remover a fechadura" });
        }

        res.status(200).json({ mensagem: "fechadura removida" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
}
exports.travarFechadura = async (req, res) => {
    try {
        const user = req.id_usuario
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }
        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user);
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }
        const address = await fechadura.buscarFechadura(id_fechadura);

        if (!address) {
            return res.status(404).json({ erro: "Fechadura nao encontrada" });
        }
        serviceMQTT.publish(
            "fechadura/" + address + "/comando",
            JSON.stringify({ "comando": "travar" })
        );
        await fechadura.atualizarStatusFechadura(id_fechadura, true);
        return res.status(200).json({ mensagem: "fechadura travada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });

    }

}

exports.destravarFechadura = async (req, res) => {
    try {
        const user = req.id_usuario
        if (!user) {
            return res.status(400).json({ erro: "requisição sem usuario" });
        }
        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(user);
        if (!id_fechadura) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }
        const address = await fechadura.buscarFechadura(id_fechadura);

        if (!address) {
            return res.status(404).json({ erro: "Fechadura nao encontrada" });
        }
        serviceMQTT.publish(
            "fechadura/" + address + "/comando",
            JSON.stringify({ "comando": "destravar" })
        );
        await fechadura.atualizarStatusFechadura(id_fechadura, false);
        return res.status(200).json({ mensagem: "fechadura destravada" });
    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro interno no servidor" });
        }


    }

}
//listar todas as tags
exports.obterTagsAutorizadas = (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(401).json({ erro: "Uid não encontrado" });

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

//lista a fehcadura pro app ou web
exports.listarFechadura = async (req, res) => {
    try {
        const id_usuario = req.id_usuario;
        const id_fechadura = await fechadura.buscarFechaduraPorUsuario(id_usuario);
        return res.status(200).json({ id_fechadura }); // objeto ou null, sem "s"
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};
exports.listarAcessos = async (req, res) => {
    try {
        const userID = req.body
        if (!id) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }
        const acessos = await fechadura.obterAcessos(userID);

        res.status(200).json(acessos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" })
    }
}

exports.listarAlertas = async (req, res) => {
    try {
        const userID = req.body
        if (!id) {
            return res.status(400).json({ erro: "requisição sem ID" });
        }
        const alertas = await fechadura.obterAlertas(userID);

        res.status(200).json(alertas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" })
    }
}




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