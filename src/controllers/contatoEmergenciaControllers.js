const contatoEmergencia = require('../models/contatoEmergencia');


exports.criarContato = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_contato, telefone_contato } = req.body;
        const idToken = req.id_usuario;
        const idReq = parseInt(id);

        if (idReq !== idToken) return res.status(403).json({erro: "Você não tem permissão para criar este contato"});

        if (!nome_contato || !telefone_contato) {
            return res.status(400).json({ erro: "Nome e telefone do contato são obrigatórios" });
        }

        const novoContato = await contatoEmergencia.criarContato({
            id_usuario: id,
            nome_contato,
            telefone_contato
        });

        if (!novoContato) {
            return res.status(500).json({ mensagem: 'Erro ao criar conato de emergência' });
        }

        return res.status(201).json({ mensagem: "Contato de emergência cadastrado com sucesso.", contato_emergencia: novoContato });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}
// listar todos os contatos de emergencia de um usuario em especifico
exports.obterContatosPorUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const idToken = req.id_usuario;
        const idReq = parseInt(id);

        if (idReq !== idToken) return res.status(403).json({erro: "Você não tem permissão para deletar este contato"});
        const contatos = await contatoEmergencia.obterContatosPorUsuario(id);

        if (!contatos) {
            return res.status(500).json({ erro: "Erro ao buscar os contatos de emergencia desse usuario" });
        }

        return res.status(200).json(contatos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};

// atualizar contatos
exports.atualizarContato = async (req, res) => {
    try {
        const { contatoId } = req.params;
        const { nome_contato, telefone_contato } = req.body;
        const idToken = req.id_usuario;

        const contatoEncontrado = await contatoEmergencia.obterContatoPorId(contatoId);
        if (!contatoEncontrado) {
            return res.status(404).json({ erro: 'Contato de emergencia não encontrado' });
        }

        if (contatoEncontrado.id_usuario !== idToken) return res.status(403).json({erro: "Você não tem permissão para alterar este contato"});

        const dadosAtualizados = {};

        if (nome_contato !== undefined) dadosAtualizados.nome_contato = nome_contato;
        if (telefone_contato !== undefined) dadosAtualizados.telefone_contato = telefone_contato;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ erro: "Nenhum dado para atualizar foi enviado" });
        }

        const contatoAtualizado = await contatoEmergencia.atualizarContato(contatoId, dadosAtualizados);

        if (!contatoAtualizado) {
            return res.status(404).json({ erro: "Contato de emergencia não encontrado" });
        }
        return res.status(200).json({
            mensagem: "Contato de emergencia atualizado com sucesso",
            contato_emergencia: contatoAtualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};

exports.deletarContato = async (req, res) => {
    try {
        const { contatoId } = req.params;
        const idToken = req.id_usuario;

        const contatoEncontrado = await contatoEmergencia.obterContatoPorId(contatoId);
        if (!contatoEncontrado) {
            return res.status(404).json({ erro: 'Contato de emergencia não encontrado' });
        }

        if (contatoEncontrado.id_usuario !== idToken) return res.status(403).json({erro: "Você não tem permissão para alterar este contato"});

        const contatoDeletado = await contatoEmergencia.deletarContato(contatoId);
        if (!contatoDeletado) {
            return res.status(404).json({ erro: 'Não foi possível deletar esse contato de emergencia' });
        }

        res.status(200).json({
            mensagem: 'Contato de emergência deletado com sucesso',
            contato_emergencia: contatoDeletado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}