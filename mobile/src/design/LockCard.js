import React, { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { abrirFechadura, destravarFechadura, excluirFechadura, obterFechadura, statusFechadura, travarFechadura } from '../services/api';
import { Botao, Cartao, TituloSecao, Icone, TituloPagina, Linha, Tela, Texto } from './UI';
import { useVisual } from './DesignProvider';

export function CartaoFechadura({ navigation, details = false }) {
  const { c } = useVisual();
  const [id, setId] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Guarda se um comando já está sendo enviado, sem esperar a tela atualizar.
  const running = useRef(false);

  // Consulta a API ao abrir a tela ou tocar em Atualizar estado.
  useFocusEffect(useCallback(() => {
    let telaAtiva = true;

    async function carregarFechadura() {
      setLoading(true);
      setError('');

      try {
        const idFechadura = await obterFechadura();

        if (telaAtiva) {
          setId(idFechadura);
          setBlocked(null);
        }

        if (idFechadura) {
          const acessoBloqueado = await statusFechadura();

          if (telaAtiva) {
            setBlocked(acessoBloqueado);
          }
        }
      } catch (erro) {
        if (telaAtiva) {
          setError(erro.message);
          setBlocked(null);
        }
      } finally {
        if (telaAtiva) {
          setLoading(false);
        }
      }
    }

    carregarFechadura();

    return () => {
      telaAtiva = false;
    };
  }, [refresh]));

  // A ação recebida é uma função já existente da API, por exemplo abrirFechadura.
  async function enviarComando(acao, abrindoPorta = false) {
    if (running.current) {
      return;
    }

    running.current = true;
    setBusy(true);

    try {
      await acao(id);

      if (abrindoPorta) {
        // A API confirma o envio. Isso não comprova que a porta abriu fisicamente.
        Alert.alert('Comando enviado', 'O pedido de abertura foi enviado à fechadura.');
      } else {
        const acessoBloqueado = await statusFechadura();
        setBlocked(acessoBloqueado);
      }
    } catch (erro) {
      setBlocked(null);
      Alert.alert('Não foi possível concluir', erro.message);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return <Cartao style={{ gap: 18 }}>
    <Linha><View style={{ backgroundColor: c.raised, padding: 14, borderRadius: 16 }}><Icone name="lock" size={24} /></View>
      <View style={{ flex: 1 }}><Texto weight="600" size={17}>Fechadura de entrada</Texto>
        <Texto muted size={12} accessibilityLiveRegion="polite">{loading ? 'Consultando dispositivo…' : error ? 'Não foi possível consultar' : !id ? 'Nenhuma fechadura vinculada' : blocked === null ? 'Estado indisponível' : blocked ? 'Acesso bloqueado' : 'Acesso liberado'}</Texto>
      </View>
    </Linha>
    {!!error && <Texto style={{ color: c.red }}>{error}</Texto>}
    <Botao title="Atualizar estado" secondary disabled={busy || loading} onPress={() => setRefresh(v => v + 1)} />
    <Botao title="Abrir fechadura" busy={busy || loading} disabled={!id || !!error} onPress={() => Alert.alert('Abrir a fechadura?', 'Confirme para enviar o comando ao dispositivo.', [
      { text: 'Cancelar', style: 'cancel' }, { text: 'Abrir', onPress: () => enviarComando(abrirFechadura, true) },
    ])} />
    {details ? <>
      <Botao title={blocked ? 'Liberar acesso' : 'Bloquear acesso'} secondary disabled={busy || loading || !id || blocked === null}
        onPress={() => enviarComando(blocked ? destravarFechadura : travarFechadura)} />
      <Botao title="Gerenciar tags de acesso" secondary onPress={() => navigation.navigate('Tags')} />
      <Botao title="Remover fechadura" destructive disabled={busy || loading || !id} onPress={() => Alert.alert('Remover fechadura?', 'O vínculo será removido da sua conta.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: async () => {
          if (running.current) return;
          running.current = true; setBusy(true);
          try { await excluirFechadura(); setId(null); setBlocked(null); }
          catch (e) { Alert.alert('Erro ao remover', e.message); }
          finally { running.current = false; setBusy(false); }
        } },
      ])} />
    </> : <Botao title="Ver detalhes da fechadura" secondary onPress={() => navigation.navigate('Fechadura')} />}
  </Cartao>;
}
export default function TelaFechadura({ navigation }) {
  return <Tela navigation={navigation} back><TituloPagina eyebrow="CONTROLE DE ACESSO" title="Sua fechadura" subtitle="Controle o acesso à sua casa." /><CartaoFechadura navigation={navigation} details /></Tela>;
}
