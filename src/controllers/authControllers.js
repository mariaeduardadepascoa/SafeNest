//USUÁRIOS

// const usuarios = [
//     {
//         id: 1,
//         nome: "Carlos Silva",
//         email: "carlos@email.com",
//         senha: "123",
//         versao_adaptada: false,
//         contato_emergencia: "19999999999"
//     }
// ];

// LOGIN
const supabase = require('../config/supabaseClient');
const usuario = require('../models/usuario');

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuarioEncontrado = await usuario.buscarPorEmailESenha(email, senha);

        if (!usuarioEncontrado) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos" });
        }

        // const senhaCorreta = await bcrypt.compare(senha, usuario.senha_usuario);
        // if (!senhaCorreta) {
        //     return res.status(401).json({ erro: "E-mail ou senha incorretos" });
        // }

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome,
                email: usuarioEncontrado.email,
                versao_adaptada: usuarioEncontrado.versao_adaptada
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};


exports.cadastro = async (req, res) => {
    try {
        const { nome_usuario, email_usuario, senha_usuario } = req.body;

        if (!nome_usuario || !email_usuario || !senha_usuario) {
            return res.status(400).json({ erro: "Email, senha e nome são obrigatórios" });
        }

        const { data, error } = await supabase
            .from('usuario')
            .insert([{ nome_usuario, email_usuario, senha_usuario }])

        if (error) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", data });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}