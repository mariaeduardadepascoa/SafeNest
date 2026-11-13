import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const ContextoFotoPerfil = createContext(null);

export function chaveFotoPerfil(idUsuario) {
  if (idUsuario === null || idUsuario === undefined) throw new Error('Entre na sua conta para escolher uma foto.');
  return `foto_perfil_usuario_${idUsuario}`;
}

export async function lerFotoPerfil(idUsuario) {
  return AsyncStorage.getItem(chaveFotoPerfil(idUsuario));
}

export async function guardarFotoPerfil(idUsuario, foto) {
  const chave = chaveFotoPerfil(idUsuario);
  if (foto === null) await AsyncStorage.removeItem(chave);
  else await AsyncStorage.setItem(chave, foto);
}

export function ProvedorFotoPerfil({ children }) {
  const { usuario } = useAuth();
  const idUsuario = usuario?.id_usuario;
  const [fotoSalva, setFotoSalva] = useState({ idUsuario: null, foto: null });
  const ultimaAlteracao = useRef(0);

  useEffect(() => {
    const alteracao = ++ultimaAlteracao.current;
    if (idUsuario !== null && idUsuario !== undefined) {
      lerFotoPerfil(idUsuario).then(foto => {
        if (alteracao === ultimaAlteracao.current) setFotoSalva({ idUsuario, foto });
      }).catch(() => {
        if (alteracao === ultimaAlteracao.current) setFotoSalva({ idUsuario, foto: null });
      });
    }
    return () => { ultimaAlteracao.current += 1; };
  }, [idUsuario]);

  async function salvarFoto(foto) {
    const alteracao = ++ultimaAlteracao.current;
    await guardarFotoPerfil(idUsuario, foto);
    if (alteracao === ultimaAlteracao.current) setFotoSalva({ idUsuario, foto });
  }

  const foto = fotoSalva.idUsuario === idUsuario ? fotoSalva.foto : null;
  return <ContextoFotoPerfil.Provider value={{ foto, salvarFoto }}>{children}</ContextoFotoPerfil.Provider>;
}

export function useFotoPerfil() {
  return useContext(ContextoFotoPerfil);
}
