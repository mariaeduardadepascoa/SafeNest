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

// codigo de redefiniçõ de senha