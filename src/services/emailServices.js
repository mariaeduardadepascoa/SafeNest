const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, //true para porta 465, false para as demais
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    }
});


// codigo de verificação de email
async function sendVerificationEmail(email, code) {
    await transport.sendMail({
        from: `SafeNest Corporation <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Código de Verificação - SAFENEST',
        html: `<h2>Olá!</h2> <p>Para verificar seu email, insira o código abaixo no SafeNest:</p> <h2>${code}</h2> <h4>Este código de verificação pode ser usado em até 30 minutos. Não o compartilhe com outras pessoas.</h4> <p>Caso não tenha solicitado este código, pedimos que ignore esta mensagem.</p> <p>Ainda têm dúvidas? Entre em contato com a equipe do SafeNest pelo email: safenest.br@gmail.com.</p>`,
        text: `Olá! Para verificar seu email, insira o código a seguir no SafeNest: ${code}. Este código de verificação pode ser usado em até 30 minutos, não o compartilhe com outras pessoas. Caso não tenha solicitado este código, pedimos que ignore esta mensagem. Ainda têm dúvidas? Entre em contato com a equipe do SafeNest pelo email: safenest.br@gmail.com`,
    });
}

// email de redefinição de senha
async function sendPasswordResetEmail(email, rawToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await transport.sendMail({
        from: `SafeNest Corporation <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha - SAFENEST',
        html: `<h2>Olá!</h2> <p>Recebemos uma solicitação para redefinir sua senha no SafeNest. Clique no link abaixo para criar uma nova senha:</p> <p><a href="${resetLink}">${resetLink}</a></p> <h4>Este link é válido por 20 minutos e só pode ser usado uma vez.</h4> <p>Caso não tenha solicitado essa alteração, pedimos que ignore esta mensagem — sua senha atual continuará funcionando normalmente.</p> <p>Ainda têm dúvidas? Entre em contato com a equipe do SafeNest pelo email: safenest.br@gmail.com.</p>`,
        text: `Olá! Recebemos uma solicitação para redefinir sua senha no SafeNest. Acesse o link a seguir para criar uma nova senha: ${resetLink}. Este link é válido por 20 minutos e só pode ser usado uma vez. Caso não tenha solicitado essa alteração, pedimos que ignore esta mensagem. Ainda têm dúvidas? Entre em contato com a equipe do SafeNest pelo email: safenest.br@gmail.com`,
    });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };