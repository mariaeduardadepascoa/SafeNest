// IMPLEMENTAÇÃO DOS MÉTODOS DA API

import { salvarTokens, obterAccessToken, obterRefreshToken, deletarTokens } from '../services/tokenStorage';

const API_URL = 'http://192.168.15.163:3000'; //nao pode ser localhost pois no celular n roda

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
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({refreshToken}),
        });

        if (!refreshResposta.ok) { //aqui o refreshToken expirou, então o usuario deve fazer login novamente
            await deletarTokens();
            throw new Error("SESSAO_EXPIRADA"); //tratar isso no front ARRUMAR
        }
    
        const {accessToken: novoToken } = await refreshResposta.json(); //cria novo accessToken
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

    return data.usuario;
}


// OBTER CONTATOS DE EMERGÊNCIA
export async function obterContatosEmergencia(id) {
    const resposta = await autenticacaoToken(`/usuario/${id}/contatos`);
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar contatos de emergência");
    return data;
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