import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVisual } from './DesignProvider';
import { Logo, Botao, Cartao, TituloSecao, Icone, TituloPagina, Linha, Tela, Texto } from './UI';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFotoPerfil } from '../context/FotoPerfilContext';
import FotoDoPerfil from '../components/FotoDoPerfil';

export function OpcoesVisuais({ adapted, colorVision, onAdapted, onColorVision, disabled }) {
  const { c, prefs } = useVisual();
  if (prefs.adapted) return <Cartao style={{ gap: 24 }}>
    <View style={{ gap: 10 }}>
      <Linha style={{ justifyContent: 'space-between' }}><Texto weight="600" style={{ flex: 1 }}>Visual com letras maiores</Texto><Switch accessibilityLabel="Usar design acessível original" value={adapted} onValueChange={onAdapted} disabled={disabled} trackColor={{ false: c.line, true: c.accent }} /></Linha>
      <Texto muted>Facilita a leitura e o uso dos botões.</Texto>
    </View>
    <View style={{ gap: 10 }}>
      <Linha style={{ justifyContent: 'space-between' }}><Texto weight="600" style={{ flex: 1 }}>Adaptar as cores</Texto><Switch accessibilityLabel="Adaptar cores e contraste" value={colorVision} onValueChange={onColorVision} disabled={disabled} trackColor={{ false: c.line, true: c.accent }} /></Linha>
      <Texto muted>Destaca textos, botões e bordas.</Texto>
    </View>
  </Cartao>;
  return <Cartao>
    <Linha style={{ paddingVertical: 12 }}>
      <View style={{ flex: 1 }}><Texto weight="600">Usar design acessível</Texto><Texto muted size={12}>Mantém o visual original do SafeNest. Você pode mudar quando quiser.</Texto></View>
      <Switch accessibilityLabel="Usar design acessível original" value={adapted} onValueChange={onAdapted} disabled={disabled} trackColor={{ false: c.line, true: c.accent }} />
    </Linha>
    <Linha style={{ paddingVertical: 12 }}>
      <View style={{ flex: 1 }}><Texto weight="600">Adaptar cores e contraste</Texto><Texto muted size={12}>Cores alternativas, com textos e ícones para identificar os estados.</Texto></View>
      <Switch accessibilityLabel="Adaptar cores e contraste" value={colorVision} onValueChange={onColorVision} disabled={disabled} trackColor={{ false: c.line, true: c.accent }} />
    </Linha>
  </Cartao>;
}

export default function EscolhaVisual() {
  const { c, prefs, saving, savePreferences } = useVisual();
  const [adapted, setAdapted] = useState(prefs.adapted);
  const [colorVision, setColorVision] = useState(prefs.colorVision);

  async function salvarEscolha(manterEscolhaAtual = false) {
    const alteracoes = { configured: true };

    // Ao manter a escolha atual, só marcamos que a apresentação terminou.
    if (!manterEscolhaAtual) {
      alteracoes.adapted = adapted;
      alteracoes.colorVision = colorVision;
    }

    try {
      await savePreferences(alteracoes);
    } catch (erro) {
      Alert.alert('Não foi possível salvar as preferências', erro.message);
    }
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ padding: 24, gap: 22 }}>
      <Logo />
      <TituloPagina eyebrow="DO SEU JEITO" title="Como prefere usar?" subtitle="Escolha o visual que deixa você mais confortável. Sua segurança continua a mesma." />
      <OpcoesVisuais adapted={adapted} colorVision={colorVision} onAdapted={setAdapted} onColorVision={setColorVision} disabled={saving} />
      <Botao title="Salvar e continuar" busy={saving} onPress={() => salvarEscolha()} />
      <Botao title="Manter preferências atuais" secondary disabled={saving} onPress={() => salvarEscolha(true)} />
    </ScrollView>
  </SafeAreaView>;
}

export function Configuracoes({ navigation }) {
  const { usuario, logout } = useAuth();
  const { c, prefs, saving, savePreferences } = useVisual();
  const { foto, salvarFoto } = useFotoPerfil();
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  async function escolherFotoPerfil() {
    if (salvandoFoto) return;
    setSalvandoFoto(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para adicionar sua imagem de perfil.');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
      });
      if (!resultado.canceled && resultado.assets?.[0]?.uri) await salvarFoto(resultado.assets[0].uri);
    } catch (erro) {
      Alert.alert('Não foi possível salvar a foto', erro.message);
    } finally {
      setSalvandoFoto(false);
    }
  }

  async function removerFotoPerfil() {
    if (salvandoFoto) return;
    setSalvandoFoto(true);
    try { await salvarFoto(null); }
    catch (erro) { Alert.alert('Não foi possível remover a foto', erro.message); }
    finally { setSalvandoFoto(false); }
  }
  async function alterarEscolha(alteracoes) {
    try {
      await savePreferences(alteracoes);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    }
  }
  return <Tela navigation={navigation} back>
    <TituloPagina eyebrow="SUA CONTA" title="Configurações" subtitle={prefs.adapted ? 'Escolha como prefere usar o aplicativo.' : 'Preferências e controle da sua unidade.'} />
    <Cartao>
      <Linha style={{ alignItems: 'flex-start', flexDirection: prefs.adapted ? 'column' : 'row' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={foto ? 'Alterar sua foto de perfil' : 'Adicionar sua foto de perfil'}
          accessibilityHint="Abre a galeria de imagens" disabled={salvandoFoto || saving} onPress={escolherFotoPerfil}>
          <FotoDoPerfil tamanho={prefs.adapted ? 96 : 80} />
          <View style={{ position: 'absolute', bottom: 0, right: -4, width: 30, height: 30, borderRadius: 15,
            backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface }}>
            <Icone name="camera" size={15} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <Texto muted size={12}>Informações pessoais</Texto>
          <Texto weight="600">{usuario?.nome_usuario}</Texto>
          <Texto muted style={{ flexShrink: 1 }}>{usuario?.email_usuario}</Texto>
        </View>
      </Linha>
      <View style={{ gap: 10, marginTop: 18 }}>
        <Botao title={foto ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'} secondary busy={salvandoFoto} disabled={saving} onPress={escolherFotoPerfil} />
        {!!foto && <Botao title="Remover foto de perfil" secondary disabled={salvandoFoto || saving} onPress={removerFotoPerfil} />}
        <Texto muted size={12}>A foto fica salva somente neste aparelho.</Texto>
      </View>
    </Cartao>
    <TituloSecao title="Acessibilidade" />
    <OpcoesVisuais adapted={prefs.adapted} colorVision={prefs.colorVision} disabled={saving}
      onAdapted={adapted => alterarEscolha({ adapted })} onColorVision={colorVision => alterarEscolha({ colorVision })} />
    <TituloSecao title="Acesso e segurança" />
    <View style={{ gap: 12 }}>
      <Botao title="Tags de acesso" secondary onPress={() => navigation.navigate('Tags')} />
      <Botao title="Histórico de acessos" secondary onPress={() => navigation.navigate('Main', { screen: 'Histórico' })} />
      <Botao title="Contatos de emergência" secondary onPress={() => navigation.navigate('Main', { screen: 'Emergência' })} />
      <Botao title="Sair da conta" destructive disabled={saving} onPress={() => Alert.alert('Sair da conta?', 'Sua sessão será encerrada neste aparelho.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: async () => { try { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } catch (e) { Alert.alert('Erro ao sair', e.message); } } },
      ])} />
    </View>
  </Tela>;
}
