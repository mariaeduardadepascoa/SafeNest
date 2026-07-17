const jwt = require('jsonwebtoken');

function verificarAccessToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1]; // o Acesstoken vem: 'Bearer token', ent precisa do split para pegar só o token
    // authHeader? --> só faz o split se o authHeader existir

    if(!accessToken) return res.sendStatus(401);

    jwt.verify(accessToken, process.env.JWT_SECRET, (error, decoded) => { //verifica se o token não foi manipulado
        if (error) return res.sendStatus(401);
        req.id_usuario = decoded.id_usuario; //pega apenas o id usuario (payload inteiro: { id_usuario: 5, iat: 1234567890, exp: 1234571490 })
        next(); //o next() permite que a rota que utilizar essa função continue seu processo e não pare depois da função
    });
}

module.exports = verificarAccessToken;