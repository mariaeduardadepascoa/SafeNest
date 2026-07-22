const { codigoVerificacao, verificarCodigo } = require('../services/verificationServices');
const { sendVerificationEmail } = require('../services/emailServices');

async function sendCode(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });

    try {
        const code = await codigoVerificacao(email);
        await sendVerificationEmail(email, code);
        res.status(200).json({ message: 'Código enviado com sucesso' });
    } catch (err) {
        console.error('Erro ao enviar código de verificação: ', err);
        res.status(500).json({ error: 'Erro ao enviar código de verificação' });
    }
}

async function checkCode(req, res) {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email e código são obrigatórios' });

    try {
        const result = await verificarCodigo(email, code);

        if (!result.sucesso) {
            const message = result.razao === 'expirado' ? 'Código expirado. Solicite um novo.' : 'Código inválido.';
            return res.status(400).json({ error: message });
        }

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (err) {
        console.error('Erro ao verificar código:', err);
        res.status(500).json({ error: 'Erro ao verificar código' });
    }
}

module.exports = { sendCode, checkCode };