module.exports = router;
const supabase = require('../config/supabaseClient');

async function criarContato(dadosContatos) {
    const { data, error } = await supabase.from('contatos_emergencia')
        .insert([dadosContatos])
        .select('id_contato, id_usuario, nome_contato, telefone_contato')
        .single()

    if (error) return null;
    return data;
}

// pega todos os contatos de um usuario
async function obterContatosPorUsuario(id_usuario) {
    const { data, error } = await supabase
        .from('contatos_emergencia')
        .select('id_contato, id_usuario, nome_contato, telefone_contato')
        .eq('id_usuario', id_usuario)
    // sem .single para se caso ele nao ter nenhum contato, retornar um array vazio

    if (error) {
        console.log(error)
        return null;
    }
    return data;
}

// pega 1 contato especifico de um usuario
async function obterContatoPorId(id) {
    const { data, error } = await supabase
        .from('contatos_emergencia')
        .select('id_contato, id_usuario, nome_contato, telefone_contato')
        .eq('id_contato', id)
        .single();

    if (error) return null;
    return data;
}

async function atualizarContato(contatoId, dadosAtualizados) {
    const { data, error } = await supabase.from('contatos_emergencia')
        .update(dadosAtualizados)
        .eq('id_contato', contatoId)
        .select('id_contato, id_usuario, nome_contato, telefone_contato')
        .single()

    if (error) return null;
    return data;
}

async function deletarContato(contatoId) {
    const { data, error } = await supabase.from('contatos_emergencia')
        .delete()
        .eq('id_contato', contatoId)
        .select('id_contato, id_usuario, nome_contato, telefone_contato')
        .single()

    if (error) return null;
    return data;
}

module.exports = { obterContatosPorUsuario, atualizarContato, criarContato, deletarContato, obterContatoPorId };