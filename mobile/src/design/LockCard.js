import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { abrirFechadura, destravarFechadura, excluirFechadura, obterFechadura, statusFechadura, travarFechadura } from '../services/api';
import { Botao, Cartao, TituloSecao, Icone, TituloPagina, Linha, Tela, Texto } from './UI';
import { useVisual } from './DesignProvider';
import UrlModal from '../components/UrlModal';
import { obterAccessToken } from '../services/tokenStorage';
import { useAuth } from '../context/AuthContext';

export function CartaoFechadura({ navigation, details = false }) {
  const { c } = useVisual();
  const { usuario } = useAuth();
  const [id, setId] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [tokenCadastro, setTokenCadastro] = useState('');
  const [abrindoCadastro, setAbrindoCadastro] = useState(false);

  async function adicionarFechadura() {
    if (running.current) return;
    running.current = true;
    setAbrindoCadastro(true);
    try {
      const token = await obterAccessToken();
      if (!token) throw new Error('Entre novamente na sua conta para cadastrar a fechadura.');
      setTokenCadastro(token);
      setCadastroAberto(true);
    } catch (erro) {
      Alert.alert('Não foi possível abrir o cadastro', erro.message);
    } finally {
      running.current = false;
      setAbrindoCadastro(false);
    }
  }

  // Guarda se um comando já está sendo enviado, sem esperar a tela atualizar.
  const running = useRef(false);
  const numeroDoComando = useRef(0);

  // Ao voltar das configurações do Wi-Fi, consulta o vínculo novamente.
  useEffect(() => {
    const retornoAoApp = AppState.addEventListener('change', estado => {
      if (estado === 'active') setRefresh(valor => valor + 1);
    });
    return () => retornoAoApp.remove();
  }, []);

  // Consulta ao abrir e a cada cinco segundos, sem interromper os comandos.
  useFocusEffect(useCallback(() => {
    let telaAtiva = true;
    let novaConsulta;
    let primeiraConsulta = true;
    setId(null);

    async function carregarFechadura() {
      if (!telaAtiva) return;
      if (AppState.currentState !== 'active' || running.current) {
        novaConsulta = setTimeout(carregarFechadura, 5000);
        return;
      }
      if (primeiraConsulta) setLoading(true);
      const comandoConsultado = numeroDoComando.current;

      try {
        const idFechadura = await obterFechadura();
        if (!telaAtiva || comandoConsultado !== numeroDoComando.current || running.current) return;

        if (telaAtiva) {
          setId(idFechadura);
          setError('');
          if (!idFechadura) setBlocked(null);
        }

        if (idFechadura) {
          const acessoBloqueado = await statusFechadura();

          if (telaAtiva && comandoConsultado === numeroDoComando.current && !running.current) {
            setBlocked(acessoBloqueado);
          }
        }
      } catch (erro) {
        if (telaAtiva && comandoConsultado === numeroDoComando.current && !running.current) {
          setError(erro.message);
          setBlocked(null);
        }
      } finally {
        if (telaAtiva) {
          setLoading(false);
          primeiraConsulta = false;
          novaConsulta = setTimeout(carregarFechadura, 5000);
        }
      }
    }

    carregarFechadura();

    return () => {
      telaAtiva = false;
      clearTimeout(novaConsulta);
    };
  }, [refresh, usuario?.id_usuario]));

  // A ação recebida é uma função já existente da API, por exemplo abrirFechadura.
  async function enviarComando(acao, abrindoPorta = false) {
    if (running.current) {
      return;
    }

    running.current = true;
    setBusy(true);
    numeroDoComando.current += 1;

    try {
      await acao(id);

      if (!abrindoPorta) {
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
    {!id && !loading && !error && <Texto muted>Aguardando o vínculo com sua conta. Após configurar, volte ao Wi-Fi da casa e feche a configuração.</Texto>}
    {!id && !error && <Botao title="Adicionar fechadura" busy={abrindoCadastro} disabled={busy || loading} onPress={adicionarFechadura} />}
    <UrlModal visible={cadastroAberto} url="http://192.168.4.1" accessToken={tokenCadastro}
      onClose={() => { setCadastroAberto(false); setTokenCadastro(''); setRefresh(valor => valor + 1); }} />
    {!!id && <>
    <Botao title="Abrir fechadura" busy={busy || loading} disabled={!id || !!error} onPress={() => enviarComando(abrirFechadura, true)} />
    {details ? <>
      <Botao title={blocked ? 'Liberar acesso' : 'Bloquear acesso'} secondary disabled={busy || loading || !id || blocked === null}
        onPress={() => enviarComando(blocked ? destravarFechadura : travarFechadura)} />
      <Botao title="Gerenciar tags de acesso" secondary onPress={() => navigation.navigate('Tags')} />
      <Botao title="Remover fechadura" destructive disabled={busy || loading || !id} onPress={() => Alert.alert('Remover fechadura?', 'O vínculo será removido da sua conta.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: async () => {
          if (running.current) return;
          running.current = true; setBusy(true);
          numeroDoComando.current += 1;
          try { await excluirFechadura(); setId(null); setBlocked(null); }
          catch (e) { Alert.alert('Erro ao remover', e.message); }
          finally { running.current = false; setBusy(false); }
        } },
      ])} />
    </> : <Botao title="Ver detalhes da fechadura" secondary onPress={() => navigation.navigate('Fechadura')} />}
    </>}
  </Cartao>;
}
export default function TelaFechadura({ navigation }) {
  return <Tela navigation={navigation} back><TituloPagina eyebrow="CONTROLE DE ACESSO" title="Sua fechadura" subtitle="Controle o acesso à sua casa." /><CartaoFechadura navigation={navigation} details /></Tela>;
}
