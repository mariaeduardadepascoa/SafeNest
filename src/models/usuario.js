// retira do banco
const supabase = require('../config/supabaseClient');

async function obterUsuarios() {
    const { data, error } = await supabase.from('usuario').select('id_usuario, nome_usuario, email_usuario, versao_adaptada');

    if (error) {
        return null;
    }

    return data;
}

async function obterUsuarioPorId(id) {
    const { data, error } = await supabase.from('usuario')
        .select('*') //pega tudo
        .eq('id_usuario', id) //seleciona e busca o usurio pelo id
        .single(); //vem como um objeto e nao como um array

    if (error) return null;
    return data;
}

async function buscarEmail(email_usuario) {
    const email = email_usuario.trim().toLowerCase(); //.trim -> tira espaços .toLowerCase -> deixa tudo minusculo para saber diferenciar (duda@gmail e DUDA@gmail)

    const { data, error } = await supabase.from('usuario')
        .select('*')
        .eq('email_usuario', email)
        .single();

    if (error) return null;
    return data;
}

async function atualizarUsuario(id, dadosAtualizados) {
    const { data, error } = await supabase.from('usuario')
        .update(dadosAtualizados)
        .eq('id_usuario', id)
        .select('id_usuario, nome_usuario, email_usuario, versao_adaptada')
        .single()

    if (error) return null;
    return data;
}

async function deletarUsuario(id) {
    const { data, error } = await supabase.from('usuario')
        .delete()
        .eq('id_usuario', id)
        .select('id_usuario, nome_usuario, email_usuario, versao_adaptada')
        .single()

    if (error) return null;
    return data;
}

async function criarUsuario(dadosUsuario) {
    const { data, error } = await supabase.from('usuario')
        .insert([dadosUsuario])
        .select('id_usuario, nome_usuario, email_usuario, versao_adaptada')
        .single();
    if (error) {
        console.log(error);
        // if para evitar cadastro com o mesmo email
        if (error.code === '23505') { //23505 -> erro do postgreSQL(supabase) quando algo é UNIQUE
            return { erro: 'email_duplicado' };
        }
        return null;
    }
    return data;
}

module.exports = { obterUsuarios, obterUsuarioPorId, buscarEmail, atualizarUsuario, deletarUsuario, criarUsuario };