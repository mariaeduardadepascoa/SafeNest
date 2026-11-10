import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useVisual } from '../design/DesignProvider';
import { Botao, Cartao, TituloPagina, TituloSecao, Tela, Texto } from '../design/UI';
import TransmissaoCamera from '../design/CameraStream';
import { obterCameras, cadastrarCamera, atualizarCamera, removerCamera, obterStatusCamera,
  sincronizarCameras, sincronizarCamera, obterStatusIaCamera, obterVideoCamera, obterFotoCamera, obterAlertasCameras } from '../services/api';

export default function CameraScreen({ navigation }) {
  const { usuario } = useAuth();
  const { c, prefs } = useVisual();
  const telaAberta = useIsFocused();
  const [cameras, setCameras] = useState([]);
  const [cameraAtual, setCameraAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [avisoVideo, setAvisoVideo] = useState('');
  const [estadoCamera, setEstadoCamera] = useState(null);
  const [estadoIa, setEstadoIa] = useState(null);
  const [foto, setFoto] = useState('');
  const [alertas, setAlertas] = useState(null);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [cameraEditando, setCameraEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const acaoEmAndamento = useRef(false);

  useFocusEffect(useCallback(() => {
    let telaAtiva = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const lista = await obterCameras(usuario.id_usuario);
        if (telaAtiva) {
          setCameras(lista);
          setCameraAtual(anterior => lista.find(camera => camera.id === anterior?.id) || lista[0] || null);
          setUrlVideo(''); setEstadoCamera(null); setEstadoIa(null); setFoto(''); setAlertas(null);
        }
      } catch (falha) {
        if (telaAtiva) setErro(falha.message);
      } finally {
        if (telaAtiva) setCarregando(false);
      }
    }
    if (usuario?.id_usuario) carregar();
    else setCarregando(false);
    return () => { telaAtiva = false; };
  }, [usuario?.id_usuario]));

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
    setCameraAtual(camera); setUrlVideo(''); setFoto(''); setEstadoCamera(null); setEstadoIa(null); setAvisoVideo('');
  }

  function abrirFormulario(camera = null) {
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
      setUrlVideo(''); setEstadoCamera(null); setEstadoIa(null); setFoto('');
      await atualizarLista();
    });
  }

  async function verVideo() {
    setUrlVideo(''); setAvisoVideo('Buscando transmissão…');
    await executar(async () => {
      const url = await obterVideoCamera(cameraAtual.id);
      if (!/^https?:\/\//i.test(url || '')) throw new Error('O servidor não devolveu uma URL de vídeo válida.');
      setUrlVideo(url);
      setAvisoVideo('Abrindo transmissão…');
    });
  }

  async function verFoto() {
    await executar(async () => {
      const arquivo = await obterFotoCamera(cameraAtual.id);
      const imagem = await new Promise((concluir, falhar) => {
        const leitor = new FileReader();
        leitor.onload = () => concluir(leitor.result);
        leitor.onerror = () => falhar(new Error('Não foi possível abrir a foto.'));
        leitor.readAsDataURL(arquivo);
      });
      setFoto(imagem);
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
        accessibilityLabel={`Selecionar ${camera.nomeUsuario || 'câmera'}`} onPress={() => escolherCamera(camera)} style={{ marginBottom: 12 }}>
        <Cartao style={{ borderColor: cameraAtual?.id === camera.id ? c.accent : c.line, borderWidth: cameraAtual?.id === camera.id ? 2 : 1 }}>
          <Texto weight="600">{camera.nomeUsuario || `Câmera ${camera.id}`}</Texto><Texto muted>Último estado informado: {camera.status || 'não informado'}</Texto>
          {cameraAtual?.id === camera.id && <Texto>Selecionada</Texto>}
        </Cartao>
      </Pressable>)}
    {!!cameraAtual && <View style={{ gap: 12, marginTop: 16 }}>
      <TituloSecao title={cameraAtual.nomeUsuario || 'Câmera selecionada'} />
      <Botao title="Ver ao vivo / Reconectar" busy={ocupado} onPress={verVideo} />
      {!!urlVideo && telaAberta && <Cartao style={{ height: 252, padding: 0, overflow: 'hidden' }}>
        <TransmissaoCamera key={urlVideo} url={urlVideo}
          aoCarregar={() => setAvisoVideo('Página da transmissão carregada. A imagem depende da conexão com o servidor de vídeo.')}
          aoFalhar={() => setAvisoVideo('Não foi possível abrir o vídeo. Verifique a rede e o servidor de transmissão.')} />
      </Cartao>}
      {!!avisoVideo && <Texto accessibilityLiveRegion="polite">{avisoVideo}</Texto>}
      <Botao title="Consultar estado da câmera" secondary disabled={ocupado} onPress={() => executar(async () => setEstadoCamera(await obterStatusCamera(cameraAtual.id)))} />
      {!!estadoCamera && <Texto accessibilityLiveRegion="polite">Estado: {estadoCamera.status || 'não informado'}{estadoCamera.fogo_detectado ? ' — Fogo detectado' : ''}</Texto>}
      <Botao title="Sincronizar com a detecção de incêndio" secondary disabled={ocupado} onPress={() => executar(async () => {
        await sincronizarCamera(cameraAtual.id); setEstadoIa(await obterStatusIaCamera(cameraAtual.id));
      })} />
      <Botao title="Consultar detecção de incêndio" secondary disabled={ocupado} onPress={() => executar(async () => setEstadoIa(await obterStatusIaCamera(cameraAtual.id)))} />
      {!!estadoIa && <Texto accessibilityLiveRegion="polite">Detecção: {estadoIa.estado || 'não informado'}{estadoIa.fogo_detectado ? ' — Fogo detectado' : ''}{estadoIa.ultimo_erro ? ` — ${estadoIa.ultimo_erro}` : ''}</Texto>}
      <Botao title="Ver foto do último alerta" secondary disabled={ocupado} onPress={verFoto} />
      {!!foto && <Image source={{ uri: foto }} accessibilityLabel="Foto do último alerta da câmera selecionada" resizeMode="contain" style={{ width: '100%', height: 240 }} />}
      <Botao title="Editar câmera" secondary disabled={ocupado} onPress={() => abrirFormulario(cameraAtual)} />
      <Botao title="Remover câmera" destructive disabled={ocupado} onPress={() => Alert.alert('Remover câmera?', 'O cadastro será removido e o monitoramento dessa câmera será interrompido.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => executar(async () => {
          await removerCamera(cameraAtual.id); setUrlVideo(''); setFoto(''); setEstadoCamera(null); setEstadoIa(null); setAlertas(null); await atualizarLista();
        }) },
      ])} />
    </View>}
    {!!cameras.length && <View style={{ gap: 12, marginTop: 24 }}>
      <Botao title="Sincronizar todas as câmeras" secondary disabled={ocupado} onPress={() => executar(async () => {
        await sincronizarCameras(usuario.id_usuario); await atualizarLista(); Alert.alert('Sincronização enviada', 'Consulte o estado de cada câmera para verificar o monitoramento.');
      })} />
      <Botao title="Ver alertas das câmeras" secondary disabled={ocupado} onPress={() => executar(async () => setAlertas(await obterAlertasCameras(usuario.id_usuario)))} />
      {alertas !== null && (!alertas.length ? <Texto>Nenhum alerta registrado.</Texto> : alertas.map(alerta => <Cartao key={alerta.id}>
        <Texto weight="600">{alerta.tipoAlerta || 'Alerta da câmera'}</Texto><Texto muted>{alerta.dataHora ? new Date(alerta.dataHora).toLocaleString('pt-BR') : 'Data não informada'}</Texto>
        {!!alerta.imagemUrl && <Image source={{ uri: alerta.imagemUrl }} accessibilityLabel="Imagem do alerta" resizeMode="contain" style={{ width: '100%', height: 180 }} />}
      </Cartao>))}
    </View>}
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
