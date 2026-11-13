import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useVisual } from '../design/DesignProvider';
import { Botao, Cartao, TituloPagina, TituloSecao, Tela, Texto } from '../design/UI';
import TransmissaoCamera from '../design/CameraStream';
import { obterCameras, cadastrarCamera, atualizarCamera, removerCamera, obterStatusCamera,
  sincronizarCameras, obterStatusIaCamera, obterVideoCamera } from '../services/api';

export default function CameraScreen({ navigation }) {
  const { usuario } = useAuth();
  const { c, prefs } = useVisual();
  const telaAberta = useIsFocused();
  const [cameras, setCameras] = useState([]);
  const [cameraAtual, setCameraAtual] = useState(null);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [avisoVideo, setAvisoVideo] = useState('');
  const [estadoCamera, setEstadoCamera] = useState(null);
  const [estadoIa, setEstadoIa] = useState(null);
  const [erroConsulta, setErroConsulta] = useState('');
  const [erroSincronizacao, setErroSincronizacao] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [cameraEditando, setCameraEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const acaoEmAndamento = useRef(false);
  const consultasAutomaticas = useRef({ estado: false, sincronizacao: false });
  const pedidoDeVideo = useRef(0);

  useFocusEffect(useCallback(() => {
    let telaAtiva = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      setDetalhesAbertos(false);
      pedidoDeVideo.current += 1;
      try {
        const lista = await obterCameras(usuario.id_usuario);
        if (telaAtiva) {
          setCameras(lista);
          setCameraAtual(anterior => lista.find(camera => camera.id === anterior?.id) || lista[0] || null);
          setUrlVideo(''); setEstadoCamera(null); setEstadoIa(null);
        }
      } catch (falha) {
        if (telaAtiva) setErro(falha.message);
      } finally {
        if (telaAtiva) setCarregando(false);
      }
    }
    if (usuario?.id_usuario) carregar();
    else setCarregando(false);
    return () => { telaAtiva = false; pedidoDeVideo.current += 1; };
  }, [usuario?.id_usuario]));

  // Atualiza os estados sem abrir avisos ou bloquear os botões da câmera.
  useFocusEffect(useCallback(() => {
    if (!cameraAtual?.id) return;
    let telaAtiva = true;
    let proximaConsulta;
    setEstadoCamera(null); setEstadoIa(null); setErroConsulta('');

    async function consultar() {
      if (!telaAtiva) return;
      try {
        if (AppState.currentState !== 'active' || acaoEmAndamento.current || consultasAutomaticas.current.estado) return;
        consultasAutomaticas.current.estado = true;
        try {
          const [camera, deteccao] = await Promise.allSettled([
            obterStatusCamera(cameraAtual.id), obterStatusIaCamera(cameraAtual.id),
          ]);
          if (!telaAtiva || AppState.currentState !== 'active') return;
          setEstadoCamera(camera.status === 'fulfilled' ? camera.value : null);
          setEstadoIa(deteccao.status === 'fulfilled' ? deteccao.value : null);
          const falhas = [camera, deteccao].filter(resposta => resposta.status === 'rejected');
          setErroConsulta(falhas.map(resposta => resposta.reason?.message || 'Não foi possível consultar a câmera.').join(' '));
        } finally {
          consultasAutomaticas.current.estado = false;
        }
      } finally {
        if (telaAtiva) proximaConsulta = setTimeout(consultar, 10000);
      }
    }

    consultar();
    const retornoAoApp = AppState.addEventListener('change', estado => {
      if (estado === 'active' && !consultasAutomaticas.current.estado) { clearTimeout(proximaConsulta); consultar(); }
    });
    return () => { telaAtiva = false; clearTimeout(proximaConsulta); retornoAoApp.remove(); };
  }, [cameraAtual?.id, usuario?.id_usuario]));

  // Mantém as câmeras da conta sincronizadas com a IA a cada minuto.
  useFocusEffect(useCallback(() => {
    if (!usuario?.id_usuario || !cameras.length) return;
    let telaAtiva = true;
    let proximaSincronizacao;

    async function sincronizar() {
      if (!telaAtiva) return;
      try {
        if (AppState.currentState !== 'active' || acaoEmAndamento.current || consultasAutomaticas.current.sincronizacao) return;
        consultasAutomaticas.current.sincronizacao = true;
        try {
          const resultado = await sincronizarCameras(usuario.id_usuario);
          if (telaAtiva && AppState.currentState === 'active') {
            setErroSincronizacao(resultado.erros?.length ? 'Algumas câmeras não puderam ser sincronizadas com a detecção. Uma nova tentativa será feita automaticamente.' : '');
          }
        } catch (falha) {
          if (telaAtiva) setErroSincronizacao(falha.message);
        } finally {
          consultasAutomaticas.current.sincronizacao = false;
        }
      } finally {
        if (telaAtiva) proximaSincronizacao = setTimeout(sincronizar, 60000);
      }
    }

    sincronizar();
    const retornoAoApp = AppState.addEventListener('change', estado => {
      if (estado === 'active' && !consultasAutomaticas.current.sincronizacao) { clearTimeout(proximaSincronizacao); sincronizar(); }
    });
    return () => { telaAtiva = false; clearTimeout(proximaSincronizacao); retornoAoApp.remove(); };
  }, [usuario?.id_usuario, cameras.length]));

  async function atualizarLista() {
    const lista = await obterCameras(usuario.id_usuario);
    setCameras(lista);
    setCameraAtual(anterior => lista.find(camera => camera.id === anterior?.id) || lista[0] || null);
  }

  // Evita comandos duplicados. Cada botão passa uma ação real da API.
  async function executar(acao) {
    if (acaoEmAndamento.current) return;
    acaoEmAndamento.current = true;
    setOcupado(true); setErro('');
    try { await acao(); }
    catch (falha) { setErro(falha.message); Alert.alert('Não foi possível concluir', falha.message); }
    finally { acaoEmAndamento.current = false; setOcupado(false); }
  }

  function escolherCamera(camera) {
    setCameraAtual(camera); setUrlVideo(''); setEstadoCamera(null); setEstadoIa(null); setAvisoVideo('');
    setDetalhesAbertos(true);
    verVideo(camera);
  }

  function fecharDetalhes() {
    pedidoDeVideo.current += 1;
    setDetalhesAbertos(false);
    setUrlVideo('');
    setAvisoVideo('');
  }

  function abrirFormulario(camera = null) {
    fecharDetalhes();
    setCameraEditando(camera);
    setNome(camera?.nomeUsuario || '');
    // A listagem não devolve o RTSP. Em uma edição, vazio mantém o endereço atual.
    setEndereco('');
    setFormularioAberto(true);
  }

  async function salvarCamera() {
    if (!nome.trim()) return Alert.alert('Informe o nome', 'Dê um nome para identificar a câmera.');
    if ((!cameraEditando || endereco.trim()) && !endereco.trim().startsWith('rtsp://')) {
      return Alert.alert('Confira o endereço', 'O endereço da câmera precisa começar com rtsp://.');
    }
    await executar(async () => {
      if (cameraEditando) {
        const dados = { nomeUsuario: nome.trim() };
        if (endereco.trim()) dados.endereco = endereco.trim();
        await atualizarCamera(cameraEditando.id, dados);
      } else {
        await cadastrarCamera({ idUsuario: usuario.id_usuario, nomeUsuario: nome.trim(), endereco: endereco.trim() });
      }
      setFormularioAberto(false);
      setUrlVideo(''); setEstadoCamera(null); setEstadoIa(null);
      await atualizarLista();
    });
  }

  async function verVideo(camera = cameraAtual) {
    const pedido = ++pedidoDeVideo.current;
    setUrlVideo(''); setAvisoVideo('Buscando transmissão…');
    await executar(async () => {
      const url = await obterVideoCamera(camera.id);
      if (pedido !== pedidoDeVideo.current) return;
      if (!/^https?:\/\//i.test(url || '')) throw new Error('O servidor não devolveu uma URL de vídeo válida.');
      setUrlVideo(url);
      setAvisoVideo('Abrindo transmissão…');
    });
  }

  async function abrirNoNavegador() {
    await executar(async () => {
      const url = urlVideo || await obterVideoCamera(cameraAtual.id);
      if (!/^https?:\/\//i.test(url || '')) throw new Error('O servidor não devolveu uma URL de vídeo válida.');
      await Linking.openURL(url);
    });
  }

  const campo = { minHeight: prefs.adapted ? 64 : 54, padding: 14, borderWidth: 1, borderColor: c.line, borderRadius: 14, color: c.text, fontSize: prefs.adapted ? 20 : 16 };
  return <Tela navigation={navigation}>
    <TituloPagina eyebrow="MONITORAMENTO" title="Câmeras" subtitle="Escolha uma câmera para ver a imagem e acompanhar os avisos." />
    <Botao title="Adicionar câmera" disabled={ocupado} onPress={() => abrirFormulario()} />
    <TituloSecao title="Suas câmeras" action="Atualizar" onPress={() => executar(atualizarLista)} />
    {!!erro && <Texto accessibilityRole="alert" style={{ color: c.red, marginBottom: 16 }}>{erro}</Texto>}
    {carregando ? <ActivityIndicator color={c.accent} accessibilityLabel="Carregando câmeras" /> : !cameras.length ? <Cartao><Texto>Nenhuma câmera cadastrada.</Texto></Cartao> :
      cameras.map(camera => <Pressable key={camera.id} accessibilityRole="button" accessibilityState={{ selected: cameraAtual?.id === camera.id, disabled: ocupado }} disabled={ocupado}
        accessibilityLabel={`Abrir detalhes de ${camera.nomeUsuario || 'câmera'}`} accessibilityHint="Mostra o vídeo ao vivo e as informações da câmera" onPress={() => escolherCamera(camera)} style={{ marginBottom: 12 }}>
        <Cartao>
          <Texto weight="600">{camera.nomeUsuario || `Câmera ${camera.id}`}</Texto><Texto muted>Último estado informado: {camera.status || 'não informado'}</Texto>
          <Texto muted>Toque para ver a câmera</Texto>
        </Cartao>
      </Pressable>)}
    {detalhesAbertos && cameraAtual && telaAberta && <Modal visible animationType="slide" onRequestClose={fecharDetalhes}>
      <Tela navigation={{ ...navigation, goBack: fecharDetalhes }} back>
      <TituloPagina title={cameraAtual.nomeUsuario || 'Câmera selecionada'} subtitle="Transmissão ao vivo e informações da câmera." />
      <View style={{ gap: 12 }}>
      {!!erro && <Texto accessibilityRole="alert" style={{ color: c.red }}>{erro}</Texto>}
      {!!urlVideo && telaAberta && <Cartao style={{ height: 252, padding: 0, overflow: 'hidden' }}>
        <TransmissaoCamera key={urlVideo} url={urlVideo}
          aoCarregar={() => setAvisoVideo('')}
          aoFalhar={() => setAvisoVideo('Não foi possível abrir o vídeo no app. Tente abrir no navegador e confira a conexão com o Wi-Fi.')} />
      </Cartao>}
      {!!avisoVideo && <Texto accessibilityLiveRegion="polite">{avisoVideo}</Texto>}
      <Botao title="Reconectar vídeo" secondary busy={ocupado} onPress={() => verVideo()} />
      <Botao title="Abrir vídeo-navegador" secondary disabled={ocupado} onPress={abrirNoNavegador} />
      <Texto muted>O estado é atualizado automaticamente a cada 10 segundos.</Texto>
      {!!erroConsulta && <Texto accessibilityRole="alert" style={{ color: c.red }}>{erroConsulta}</Texto>}
      {!!estadoCamera && <Texto accessibilityLiveRegion="polite">Estado: {estadoCamera.status || 'não informado'}{estadoCamera.fogo_detectado ? ' — Fogo detectado' : ''}</Texto>}
      {!!estadoIa && <Texto accessibilityLiveRegion="polite">Detecção: {estadoIa.estado || 'não informado'}{estadoIa.fogo_detectado ? ' — Fogo detectado' : ''}{estadoIa.ultimo_erro ? ` — ${estadoIa.ultimo_erro}` : ''}</Texto>}
      <Botao title="Editar câmera" secondary disabled={ocupado} onPress={() => abrirFormulario(cameraAtual)} />
      <Botao title="Remover câmera" destructive disabled={ocupado} onPress={() => Alert.alert('Remover câmera?', 'O cadastro será removido e o monitoramento dessa câmera será interrompido.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => executar(async () => {
          await removerCamera(cameraAtual.id); fecharDetalhes(); setEstadoCamera(null); setEstadoIa(null); await atualizarLista();
        }) },
      ])} />
      {!!erroSincronizacao && <Texto accessibilityRole="alert" style={{ color: c.red }}>{erroSincronizacao}</Texto>}
      </View>
      </Tela>
    </Modal>}
    <Modal visible={formularioAberto} transparent animationType="slide" onRequestClose={() => { if (!ocupado) setFormularioAberto(false); }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(11,35,66,0.35)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Cartao style={{ gap: 16 }}>
            <Texto size={24} weight="600">{cameraEditando ? 'Editar câmera' : 'Adicionar câmera'}</Texto>
            <Texto>Nome da câmera</Texto><TextInput accessibilityLabel="Nome da câmera" value={nome} onChangeText={setNome} editable={!ocupado} placeholder="Ex.: Entrada" placeholderTextColor={c.muted} style={campo} />
            <Texto>{cameraEditando ? 'Novo endereço RTSP (opcional)' : 'Endereço RTSP'}</Texto>
            <TextInput accessibilityLabel="Endereço RTSP da câmera" value={endereco} onChangeText={setEndereco} editable={!ocupado} autoCapitalize="none" autoCorrect={false} secureTextEntry placeholder="rtsp://…" placeholderTextColor={c.muted} style={campo} />
            {cameraEditando && <Texto muted>Deixe o endereço vazio para manter o atual.</Texto>}
            <Botao title="Salvar câmera" busy={ocupado} onPress={salvarCamera} />
            <Botao title="Cancelar" secondary disabled={ocupado} onPress={() => setFormularioAberto(false)} />
          </Cartao>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  </Tela>;
}
