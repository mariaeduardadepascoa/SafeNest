const supabase = require('../config/supabaseClient');

async function obterAcessos(id_usuario) {
    const {data, error} = await supabase
        .from('acessos')
        .select('id_acesso, id_tag, data_hora, id_usuario')
        .eq('id_usuario', id_usuario);

    if (error) {
        console.log(error); 
        return null;
    }
    return data;
}

async function obterAlertas(id_usuario) {
    const {data, error} = await supabase
        .from('alertas')
        .select('id_alertas, tipo_alerta, data_hora, id_usuario, imagem_url')
        .eq('id_usuario', id_usuario);

    if (error) {
        console.log(error); 
        return null;
    }
    return data;
}

module.exports = { obterAcessos, obterAlertas };