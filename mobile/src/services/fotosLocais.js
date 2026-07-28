import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = 'fotos_contatos_emergencia';

export async function getFotosLocais() {
    try {
        const json = await AsyncStorage.getItem(CHAVE);
        return json ? JSON.parse(json) : {};
    } catch (err) {
        console.log('Erro ao ler fotos locais:', err);
        return {};
    }
}

export async function salvarFotoLocal(idContato, uriFoto) {
    try {
        const fotos = await getFotosLocais();
        fotos[idContato] = uriFoto;
        await AsyncStorage.setItem(CHAVE, JSON.stringify(fotos));
    } catch (err) {
        console.log('Erro ao salvar foto local:', err);
    }
}

export async function removerFotoLocal(idContato) {
    try {
        const fotos = await getFotosLocais();
        delete fotos[idContato];
        await AsyncStorage.setItem(CHAVE, JSON.stringify(fotos));
    } catch (err) {
        console.log('Erro ao remover foto local:', err);
    }
}