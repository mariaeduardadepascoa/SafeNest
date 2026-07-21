//AUTENTICAÇÃO DOS USUÁRIOS

const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

// login
exports.login = async (req, res) => {
    try {
        const { email_usuario, senha_usuario } = req.body;

        if (!email_usuario || !senha_usuario) {
            return res.status(400).json({ erro: "Email e senha são obrigatórios" });
        }

        const email = email_usuario.trim().toLowerCase();
        const usuarioEncontrado = await usuario.buscarEmail(email);

        if (!usuarioEncontrado) {
            return res.status(401).json({ erro: "Email ou senha inválidos" });
        }

        const senha = await bcrypt.compare(req.body.senha_usuario, usuarioEncontrado.senha_usuario); //compara a senha da req com alguma senha salva no supabase

        if (!senha) {
            return res.status(401).json({ erro: "Email ou senha inválidos" });
        }

        const accessToken = jwt.sign({id_usuario: usuarioEncontrado.id_usuario}, process.env.JWT_SECRET, {expiresIn: '2h'}); //token: payload(guarda -> id_usuario), secret e expiresIn
        const refreshToken = jwt.sign({id_usuario: usuarioEncontrado.id_usuario}, process.env.JWT_REFRESH_SECRET, {expiresIn: '15d'});

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            accessToken,
            refreshToken,
            usuario: {
                id_usuario: usuarioEncontrado.id_usuario,
                nome_usuario: usuarioEncontrado.nome_usuario,
                email_usuario: usuarioEncontrado.email_usuario,
                versao_adaptada: usuarioEncontrado.versao_adaptada
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
};

// cadastro
exports.cadastro = async (req, res) => {
    try {
        const { nome_usuario, email_usuario, senha_usuario, versao_adaptada } = req.body;

        if (!nome_usuario || !email_usuario || !senha_usuario) {
            return res.status(400).json({ erro: "Email, senha e nome são obrigatórios" });
        }

        const email = email_usuario.trim().toLowerCase();

        if (senha_usuario.length < 6) {
            return res.status(400).json({ erro: "A senha deve ter no mínimo 6 caracteres" });
        }

        const hashedPassword = await bcrypt.hash(req.body.senha_usuario, 10); //10 mil criptografias diferentes para 10 mil senhas
        const novoUser = await usuario.criarUsuario({
            nome_usuario,
            email_usuario: email,
            senha_usuario: hashedPassword, //para salvar agora em formato hash
            versao_adaptada: versao_adaptada ?? false,
        });

        if (!novoUser) {
            return res.status(500).json({ mensagem: 'Erro ao criar usuário' });
        }

        if (novoUser.erro === 'email_duplicado') {
            return res.status(409).json({ erro: "Este e-mail já está cadastrado no sistema." });
        }

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso.", usuario: novoUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
}

exports.refreshToken = async(req, res) => {
    try{
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ erro: "Refresh token não fornecido" });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).json({erro: "Refresh token inválido/expirado"});
            }
            const novoAcessToken = jwt.sign({id_usuario: decoded.id_usuario}, process.env.JWT_SECRET, {expiresIn: '2h'}); //gerando um novo
            
            return res.status(200).json({accessToken: novoAcessToken});
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
}

// VERFICANDO SE O EMAIL JA EXISTE NO BANCO
exports.verificarEmail = async (req, res) => {
    try {
        const { email_usuario } = req.body;

        if (!email_usuario) {
            return res.status(400).json({ erro: "Email é obrigatório" });
        }

        const email = email_usuario.trim().toLowerCase();
        const usuarioEncontrado = await usuario.buscarEmail(email);

        return res.status(200).json({ existe: !!usuarioEncontrado });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
};