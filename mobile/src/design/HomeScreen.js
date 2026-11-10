import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { obterHistorico } from '../services/api';
import ActivityCard from '../components/ActivitysCard';
import HistoricoModal from '../components/HistoricoModal';
import { LockCard } from './LockCard';
import { Card, Heading, Icon, PageTitle, Row, Screen, Txt, Button } from './UI';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Busca as atividades toda vez que a pessoa volta para esta tela.
  useFocusEffect(useCallback(() => {
    let telaAtiva = true;

    async function carregarAtividades() {
      setLoading(true);
      setError('');

      try {
        const historico = await obterHistorico(usuario.id_usuario);
        const atividadesRecentes = historico.slice(0, 3);

        if (telaAtiva) {
          setEvents(atividadesRecentes);
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

    carregarAtividades();

    // Ignora a resposta se a pessoa sair da tela antes de a consulta terminar.
    return () => {
      telaAtiva = false;
    };
  }, [usuario.id_usuario]));
  return <Screen navigation={navigation}>
    <PageTitle eyebrow={`BEM-VINDO(A), ${usuario.nome_usuario?.split(' ')[0]?.toUpperCase() || ''}`} title="Seu lar, bem cuidado." subtitle="Mais tranquilidade para você e sua família." />
    <LockCard navigation={navigation} />
    <Heading title="Acesso rápido" />
    <Row style={{ alignItems: 'stretch' }}>
      {[['Tags de acesso', 'Gerenciar credenciais', 'credit-card', 'Tags'], ['Emergência', 'Contatos e chamadas', 'phone', 'Emergência']].map(([title, subtitle, icon, route]) =>
        <Pressable key={route} accessibilityRole="button" accessibilityLabel={title} onPress={() => navigation.navigate(route)} style={{ flex: 1 }}>
          <Card style={{ flex: 1, minHeight: 132, gap: 10 }}><Icon name={icon} /><Txt weight="600">{title}</Txt><Txt muted size={12}>{subtitle}</Txt></Card>
        </Pressable>)}
    </Row>
    <Heading title="Monitoramento" />
    <Card><Row><Icon name="video" /><View style={{ flex: 1 }}><Txt weight="600">Câmera da residência</Txt><Txt muted size={12}>Acompanhe a transmissão da sua câmera.</Txt></View></Row>
      <View style={{ height: 16 }} /><Button title="Ver câmera" secondary onPress={() => navigation.navigate('Câmera')} />
    </Card>
    <Heading title="Atividades recentes" action="Ver todas" onPress={() => navigation.navigate('Histórico')} />
    {loading ? <ActivityIndicator accessibilityLabel="Carregando atividades" /> : error ? <Txt accessibilityRole="alert">Não foi possível carregar: {error}</Txt> : !events.length ? <Card><Txt muted>Nenhuma atividade registrada.</Txt></Card> :
      <View style={{ gap: 12 }}>{events.map(event => <ActivityCard key={`${event.tipo}-${event.id_acesso ?? event.id_alerta}`} historico={event} onPress={setSelected} />)}</View>}
    <HistoricoModal visible={!!selected} evento={selected} onClose={() => setSelected(null)} />
  </Screen>;
}

export function DevicesScreen({ navigation }) {
  return <Screen navigation={navigation}><PageTitle eyebrow="SUA UNIDADE" title="Dispositivos" subtitle="Acesso e monitoramento em um só lugar." />
    <LockCard navigation={navigation} />
    <Heading title="Câmera" /><Card><Txt muted>Abra a transmissão da câmera configurada no aplicativo.</Txt><View style={{ height: 16 }} /><Button title="Abrir câmera" onPress={() => navigation.navigate('Câmera')} /></Card>
    <Heading title="Credenciais" /><Button title="Gerenciar tags RFID" secondary onPress={() => navigation.navigate('Tags')} />
  </Screen>;
}
