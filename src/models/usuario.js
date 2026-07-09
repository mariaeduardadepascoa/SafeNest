// retira do banco
const supabase = require('../config/supabaseClient');

async function obterUsuarios() {
    const { data, error } = await supabase.from('usuario').select('id, nome_usuario, email_usuario, versao_adaptada');

    if (error) {
        return null;
    }

    return data;
}

async function obterUsuarioPorId(id) {
    const { data, error } = await supabase.from('usuario')
        .select('*') //pega tudo
        .eq('id', id) //busca o usurio pelo id
        .single(); //vem como um objeto e nao como um array

    if (error) return null;
    return data;
}

async function buscarPorEmailESenha(email, senha) {
    const { data, error } = await supabase.from('usuario')
        .select('*')
        .eq('email_usuario', email)
        .eq('senha_usuario', senha)
        .single();

    if (error) return null;
    return data;
}

async function atualizarUsuario(id, dadosAtualizados) {
    const { data, error } = await supabase.from('usuario')
        .update(dadosAtualizados)
        .eq('id', id)
        .select('id, nome_usuario, email_usuario, versao_adaptada')
        .single()

    if (error) return null;
    return data;
}

async function deletarUsuario(id) {
    const { data, error } = await supabase.from('usuario')
        .delete()
        .eq('id', id)
        .select('id, nome_usuario, email_usuario, versao_adaptada')
        .single()

    if (error) return null;
    return data;
}

module.exports = { obterUsuarios, obterUsuarioPorId, buscarPorEmailESenha, atualizarUsuario, deletarUsuario };