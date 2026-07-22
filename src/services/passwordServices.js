const supabase = require('../config/supabaseClient');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailServices');
const bcrypt = require('bcrypt');

const token_expiration_time = 20;

async function reqPasswordReset(email) {
    const { data: user } = await supabase
        .from('usuario')
        .select('id_usuario, email_usuario')
        .eq('email_usuario', email)
        .single()

    if (!user) return; //se o usuario nao existir nao retorna nada, pois a mensagem de erro sera a mesma

    // gera código de 4 dígitos
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();

    const tokenHash = crypto.createHash('sha256').update(codigo).digest('hex'); //transforma em hash e depois salva

    const expira_em = new Date(Date.now() + token_expiration_time * 60 * 1000);

    // deleta tokens invalidos
    await supabase
        .from('reset_password')
        .delete()
        .eq('id_usuario', user.id_usuario);

    await supabase
        .from('reset_password')
        .insert({
            id_usuario: user.id_usuario,
            token_hash: tokenHash,
            expira_em: expira_em.toISOString(),
        });

    await sendPasswordResetEmail(user.email_usuario, codigo);
}

// resentando a senha
async function resetPassword(codigo, novaSenha) {
    // hash do token recebido pra comparar com o que está salvo
    const tokenHash = crypto.createHash('sha256').update(codigo).digest('hex');

    // busca o token no banco
    const { data: tokenRow } = await supabase
        .from('reset_password')
        .select('id, id_usuario, expira_em')
        .eq('token_hash', tokenHash)
        .single();

    if (!tokenRow) {
        throw new Error('TOKEN_INVALIDO');
    }

    // checa expiração
    if (new Date(tokenRow.expira_em) < new Date()) {
        // token expirado: apaga e recusa
        await supabase.from('reset_password').delete().eq('id', tokenRow.id);
        throw new Error('TOKEN_EXPIRADO');
    }

    // coloca hash na nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // atualiza a senha do usuário
    const { error: updateError } = await supabase
        .from('usuario')
        .update({ senha_usuario: senhaHash })
        .eq('id_usuario', tokenRow.id_usuario);

    if (updateError) {
        throw new Error('ERRO_AO_ATUALIZAR_SENHA');
    }

    //invalida o token (uso único)
    await supabase.from('reset_password').delete().eq('id', tokenRow.id);

    return tokenRow.id_usuario;
}

module.exports = { reqPasswordReset, resetPassword };