//DADOS DO ESP E YOLO

const tagsAutorizadas = [
    {
        id: 1,
        tag: "ABC123XYZ"
    }
]

//cadastrar uma tag
exports.cadastrarTag = (req, res) => {

}

//listar todas as tags
exports.obterTagsAutorizadas = (req, res) => {
    
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