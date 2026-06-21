const express = require('express');
const router = express.Router();

// importações
const historicoController = require('../controllers/historicoController');
const authController = require('../controllers/authController');
const dispositivoController = require('../controllers/dispositivoController');

//SISTEMA DE EXPORTAÇÃO QUE ENVIA A REQUISIÇÃO E O MÉTODO USADO PELO USUÁRIO

// --- APP E SITE
router.get('/historico', historicoController.obterHistorico); //função de historicos de dados do app e site para a visualizaçã do usuario
router.post('/auth/login', authController.login); //função de login
router.get('/status', (req, res) => res.json({ status: "sistema ativo" })); //exemplo de informa se o app está ativo ou inativo
router.put('/status', (req, res) => res.json({ message: "Status atualizado" })); //qaundo o usuario ativar ou desativar algum sensor
router.put('/usuario/config', (req, res) => res.json({ message: "Configuração salva" })); //se o usuário quer a "versão adaptada" e gerencia os contatso de emergência


// --- DISPOSITIVOS
router.get('/dispositivosDados', dispositivoController.tagsAutorizadas); //função de dados do esp e yolo
router.post('/acesso/rfid', dispositivoController.verificarTag); //função de verificar tag
router.post('/alertas/vibracao', dispositivoController.receberVibracao); //função de alerta de vibração
router.post('/alertas/incendio', dispositivoController.receberIncendio); //função de alerta de incendio
router.post('/ia/analise', (req, res) => res.json({ message: "Análise da yolo recebida e processada" })); //info's da yolo (incluindo o link da imagem para salvar no banco)


module.exports = router;