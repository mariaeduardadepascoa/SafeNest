const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1]; // o token vem: 'Bearer token', ent precisa do split para pegar só o token e tirar espaço e 'Bearer

    if(!token) return res.sendStatus(401);

    jwt.verify(); //verifica se o token não foi manipulado
}

module.exports = verificarToken;