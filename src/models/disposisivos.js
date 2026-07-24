
const supabase = require('../config/supabaseClient');

async function buscarFechadura(id_fechadura) {
    console.log('id recebido:', id_fechadura); // <-- adiciona essa linha também
    const { data, error } = await supabase
        .from('fechaduras')
        .select('mac_address')
        .eq('id', id_fechadura)
        .single();

    if (error) {
        console.error('Erro Supabase:', error); // <-- essa aqui
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
    return data; 
}

async function verificarTag(tag, lock) {
    const { data, error } = await supabase
        .from("nfc_tags")
        .select("id_tag")
        .eq("uid_nfc", tag)
        .eq("id_fechadura", lock)
        .single();

    if (error) {
        console.error("Erro ao verificar tag:", error);
        return false;
    }
    return !!data;
}

async function salvarRegistroNoBanco(idUsuario, uidNfc, idFechadura) {
    const { data, error } = await supabase
        .from("nfc_tags")
        .insert({
            id_usuario: idUsuario,
            uid_nfc: uidNfc,
            id_fechadura: idFechadura,
            data_hora: new Date().toISOString()
        });

    if (error) {
        console.error(error);
        return null;
    }
    return data;
}

async function cadastrarFechaduraNoBanco(idFechadura,idUsuario) {
    const { data, error } = await supabase
        .from("fechaduras")
        .insert({
            id_usuario: idUsuario,
            mac_address: idFechadura,
            status: true,
            data_hora: new Date().toISOString()
        });

    if (error) {
        console.error(error);
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
    cadastrarFechaduraNoBanco
};

// module.exports = { buscarFechadura,buscarFechaduraPorMacAddress,verificarTag,salvarRegistroNoBanco }