// CONTEXT PARA UM COMPONENTE DE AUTENTICAÇÃO QUE CARREGA O USUARIO E SUAS INFO'S SALVOS NO APP
import { createContext, useState, useContext, useEffect } from 'react';
import { obterAccessToken, deletarTokens, obterUsuario, deletarUsuario } from '../services/tokenStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // ve se o usuario tem um accessToken guardado
    useEffect(()=> {    
        async function verificarSessao(){
            const accessToken = await obterAccessToken();
            if (accessToken) {
                const usuarioSalvo = await obterUsuario();
                setUsuario(usuarioSalvo);
            } else {
                setUsuario(null);
            }
            setCarregando(false);
        }
        verificarSessao();
    }, []); //esse array garante que o useEffect só rode uma vez, ao montar(na primeira vez) e nunca mais

    async function logout() {
        await deletarTokens();
        await deletarUsuario();
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{usuario, setUsuario, logout, setCarregando}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);