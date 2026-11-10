import React, { useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { useDesign } from './DesignProvider';
import { Brand, Button, Card, Heading, Icon, PageTitle, Row, Screen, Txt } from './UI';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export function PreferenceOptions({ adapted, colorVision, onAdapted, onColorVision, disabled }) {
  return <Card>
    <Row style={{ paddingVertical: 12 }}>
      <View style={{ flex: 1 }}><Txt weight="600">Usar design acessível</Txt><Txt muted size={12}>Mantém o visual original do SafeNest. Você pode mudar quando quiser.</Txt></View>
      <Switch accessibilityLabel="Usar design acessível original" value={adapted} onValueChange={onAdapted} disabled={disabled} />
    </Row>
    <Row style={{ paddingVertical: 12 }}>
      <View style={{ flex: 1 }}><Txt weight="600">Adaptar cores e contraste</Txt><Txt muted size={12}>Cores alternativas, com textos e ícones para identificar os estados.</Txt></View>
      <Switch accessibilityLabel="Adaptar cores e contraste" value={colorVision} onValueChange={onColorVision} disabled={disabled} />
    </Row>
  </Card>;
}

export default function AppearanceScreen() {
  const { c, prefs, saving, savePreferences } = useDesign();
  const [adapted, setAdapted] = useState(prefs.adapted);
  const [colorVision, setColorVision] = useState(prefs.colorVision);

  async function finish(manterEscolhaAtual = false) {
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
      <Brand />
      <PageTitle eyebrow="DO SEU JEITO" title="Como prefere usar?" subtitle="Escolha o visual que deixa você mais confortável. Sua segurança continua a mesma." />
      <PreferenceOptions adapted={adapted} colorVision={colorVision} onAdapted={setAdapted} onColorVision={setColorVision} disabled={saving} />
      <Button title="Salvar e continuar" busy={saving} onPress={() => finish()} />
      <Button title="Manter preferências atuais" secondary disabled={saving} onPress={() => finish(true)} />
    </ScrollView>
  </SafeAreaView>;
}

export function SettingsScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { c, prefs, saving, savePreferences } = useDesign();
  async function change(alteracoes) {
    try {
      await savePreferences(alteracoes);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    }
  }
  return <Screen navigation={navigation} back>
    <PageTitle eyebrow="SUA CONTA" title="Configurações" subtitle="Preferências e controle da sua unidade." />
    <Card>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.raised, justifyContent: 'center', alignItems: 'center' }}><Icon name="user" size={24} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt muted size={12}>Informações pessoais</Txt>
          <Txt weight="600">{usuario?.nome_usuario}</Txt>
          <Txt muted style={{ flexShrink: 1 }}>{usuario?.email_usuario}</Txt>
        </View>
      </Row>
    </Card>
    <Heading title="Acessibilidade" />
    <PreferenceOptions adapted={prefs.adapted} colorVision={prefs.colorVision} disabled={saving}
      onAdapted={adapted => change({ adapted })} onColorVision={colorVision => change({ colorVision })} />
    <Heading title="Acesso e segurança" />
    <View style={{ gap: 12 }}>
      <Button title="Tags de acesso" secondary onPress={() => navigation.navigate('Tags')} />
      <Button title="Histórico de acessos" secondary onPress={() => navigation.navigate('Main', { screen: 'Histórico' })} />
      <Button title="Contatos de emergência" secondary onPress={() => navigation.navigate('Main', { screen: 'Emergência' })} />
      <Button title="Sair da conta" destructive disabled={saving} onPress={() => Alert.alert('Sair da conta?', 'Sua sessão será encerrada neste aparelho.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: async () => { try { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } catch (e) { Alert.alert('Erro ao sair', e.message); } } },
      ])} />
    </View>
  </Screen>;
}
