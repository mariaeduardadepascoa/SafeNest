const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); //para conseguir acessar e alteara colunas do supabase

function gerarCodigoVerificacaoAleatorio() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4 dígitos)
}

// adicionando o codigo ao seu devido usuario
async function codigoVerificacao(email) {
    const codigo = gerarCodigoVerificacaoAleatorio();
    const expira_em = new Date(Date.now() + 30 * 60 * 1000); //30minutos

    // apaga códigos antigos não verificados desse email antes de criar um novo
    await supabase
        .from('codigo_verificacao')
        .delete()
        .eq('email', email)
        .eq('verificado', false);


    const { error } = await supabase
        .from('codigo_verificacao')
        .insert({ email, codigo, expira_em: expira_em.toISOString() }); //coloca a data no padrao do supabase (2026-07-21T23:30:00.000Z)

    if (error) throw error;

    return codigo;
}

// verificando o codigo
async function verificarCodigo(email, codigo) {
    const { data, error } = await supabase
        .from('codigo_verificacao')
        .select('*')
        .eq('email', email)
        .eq('codigo', codigo)
        .eq('verificado', false)
        .order('criado_em', { ascending: false }) //os resultados vem em ordem decrescente (se o usuario solicitar mais de uma vez o codgio)
        .limit(1) //pega o mais recente
        .maybeSingle();

    if (error) throw error;
    if (!data) return { sucesso: false, razao: 'invalido' };

    if (new Date(data.expira_em) < new Date()) {
        return { sucesso: false, razao: 'expirado' };
    }

    const { error: updateError } = await supabase
        .from('codigo_verificacao')
        .update({ verificado: true })
        .eq('id', data.id);

    if (updateError) throw updateError;

    return { sucesso: true };
}

module.exports = { verificarCodigo, codigoVerificacao, gerarCodigoVerificacaoAleatorio };