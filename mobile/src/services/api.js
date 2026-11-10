// IMPLEMENTAÇÃO DOS MÉTODOS DA API

// import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { salvarTokens, obterAccessToken, obterRefreshToken, deletarTokens, salvarUsuario, obterUsuario, deletarUsuario } from '../services/tokenStorage';
//nao pode ser localhost pois no celular n roda
const API_URL = 'http://192.168.15.79:3000'; //duda
//const API_URL = 'http://192.168.1.7:3000';    //joao   
const DISPOSITIVOS_API_URL = "http://192.168.15.79:8080";// duda
//const DISPOSITIVOS_API_URL = "http://192.168.1.7:8080";// joao

// BENTOTEC
// const API_URL = 'http://192.168.137.1:3000'; 
// const DISPOSITIVOS_API_URL = "http://192.168.137.1:8080";
// const API_URL = 'http://192.168.137.1:3000';
// const DISPOSITIVOS_API_URL = 'http://192.168.137.1:8080';


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
async function autenticacaoTokenDispositivos(endpoint, options = {}) {
    let accessToken = await obterAccessToken();

    let resposta = await fetch(`${DISPOSITIVOS_API_URL}${endpoint}`, {
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
        resposta = await fetch(`${DISPOSITIVOS_API_URL}${endpoint}`, {
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
export async function cadastro(nome, email, senha, ageRange, versaoAdaptada = ageRange === '60+') {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome_usuario: nome,
            email_usuario: email,
            senha_usuario: senha,
            versao_adaptada: versaoAdaptada,
        }),
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao cadastrar");

    await salvarUsuario(data.usuario);
    return data.usuario;
}


// ------------------------------------ SEÇÃO DE CONTATOS DE EMERGENCIA
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


// ------------------------------------

// ------------------------------------ SEÇÃO DE HISTÓRICO
export async function obterHistorico(id) {
    const resposta = await autenticacaoToken(`/usuario/${id}/historico`);
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar acessos e alertas deste usuário");
    return data;
}


// ------------------------------------

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
    const resposta = await autenticacaoTokenDispositivos('/fechadura', {
        method: 'GET',
    });
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar fechaduras");
    return data.id_fechadura;
}

export async function abrirFechadura(id_fechadura) {
    const resposta = await autenticacaoTokenDispositivos(
        '/fechadura/abrir',
        {
            method: 'POST',
            body: JSON.stringify({ id_fechadura }),
        }
    );

    const data = await resposta.json();
    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao abrir fechadura");
    }
    return data;
}

export async function travarFechadura(id_fechadura) {
    const resposta = await autenticacaoTokenDispositivos(
        '/fechadura/travar',
        {
            method: 'POST',
            body: JSON.stringify({ id_fechadura }),
        }
    );
    const data = await resposta.json();
    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao travar fechadura");
    }
    return data;
}

export async function destravarFechadura(id_fechadura) {
    const resposta = await autenticacaoTokenDispositivos(
        '/fechadura/destravar',
        {
            method: 'POST',
            body: JSON.stringify({ id_fechadura }),
        }
    );
    const data = await resposta.json();

    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao destravar fechadura");
    }
    return data;
}

export async function excluirFechadura() {
    const resposta = await autenticacaoTokenDispositivos('/fechadura', {
        method: 'DELETE',
    });

    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao excluir fechadura");
    return data;
}

export async function cadastrarTag(nome_dono) {
    console.log("1. Iniciando cadastrarTag, nome:", nome_dono);

    try {
        const resposta = await autenticacaoTokenDispositivos('/fechadura/tag', {
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

// joaoo, para as tags

// LISTAR TODAS AS TAGS DO USUÁRIO
export async function obterTags() {
    const resposta = await autenticacaoTokenDispositivos('/fechadura/tags', {
        method: 'GET',
    });

    const data = await resposta.json();

    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao buscar tags");
    }

    return data;
}

// BUSCAR UMA TAG ESPECÍFICA
export async function obterTag(idTag) {
    const resposta = await autenticacaoTokenDispositivos(
        `/fechadura/tag/${idTag}`,
        {
            method: 'GET',
        }
    );

    const data = await resposta.json();

    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao buscar tag");
    }

    return data;
}

// ATUALIZAR O NOME DE UMA TAG
export async function atualizarTag(idTag, nomeTag) {
    const resposta = await autenticacaoTokenDispositivos(
        `/fechadura/tag/${idTag}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                nome_tag: nomeTag,
            }),
        }
    );

    const data = await resposta.json();

    if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao atualizar tag");
    }

    return data;
}

// EXCLUIR UMA TAG
export async function deletarTag(idTag) {
    const resposta = await autenticacaoTokenDispositivos(
        `/fechadura/tag/${idTag}`,
        {
            method: 'DELETE',
        }
    );

    const texto = await resposta.text();
    const data = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
        throw new Error(data?.erro || "Erro ao excluir tag");
    }

    return data;
}

export async function statusFechadura() {
    const resposta = await autenticacaoTokenDispositivos('/fechadura/status');
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar status");
    return data.blocked;
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

// Uses the existing authenticated account endpoint; never stores a simulated setting.
export async function atualizarPreferenciaAcessivel(id, versao_adaptada) {
    const resposta = await autenticacaoToken(`/usuario/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ versao_adaptada }),
    });
    const data = await resposta.json();
    if (!resposta.ok) throw new Error(data.erro || 'Não foi possível salvar o design acessível');
    return data.usuario;
}

// ------------------------------------ SEÇÃO DE CÂMERAS

// LISTAR CÂMERAS DO USUÁRIO
export async function obterCameras(idUsuario) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/usuario/${idUsuario}`);

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar câmeras");

    return data;
}

// CADASTRAR CÂMERA
export async function cadastrarCamera(camera) {
    const resposta = await autenticacaoTokenDispositivos('/cameras/usuario', {
        method: 'POST',
        body: JSON.stringify(camera),
    });

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao cadastrar câmera");

    return data;
}

// ATUALIZAR CÂMERA
export async function atualizarCamera(idCamera, camera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}`, {
        method: 'PUT',
        body: JSON.stringify(camera),
    });

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao atualizar câmera");

    return data;
}

// REMOVER CÂMERA
export async function removerCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}`, {
        method: 'DELETE',
    });

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}));
        throw new Error(data.erro || "Erro ao remover câmera");
    }

    return true;
}

// CONSULTAR STATUS DA CÂMERA
export async function obterStatusCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}/status`);

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar status da câmera");

    return data;
}

// SINCRONIZAR TODAS AS CÂMERAS DO USUÁRIO
export async function sincronizarCameras(idUsuario) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/usuario/${idUsuario}/sincronizar`, {
        method: 'POST',
    });

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao sincronizar câmeras");

    return data;
}

// SINCRONIZAR UMA CÂMERA
export async function sincronizarCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}/sincronizar`, {
        method: 'POST',
    });

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao sincronizar câmera");

    return data;
}

// CONSULTAR STATUS DA IA
export async function obterStatusIaCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}/ia/status`);

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar status da IA");

    return data;
}

// OBTER URL DA TRANSMISSÃO WEBRTC
export async function obterVideoCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}/video`);

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao obter transmissão da câmera");

    return data.url;
}

// OBTER FOTO DO ÚLTIMO ALERTA DA IA
export async function obterFotoCamera(idCamera) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/${idCamera}/ia/foto`);

    if (!resposta.ok) throw new Error("Erro ao buscar foto da câmera");

    const blob = await resposta.blob();

    return blob;
}

// LISTAR ALERTAS DAS CÂMERAS
export async function obterAlertasCameras(idUsuario) {
    const resposta = await autenticacaoTokenDispositivos(`/cameras/alertas/usuario/${idUsuario}`);

    const data = await resposta.json();

    if (!resposta.ok) throw new Error(data.erro || "Erro ao buscar alertas das câmeras");

    return data;
}
