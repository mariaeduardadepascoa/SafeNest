// compartilha a escolha do design entre as telas igual o AuthContext

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { salvarUsuario } from '../services/tokenStorage';
import { atualizarPreferenciaAcessivel } from '../services/api';
import { preferenciasIniciais, chavePreferencias, lerPreferencias, coresDoVisual } from './preferences';

const ContextoVisual = createContext(null);

export function ProvedorVisual({ children }) {
  const { usuario, setUsuario } = useAuth();

  let idUsuario = 'guest';
  if (usuario && usuario.id_usuario !== null && usuario.id_usuario !== undefined) {
    idUsuario = usuario.id_usuario;
  }

  const [preferencias, setPreferencias] = useState(preferenciasIniciais);
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
        const chave = chavePreferencias(idUsuario);
        const textoSalvo = await AsyncStorage.getItem(chave);
        preferenciasSalvas = JSON.parse(textoSalvo);
      } catch {
        preferenciasSalvas = null;
      }

      if (telaAtiva) {
        const preferenciasDaConta = lerPreferencias(preferenciasSalvas, usuario);
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
    // Espera a conta carregar e evita dois salvamentos ao mesmo tempo.
    if (salvamentoEmAndamento.current || usuarioCarregado !== idUsuario) {
      return false;
    }

    salvamentoEmAndamento.current = true;
    setSalvando(true);
    const inicioDaTroca = Date.now();

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

      // Guarda as preferências no espaço reservado para esta pessoa.
      const chave = chavePreferencias(idUsuario);
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
      // Dá tempo de mostrar o indicador mesmo quando o salvamento é muito rápido.
      const tempoRestante = Math.max(0, 300 - (Date.now() - inicioDaTroca));
      if (tempoRestante > 0) await new Promise(concluir => setTimeout(concluir, tempoRestante));
      salvamentoEmAndamento.current = false;
      setSalvando(false);
    }
  }

  const c = coresDoVisual(preferencias);

  const dadosDoDesign = {
    prefs: preferencias,
    c,
    ready: usuarioCarregado === idUsuario,
    saving: salvando,
    savePreferences: salvarPreferencias,
  };

  return <ContextoVisual.Provider value={dadosDoDesign}>
    {children}
    <Modal visible={salvando} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={{ flex: 1, backgroundColor: 'rgba(11,35,66,0.32)', alignItems: 'center', justifyContent: 'center' }} accessibilityViewIsModal>
        <View style={{ padding: 28, borderRadius: 20, backgroundColor: c.surface, alignItems: 'center', gap: 14 }} accessibilityRole="progressbar" accessibilityLabel="Aplicando suas preferências" accessibilityState={{ busy: true }}>
          <ActivityIndicator size="large" color={c.accent} />
          <Text style={{ color: c.text, fontSize: 18 }}>Aplicando preferências…</Text>
        </View>
      </View>
    </Modal>
  </ContextoVisual.Provider>;
}

export function useVisual() {
  return useContext(ContextoVisual);
}
