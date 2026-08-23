
const supabase = require('../config/supabaseClient');

async function buscarFechadura(id_fechadura) {

    const { data, error } = await supabase
        .from('fechaduras')
        .select('mac_address')
        .eq('id', id_fechadura)
        .single();

    if (error) {
        console.error('Erro Supabase:', error);
        return null;
    }
    return data.mac_address;
}

async function buscarFechaduraPorMacAddress(mac) {
    const { data, error } = await supabase
        .from('fechaduras')
        .select('id')
        .eq('mac_address', mac)
        .single();

    if (error) return null;
    return data.id;
}

async function buscarFechaduraPorUsuario(id_usuario) {
    const { data, error } = await supabase
        .from('fechaduras')
        .select('id')
        .eq('id_usuario', id_usuario)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar fechadura do usuário:', error);
        return null;
    }
    return data.id;
}

async function verificarTag(tag, lock) {
    const { data, error } = await supabase
        .from("nfc_tags")
        .select("id_tag")
        .eq("uid_nfc", tag)
        .eq("id_fechadura", lock)
        .maybeSingle();

    if (error) {
        console.error("Erro ao verificar tag:", error);
        return false;
    }
    return !!data;
}

async function salvarRegistroNoBanco(idUsuario, uidNfc, idFechadura, user_name) {
    const { data, error } = await supabase
        .from("nfc_tags")
        .insert({
            id_usuario: idUsuario,
            uid_nfc: uidNfc,
            id_fechadura: idFechadura,
            data_hora: new Date().toISOString(),
            nome_tag: user_name
        })
        .select();
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}
async function cadastrarFechaduraNoBanco(idFechadura, idUsuario) {
    const { data, error } = await supabase
        .from("fechaduras")
        .insert({
            id_usuario: idUsuario,
            mac_address: idFechadura,
            status: true,
            data_hora: new Date().toISOString(),
            blocked: false
        });
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}

async function verificarTrancada(idFechadura) {
    const { data, error } = await supabase
        .from("fechaduras")
        .select("blocked")
        .eq("id", idFechadura)
        .single();

    if (error) {
        console.error(error);
        return null;
    }
    return data;
}
async function addAcesso(tag, user) {
    const { data, error } = await supabase
        .from("acessos")
        .insert({
            id_tag: tag,
            id_usuario: user
        })
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}
async function addAlerta(tipo, user) {
    const { data, error } = await supabase
        .from("alertas")
        .insert({
            tipo_alerta: tipo,
            id_usuario: user
        })
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}

async function obterAlertas(user) {
    const { data,error } = await supabase
        .from("alertas")
        .select('*')
        .eq("id_usuario",user)

    if(error){
        console.error(error);
        return null;
    }
    return data;
}
async function obterAcessos(user) {
    const { data,error } = await supabase
        .from("acessos")
        .select('*')
        .eq("id_usuario",user)

    if(error){
        console.error(error);
        return null;
    }
    return data;
}
async function buscarUsuarioPorFechadura(id_lock) {
    const { data, error } = await supabase
    .from("fechaduras")
    .select("id_usuario")
    .eq("id",id_lock)
    .single();
     if (error) {
        console.error(error);
        return null;
    }
    return data.id_usuario;
}
async function removerFechaduradoBanco(id_lock) {
    const {data,error} = await supabase
    .from("fechaduras")
    .delete()
    .eq("id", id_lock)
    .single();
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}
async function atualizarStatusFechadura(id_fechadura, blocked) {
    const { data, error } = await supabase
        .from('fechaduras')
        .update({ blocked })
        .eq('id', id_fechadura)
        .select();

    if (error) {
        console.error('Erro ao atualizar status da fechadura:', error);
        return null;
    }
    return data;
}
module.exports = {
    buscarFechadura,
    buscarFechaduraPorMacAddress,
    buscarFechaduraPorUsuario,
    verificarTag,
    salvarRegistroNoBanco,
    cadastrarFechaduraNoBanco,
    addAcesso,
    addAlerta,
    buscarUsuarioPorFechadura,
    removerFechaduradoBanco,
    obterAlertas,
    obterAcessos,
    verificarTag,
    verificarTrancada,
    atualizarStatusFechadura
};

// module.exports = { buscarFechadura,buscarFechaduraPorMacAddress,verificarTag,salvarRegistroNoBanco }