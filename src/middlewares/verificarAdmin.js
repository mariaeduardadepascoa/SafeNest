// MIDDLEWARE PARA ADMINS
const usuario = require("../models/usuario");

async function verificarAdmin(req, res, next) {
    try {
        const userEncontrado = await usuario.obterUsuarioPorId(req.id_usuario);

        if(!userEncontrado) return res.status(404).json({erro: 'Usuario não encontrado'});

        if(!userEncontrado.admin) return res.status(403).json({erro: 'Acesso restrito a administradores'});

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({erro: "Erro interno no servidor"});
    }
}

module.exports = verificarAdmin;