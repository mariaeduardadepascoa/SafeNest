// CONTEXT PARA UM COMPONENTE DE AUTENTICAÇÃO QUE VERIFICA SE O USUARIO ESTÁ LOGADO OU NÃO EM QUALQUER TELA
import { createContext, useState, useContext, useEffect } from 'react';
import { obterAccessToken, deletarTokens } from '../services/tokenStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // ve se o usuario tem um accessToken guardado
    useEffect(()=> {    
        async function verificarSessao(){
            const accessToken = await obterAccessToken();
            setUsuario(accessToken ? {} : null); //se existir retorna nada já q o usuario esta logado, ja se n existir retorna null (deslogado) ARRUMAR
            setCarregando(false); //determina que parou de carregar
        }
        verificarSessao();
    }, []); //esse array garante que o useEffect só rode uma vez, ao montar(na primeira vez) e nunca mais

    async function logout() {
        await deletarTokens();
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{usuario, setUsuario, logout, setCarregando}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);