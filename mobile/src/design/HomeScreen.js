import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { obterHistorico } from '../services/api';
import ActivityCard from '../components/ActivitysCard';
import HistoricoModal from '../components/HistoricoModal';
import { CartaoFechadura } from './LockCard';
import { useVisual } from './DesignProvider';
import { FechaduraSection } from '../components/FechaduraSection';
import { Cartao, TituloSecao, Icone, TituloPagina, Linha, Tela, Texto, Botao } from './UI';

export default function Inicio({ navigation }) {
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
  return <Tela navigation={navigation}>
    <TituloPagina eyebrow={`BEM-VINDO(A), ${usuario.nome_usuario?.split(' ')[0]?.toUpperCase() || ''}`} title="Seu lar, bem cuidado." subtitle="Mais tranquilidade para você e sua família." />
    <CartaoFechadura navigation={navigation} />
    <TituloSecao title="Acesso rápido" />
    <Linha style={{ alignItems: 'stretch' }}>
      {[['Tags de acesso', 'Gerenciar credenciais', 'credit-card', 'Tags'], ['Emergência', 'Contatos e chamadas', 'phone', 'Emergência']].map(([title, subtitle, icon, route]) =>
        <Pressable key={route} accessibilityRole="button" accessibilityLabel={title} onPress={() => navigation.navigate(route)} style={{ flex: 1 }}>
          <Cartao style={{ flex: 1, minHeight: 132, gap: 10 }}><Icone name={icon} /><Texto weight="600">{title}</Texto><Texto muted size={12}>{subtitle}</Texto></Cartao>
        </Pressable>)}
    </Linha>
    <TituloSecao title="Monitoramento" />
    <Cartao><Linha><Icone name="video" /><View style={{ flex: 1 }}><Texto weight="600">Câmera da residência</Texto><Texto muted size={12}>Acompanhe a transmissão da sua câmera.</Texto></View></Linha>
      <View style={{ height: 16 }} /><Botao title="Ver câmera" secondary onPress={() => navigation.navigate('Câmera')} />
    </Cartao>
    <TituloSecao title="Atividades recentes" action="Ver todas" onPress={() => navigation.navigate('Histórico')} />
    {loading ? <ActivityIndicator accessibilityLabel="Carregando atividades" /> : error ? <Texto accessibilityRole="alert">Não foi possível carregar: {error}</Texto> : !events.length ? <Cartao><Texto muted>Nenhuma atividade registrada.</Texto></Cartao> :
      <View style={{ gap: 12 }}>{events.map(event => <ActivityCard key={`${event.tipo}-${event.id_acesso ?? event.id_alerta}`} historico={event} onPress={setSelected} />)}</View>}
    <HistoricoModal visible={!!selected} evento={selected} onClose={() => setSelected(null)} />
  </Tela>;
}

export function Dispositivos({ navigation }) {
  const { prefs } = useVisual();
  return <Tela navigation={navigation}><TituloPagina eyebrow="SUA UNIDADE" title="Dispositivos" subtitle={prefs.adapted ? 'Abra a porta, veja a câmera e cuide das tags.' : 'Acesso e monitoramento em um só lugar.'} />
    {prefs.adapted ? <FechaduraSection /> : <CartaoFechadura navigation={navigation} />}
    <TituloSecao title="Câmera" /><Cartao><Texto muted>Abra a transmissão da câmera configurada no aplicativo.</Texto><View style={{ height: 16 }} /><Botao title="Abrir câmera" onPress={() => navigation.navigate('Câmera')} /></Cartao>
    <TituloSecao title={prefs.adapted ? 'Tags de entrada' : 'Credenciais'} /><Botao title={prefs.adapted ? 'Cadastrar ou editar tags' : 'Gerenciar tags RFID'} secondary onPress={() => navigation.navigate('Tags')} />
  </Tela>;
}
