import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { atualizarTag, cadastrarTag, deletarTag, obterTags } from '../services/api';
import { Button, Card, Heading, Icon, PageTitle, Row, Screen, Txt } from './UI';
import { useDesign } from './DesignProvider';

export default function TagsScreen({ navigation }) {
  const { c } = useDesign();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  // evita clique duplo
  const running = useRef(false);

  useFocusEffect(useCallback(() => {
    let telaAtiva = true;

    async function carregarTags() {
      try {
        const tagsDaConta = await obterTags();

        if (telaAtiva) {
          setTags(tagsDaConta);
        }
      } catch (erro) {
        if (telaAtiva) {
          setError(erro.message);
        }
      } finally {
        if (telaAtiva) {
          setLoading(false);
        }
      }
    }

    carregarTags();

    return () => {
      telaAtiva = false;
    };
  }, []));

  async function perform(acao, limparFormulario = false) {
    if (running.current) {
      return;
    }

    running.current = true;
    setBusy(true);
    setError('');

    try {
      await acao();

      if (limparFormulario) {
        setEditing(null);
        setName('');
      }

      const tagsAtualizadas = await obterTags();
      setTags(tagsAtualizadas);
    } catch (erro) {
      setError(erro.message);
      Alert.alert('Não foi possível concluir', erro.message);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return <Screen navigation={navigation} back>
    <PageTitle eyebrow="CONTROLE DE ACESSO" title="Tags de acesso" subtitle="Gerencie quem pode entrar na sua casa." />
    <Card style={{ gap: 16 }}>
      <Txt weight="600">{editing ? 'Editar nome da tag' : 'Cadastrar uma tag'}</Txt>
      <Txt muted size={13}>{editing ? 'O nome será atualizado na sua conta.' : 'Informe o nome e toque em cadastrar. Em seguida, aproxime a tag do leitor da fechadura.'}</Txt>
      <TextInput accessibilityLabel="Nome do dono da tag" placeholder="Nome do dono da tag" placeholderTextColor={c.muted} value={name} onChangeText={setName} editable={!busy}
        style={{ minHeight: 54, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, fontSize: 16, color: c.text }} />
      <Button title={editing ? 'Salvar nome' : 'Cadastrar tag no leitor'} disabled={!name.trim()} busy={busy}
        onPress={() => perform(() => editing ? atualizarTag(editing, name.trim()) : cadastrarTag(name.trim()), true)} />
      {!!editing && <Button title="Cancelar edição" secondary disabled={busy} onPress={() => { setEditing(null); setName(''); }} />}
      {busy && <Txt accessibilityLiveRegion="polite">Aguardando resposta… Para cadastrar, mantenha a tag próxima ao leitor.</Txt>}
    </Card>
    <Heading title="Tags cadastradas" action="Atualizar" onPress={() => perform(async () => {})} />
    {!!error && <Txt accessibilityRole="alert" style={{ color: c.red }}>{error}</Txt>}
    {loading ? <ActivityIndicator /> : !tags.length ? <Card><Txt muted>Nenhuma tag cadastrada.</Txt></Card> : tags.map(tag => <Card key={tag.idTag} style={{ marginBottom: 12, gap: 12 }}>
      <Row><Icon name="credit-card" /><Txt weight="600" style={{ flex: 1 }}>{tag.nomeTag || 'Tag sem nome'}</Txt></Row>
      <Button title={`Editar ${tag.nomeTag || 'tag'}`} secondary disabled={busy} onPress={() => { setEditing(tag.idTag); setName(tag.nomeTag || ''); }} />
      <Button title={`Remover ${tag.nomeTag || 'tag'}`} destructive disabled={busy} onPress={() => Alert.alert('Remover tag?', 'Esta credencial será removida da conta.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => perform(() => deletarTag(tag.idTag)) },
      ])} />
    </Card>)}
  </Screen>;
}
