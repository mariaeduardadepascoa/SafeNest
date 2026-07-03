// REQUISIÇÕES E O MÉTODOS

//padrão: router.METODO_HTTP('/caminho', funcao_que_resolve)


const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');
const authController = require('../controllers/authControllers');
const dispositivoController = require('../controllers/dispositivoControllers');


// --- APP E SITE
router.get('/historico', historicoController.obterHistorico); //função de historicos de dados do app e site para a visualizaçã do usuario

router.post('/auth/login', authController.login);
router.post('/auth/cadastro', authController.cadastro);

router.put('/status', (req, res) => res.json({ message: "Status do sensor atualizado" })); //qaundo o usuario ativar ou desativar algum sensor
router.put('/usuario/config', (req, res) => res.json({ message: "Configuração salva" })); //se o usuário quer a "versão adaptada" e gerencia os contatso de emergência


// --- DISPOSITIVOS
router.get('/dispositivosDados', dispositivoController.obterTagsAutorizadas); //função de dados do esp e yolo

router.post('/acesso/rfid', dispositivoController.verificarTag);
router.post('/alertas/vibracao', dispositivoController.receberVibracao); //função de alerta de vibração
router.post('/alertas/incendio', dispositivoController.receberIncendio); //função de alerta de incendio
router.post('/ia/analise', (req, res) => res.json({ message: "Análise da yolo recebida e processada" })); //info's da yolo (incluindo o link da imagem para salvar no banco)


module.exports = router;