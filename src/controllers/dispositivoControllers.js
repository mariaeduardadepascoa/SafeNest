//DADOS DO ESP E YOLO

const tagsAutorizadas = [
    {
        id: 1,
        tag: "ABC123XYZ"
    }
]

exports.verificarTag = (req, res) => {
    const { tagId } = req.body; // esp envia o ID da tag lida

    const tagEncontrada = tagsAutorizadas.find(t => t.tag === tagId);
    if (tagEncontrada) {
        return res.status(200).json({ autorizado: true, mensagem: "Acesso liberado!" });
    } else {
        return res.status(403).json({ autorizado: false, mensagem: "Tag não autorizada!" });
    }
};

exports.obterTagsAutorizadas = (req, res) => {
    return res.status(200).json(tagsAutorizadas);
};

// esp vai chamar essa função se detecatr vibracao (arrombamento)
exports.receberVibracao = (req, res) => {

    console.log("Alerta de vibração recebido do ESP");


    //função de enviar e-mail/notificação
    function notificacao() {

    }

    return res.status(201).json({
        alarme_disparado: true,
        mensagem: "Alerta de possível invasão processado"
    });
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