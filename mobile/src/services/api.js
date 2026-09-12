// IMPLEMENTAÇÃO DOS MÉTODOS DA API

import { salvarTokens, obterAccessToken, obterRefreshToken, deletarTokens, salvarUsuario, obterUsuario, deletarUsuario } from '../services/tokenStorage';
//nao pode ser localhost pois no celular n roda
//const API_URL = 'http://192.168.15.79:3000'; //duda
const API_URL = 'http://192.168.1.5:3000';    //joao       
//const API_URL = 'http://localhost:3000';         //cabo    

//Adiciona o acessToken no header das rotas que são protegidas
async function autenticacaoToken(endpoint, options = {}) {
    let accessToken = await obterAccessToken();

    let resposta = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': "application/json",
            "Authorization": `Bearer ${accessToken}`,
            ...options.headers,
        },
    });

    // Pede um token novo com o refreshToken ao invés de jogar o usuário pro login
    if (resposta.status == 401) { //quando o accessToken expira o middleware da api retorna status 401 
        const refreshToken = await obterRefreshToken();
        const refreshResposta = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResposta.ok) { //aqui o refreshToken expirou, então o usuario deve fazer login novamente
            await deletarTokens();
            throw new Error("SESSAO_EXPIRADA"); //tratar isso no front ARRUMAR
        }

        const { accessToken: novoToken } = await refreshResposta.json(); //cria novo accessToken
        await salvarTokens(novoToken, refreshToken);

        // repete a requisição original com o token novo
        resposta = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${novoToken}`, ...options.headers },
        });
    }

    return resposta;

}

// LOGIN
export async function login(email, senha) {
    const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_usuario: email, senha_usuario: senha }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao fazer login");

    await salvarTokens(data.accessToken, data.refreshToken); //salvando os dois tokens
    await salvarUsuario(data.usuario);

    return data.usuario;
}


// CADASTRO
export async function cadastro(nome, email, senha, ageRange) {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome_usuario: nome,
            email_usuario: email,
            senha_usuario: senha,
            versao_adaptada: ageRange === '60+', //comparação que retorna true ou false
        }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao cadastrar");

    await salvarUsuario(data.usuario);
    return data.usuario;
}

// CRIAR CONTATO DE EMERGÊNCIA
export async function criarContatoEmergencia(id_usuario, nome_contato, telefone_contato) {
    const resposta = await autenticacaoToken(`/usuario/${id_usuario}/contatos`, {
        method: 'POST',
        body: JSON.stringify({ nome_contato, telefone_contato }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao criar contato de emergência");
    return data.contato_emergencia;
}

// OBTER CONTATOS DE EMERGÊNCIA
export async function obterContatosEmergencia(id) {
    const resposta = await autenticacaoToken(`/usuario/${id}/contatos`);
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar contatos de emergência");
    return data;
}

// ATUALIZAR CONTATO DE EMERGÊNCIA
export async function atualizarContatoEmergencia(idUsuario, id_contato, nome_contato, telefone_contato) {
    const resposta = await autenticacaoToken(`/usuario/${idUsuario}/contatos/${id_contato}`, {
        method: 'PUT',
        body: JSON.stringify({ nome_contato, telefone_contato }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao atualizar contato de emergência");
    return data.contato_emergencia;
}

// DELETAR CONTATO DE EMERGÊNCIA
export async function deletarContatoEmergencia(idUsuario, contatoId) {
    const resposta = await autenticacaoToken(`/usuario/${idUsuario}/contatos/${contatoId}`, {
        method: 'DELETE',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao excluir contato de emergência");
    return data.contato_emergencia;
}

// VERIFICAR SE O EMAIL JÁ EXISTE
export async function verificarEmailExiste(email) {
    const resposta = await fetch(`${API_URL}/auth/verificar-email`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_usuario: email }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao verificar email");

    return data.existe; //true ou false
}

// ENVIAR CÓDIGO DE VERIFICAÇÃO DE EMAIL
export async function enviarCodigoVerificacao(email) {
    const resposta = await fetch(`${API_URL}/send-verification-code`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.error || "Erro ao enviar código de verificação");

    return data;
}

// VERIFICAR CÓDIGO DE VERIFICAÇÃO DE EMAIL
export async function verificarCodigoVerificacao(email, codigo) {
    const resposta = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codigo }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.error || "Erro ao verificar código");

    return data;
}


//Usado para listar a fechadura   -- joao 
export async function obterFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/listarFechadura');
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar fechaduras");
    return data.id_fechadura; // objeto ou null
}

export async function abrirFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/abrirFechadura', {
        method: 'POST',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao abrir fechadura");
    return data;
}

export async function travarFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/travarFechadura', {
        method: 'POST',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao travar fechadura");
    return data;
}

export async function destravarFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/destravarFechadura', {
        method: 'POST',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao destravar fechadura");
    return data;
}

export async function excluirFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/removerFechadura', {
        method: 'DELETE',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao excluir fechadura");
    return data;
}

// SENHA ESQUECIDA
export async function forgotPassword(email) {
    const resposta = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao enviar código");
    return data;
}
export async function cadastrarTag(nome_dono) {
    console.log("1. Iniciando cadastrarTag, nome:", nome_dono);

    try {
        const resposta = await autenticacaoToken('/dispositivos/cadastrarTag', {
            method: 'POST',
            body: JSON.stringify({ nome_dono }),
        });

        console.log("2. Fetch retornou, status:", resposta.status);

        const textoResposta = await resposta.text();
        console.log("3. Resposta bruta:", textoResposta);

        const data = JSON.parse(textoResposta);
        if (!resposta.ok) throw new Error(data.erro || "Erro ao cadastrar tag");
        return data;
    } catch (err) {
        console.log("4. ERRO CAPTURADO:", err.message);
        throw err;
    }
}
export async function statusFechadura() {
    const resposta = await autenticacaoToken('/dispositivos/statusFechadura');
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar status");
    return data.blocked;
}
// SENHA RESETADA
export async function resetPassword(token, novaSenha) {
    const resposta = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao redefinir senha");
    return data;
}

// VALIDANDO CODIGO DE SENHA ANTES DE DEIXAR O USUARIO RESETÁ-LA
export async function validateResetCode(code) {
    const resposta = await fetch(`${API_URL}/auth/validate-reset-code`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao validar código");
    return data;
}
