//GERENCIAMENTO DOS USUARIOS
const usuario = require('../models/usuario');

// const usuarios = [
//     {
//         id: 1,
//         nome: "Carlos Silva",
//         email: "carlos@email.com", UNICO
//         senha: "123",
//         versao_adaptada: ,
//         contato_emergencia: "19999999999" ou vazia
//     }
// ];

// listar todos os usuarios
exports.obterUsuarios = async (req, res) => {
    try {
        const usuarios = await usuario.obterUsuarios();

        if (!usuarios) {
            return res.status(500).json({ erro: "Erro ao buscar usuários" });
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};
// listar usuarios pelo id
exports.obterUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEncontrado = await usuario.obterUsuarioPorId(id);

        if (!usuarioEncontrado) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        return res.status(200).json(usuarioEncontrado);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}

// atualizar usuarios
exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_usuario, email_usuario, versao_adaptada } = req.body;

        const dadosAtualizados = {};
        // definindo os campos que vieram
        if (nome_usuario !== undefined) dadosAtualizados.nome_usuario = nome_usuario;
        if (email_usuario !== undefined) dadosAtualizados.email_usuario = email_usuario;
        if (versao_adaptada !== undefined) dadosAtualizados.versao_adaptada = versao_adaptada;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ erro: "Nenhum dado para atualizar foi enviado" });
        }

        const usuarioAtualizado = await usuario.atualizarUsuario(id, dadosAtualizados); //novo objeto que guarda o usuario atualizado

        if (!usuarioAtualizado || usuarioAtualizado.length === 0) { //verificação para mostrar se existir
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        return res.status(200).json({
            mensagem: "Usuário atualizado com sucesso",
            usuario: usuarioAtualizado[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};

// deletar usuarios
exports.deletarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEncontrado = await usuario.obterUsuarioPorId(id);

        if (!usuarioEncontrado) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const usuarioDeletado = await usuario.deletarUsuario(id);
        if (!usuarioDeletado) {
            return res.status(404).json({ erro: "Não foi possível deletar esse usuário" });
        }

        res.status(200).json({
            mensagem: "Usuário deletado com sucesso",
            usuario: usuarioDeletado
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}