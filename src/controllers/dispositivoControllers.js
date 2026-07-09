//DADOS DO ESP E YOLO
const mqtt = require("../config/MQTT");


//cadastrar uma tag
exports.cadastrarTag = (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos" });

        }
        console.log("Enviando MQTT:", "fechadura/" + uid + "/command");
        mqtt.publish("fechadura/" + uid + "/command", "registartag")
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",

        });

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
        mqtt.publish("fechadura/" + uid + "/command", "abrirfechadura")
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