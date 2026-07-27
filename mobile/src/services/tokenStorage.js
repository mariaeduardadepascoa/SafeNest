// ARQUIVO PARA DADOS DE SESSÃO QUE SERÃO SALVOS LOCALMENTE (token e id de usuário)
import * as SecureStore from 'expo-secure-store';

export async function salvarTokens(accessToken, refreshToken) { //salvando o acessToken e o refreshToken aqui com os mesmos nomes
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
}

export async function obterAccessToken() {
    return await SecureStore.getItemAsync('accessToken');
}
export async function obterRefreshToken() {
    return await SecureStore.getItemAsync('refreshToken');
}

export async function deletarTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
}

export async function salvarUsuario(usuario){
    await SecureStore.setItemAsync('usuario', JSON.stringify(usuario));
}

export async function obterUsuario(){
    const usuarioSalvo = await SecureStore.getItemAsync('usuario');
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

export async function deletarUsuario() {
    await SecureStore.deleteItemAsync('usuario');
}