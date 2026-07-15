// REQUISIÇÕES E O MÉTODOS

//padrão: router.METODO_HTTP('/caminho', funcao_que_resolve)


const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioControllers');
const authController = require('../controllers/authControllers');
const contatoEmergenciaController = require('../controllers/contatoEmergenciaControllers');
const historicoController = require('../controllers/historicoController');
const dispositivoController = require('../controllers/dispositivoControllers');

// --- CONTROLE INTERNO DE USUARIOS

router.get('/usuarios', usuarioController.obterUsuarios); //pegar todos os usuarios
router.get('/usuario/:id', usuarioController.obterUsuarioPorId); //usuario específico
router.put('/usuario/:id', usuarioController.atualizarUsuario); //editar usuario
router.delete('/usuario/:id', usuarioController.deletarUsuario); //excluir usuario
// router.put('/usuario/config', (req, res) => res.json({ message: "Configuração salva" })); //se o usuário quer a "versão adaptada"

// metodos de login e cadastro
router.post('/auth/login', authController.login);
router.post('/auth/cadastro', authController.cadastro);


// --- APP E SITE

// contatos de emergencia
router.post('/usuario/:id/contatos', contatoEmergenciaController.criarContato);
router.get('/usuario/:id/contatos', contatoEmergenciaController.obterContatosPorUsuario);
router.put('/usuario/:id/contatos/:contatoId', contatoEmergenciaController.atualizarContato);
router.delete('/usuario/:id/contatos/:contatoId', contatoEmergenciaController.deletarContato);

// historico de dados do usuario
router.get('/historico', historicoController.obterHistorico);


// --- DISPOSITIVOS

// status dos sensores
// router.put('/status', (req, res) => res.json({ message: "Status do sensor atualizado" })); //qaundo o usuario ativar ou desativar algum sensor

// tags rfid
// router.post('/dispositivos', dispositivoController.obterTagsAutorizadas);
router.post('/dispositivos/cadastrarTag', dispositivoController.cadastrarTag);
// router.post('/dispositivos/cadastro', dispositivoController.cadastrarTag);
// router.post('/acesso/rfid', dispositivoController.verificarTag);

// alertas de emergencia dos dispositivos
// router.post('/alertas/vibracao', dispositivoController.receberVibracao); //alerta de vibração
// router.post('/alertas/incendio', dispositivoController.receberIncendio); //alerta de incendio


// --- YOLO
// router.post('/ia/analise', (req, res) => res.json({ message: "Análise da yolo recebida e processada" })); //info's + imagens da yolo



module.exports = router;