const supabase = require('../config/supabaseClient');

async function buscarPorEmailESenha(email, senha) {
    const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('email_usuario', email)
        .eq('senha_usuario', senha)
        .single();

    if (error) return null;
    return data;
}

module.exports = { buscarPorEmailESenha };