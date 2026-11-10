// compartilha a escolha do design entre as telas igual o AuthContext

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { salvarUsuario } from '../services/tokenStorage';
import { atualizarPreferenciaAcessivel } from '../services/api';
import { defaultPreferences, preferenceKey, resolvePreferences, getDesignColors } from './preferences';

const DesignContext = createContext(null);

export function DesignProvider({ children }) {
  const { usuario, setUsuario } = useAuth();

  let idUsuario = 'guest';
  if (usuario && usuario.id_usuario !== null && usuario.id_usuario !== undefined) {
    idUsuario = usuario.id_usuario;
  }

  const [preferencias, setPreferencias] = useState(defaultPreferences);
  const [usuarioCarregado, setUsuarioCarregado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // evita dois salvamentos
  const salvamentoEmAndamento = useRef(false);

  const usuarioAtual = useRef(idUsuario);
  usuarioAtual.current = idUsuario;

  useEffect(() => {
    let telaAtiva = true;

    async function carregarPreferencias() {
      let preferenciasSalvas = null;

      try {
        const chave = preferenceKey(idUsuario);
        const textoSalvo = await AsyncStorage.getItem(chave);
        preferenciasSalvas = JSON.parse(textoSalvo);
      } catch {
        preferenciasSalvas = null;
      }

      if (telaAtiva) {
        const preferenciasDaConta = resolvePreferences(preferenciasSalvas, usuario);
        setPreferencias(preferenciasDaConta);
        setUsuarioCarregado(idUsuario);
      }
    }

    carregarPreferencias();

    return () => {
      telaAtiva = false;
    };
  }, [idUsuario, usuario?.versao_adaptada]);

  async function salvarPreferencias(alteracoes) {
    // espera a conta carregar para impeder que dois cliques salvem ao mesmo tempo
    if (salvamentoEmAndamento.current || usuarioCarregado !== idUsuario) {
      return false;
    }

    salvamentoEmAndamento.current = true;
    setSalvando(true);

    const novasPreferencias = { ...preferencias, ...alteracoes };
    let usuarioAtualizado = null;

    try {
      // se o design acessível mudou, salva pela API
      if (usuario && novasPreferencias.adapted !== usuario.versao_adaptada) {
        await atualizarPreferenciaAcessivel(usuario.id_usuario, novasPreferencias.adapted);

        if (usuarioAtual.current !== idUsuario) {
          return false;
        }

        usuarioAtualizado = {
          ...usuario,
          versao_adaptada: novasPreferencias.adapted,
        };

        await salvarUsuario(usuarioAtualizado);
      }

      //guarda as preferências locais na chave douser
      const chave = preferenceKey(idUsuario);
      const textoParaSalvar = JSON.stringify(novasPreferencias);
      await AsyncStorage.setItem(chave, textoParaSalvar);

      // atualiza a tela somente depois de salvar e se a conta ainda for a mesma
      if (usuarioAtual.current === idUsuario) {
        setPreferencias(novasPreferencias);

        if (usuarioAtualizado) {
          setUsuario(usuarioAtualizado);
        }
      }

      return true;
    } finally {
      salvamentoEmAndamento.current = false;
      setSalvando(false);
    }
  }

  const c = getDesignColors(preferencias);

  const dadosDoDesign = {
    prefs: preferencias,
    c,
    ready: usuarioCarregado === idUsuario,
    saving: salvando,
    savePreferences: salvarPreferencias,
  };

  return <DesignContext.Provider value={dadosDoDesign}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  return useContext(DesignContext);
}
