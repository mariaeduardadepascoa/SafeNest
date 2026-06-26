//USUÁRIOS

const usuarios = [
    {
        id: 1,
        nome: "Carlos Silva",
        email: "carlos@email.com",
        senha: "123",
        versao_adaptada: false,
        contato_emergencia: "19999999999"
    }
];

// LOGIN
exports.login = (req, res) => {
    const { email, senha } = req.body; //pga so email e senha

    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha); //procura se ja existe no banco -> devolve o primeiro achado

    if (!usuarioEncontrado) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos" });
    }

    // se achou, devolve os dados dele
    return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email,
            versao_adaptada: usuarioEncontrado.versao_adaptada
        }
    });
};