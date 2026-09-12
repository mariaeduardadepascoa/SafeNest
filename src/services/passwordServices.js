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

    if (!user) return; 
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();

    const tokenHash = crypto.createHash('sha256').update(codigo).digest('hex'); 

    const expira_em = new Date(Date.now() + token_expiration_time * 60 * 1000);

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

async function resetPassword(codigo, novaSenha) {
    const tokenHash = crypto.createHash('sha256').update(codigo).digest('hex');

    const { data: tokenRow } = await supabase
        .from('reset_password')
        .select('id, id_usuario, expira_em')
        .eq('token_hash', tokenHash)
        .single();

    if (!tokenRow) {
        throw new Error('TOKEN_INVALIDO');
    }

    if (new Date(tokenRow.expira_em) < new Date()) {
        await supabase.from('reset_password').delete().eq('id', tokenRow.id);
        throw new Error('TOKEN_EXPIRADO');
    }


    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const { error: updateError } = await supabase
        .from('usuario')
        .update({ senha_usuario: senhaHash })
        .eq('id_usuario', tokenRow.id_usuario);

    if (updateError) {
        throw new Error('ERRO_AO_ATUALIZAR_SENHA');
    }

    await supabase.from('reset_password').delete().eq('id', tokenRow.id);

    return tokenRow.id_usuario;
}

module.exports = { reqPasswordReset, resetPassword };