// REQUISIÇÕES E O MÉTODOS

//padrão: router.METODO_HTTP('/caminho', verificarToken.js, funcao_que_resolve)


const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioControllers');
const authController = require('../controllers/authControllers');
const contatoEmergenciaController = require('../controllers/contatoEmergenciaControllers');
const verificarAccessToken = require('../middlewares/verificarAccessToken');
const verificarAdmin = require('../middlewares/verificarAdmin');
const verificacaoController = require('../controllers/verificationControllers');

// --- CONTROLE INTERNO DE USUARIOS

router.get('/usuarios', verificarAccessToken, verificarAdmin, usuarioController.obterUsuarios); //pegar todos os usuarios
router.get('/usuario/:id', verificarAccessToken, usuarioController.obterUsuarioPorId); //usuario específico
router.put('/usuario/:id', verificarAccessToken, usuarioController.atualizarUsuario); //editar usuario
router.delete('/usuario/:id', verificarAccessToken, usuarioController.deletarUsuario); //excluir usuario
// router.put('/usuario/config', (req, res) => res.json({ message: "Configuração salva" })); //se o usuário quer a "versão adaptada"

// metodos de login e cadastro
router.post('/auth/login', authController.login);
router.post('/auth/cadastro', authController.cadastro);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/verificar-email', authController.verificarEmail);

// codigo de verificacao de email
router.post('/send-verification-code', verificacaoController.sendCode);
router.post('/verify-code', verificacaoController.checkCode);

// senha
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/validate-reset-code', authController.validateResetCode);

// --- APP E SITE

// contatos de emergencia
router.post('/usuario/:id/contatos', verificarAccessToken, contatoEmergenciaController.criarContato);
router.get('/usuario/:id/contatos', verificarAccessToken, contatoEmergenciaController.obterContatosPorUsuario);
router.put('/usuario/:id/contatos/:contatoId', verificarAccessToken, contatoEmergenciaController.atualizarContato);
router.delete('/usuario/:id/contatos/:contatoId', verificarAccessToken, contatoEmergenciaController.deletarContato);



module.exports = router;