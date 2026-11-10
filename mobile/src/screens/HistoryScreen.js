import { useEstilos } from '../design/useScreenStyles';
// import { StyleSheet, Text, View, Alert, ActivityIndicator, FlatList } from 'react-native';
import { StyleSheet, Text, View, Alert, ActivityIndicator, SectionList, Pressable } from 'react-native';
import { useVisual } from '../design/DesignProvider';
import { TituloPagina, Tela } from '../design/UI';
import { colorsLightMode, typography } from '../theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ActivitysCard from '../components/ActivitysCard';
import HistoricoModal from '../components/HistoricoModal';

import { obterHistorico } from '../services/api';

export default function HistoryScreen({ navigation }) {
    const estilos = useEstilos(estilosAntigos, 'HistoryScreen');
    const { prefs, c } = useVisual();
    const [filter, setFilter] = useState('Todos');
    const { usuario } = useAuth();
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const visible = filter === 'Todos' ? dados : dados.filter(event => event.tipo === (filter === 'Alertas' ? 'alerta' : 'acesso'));
    const secoes = agruparPorData(visible);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);

    // carregando o historico
    useFocusEffect(
        useCallback(() => {
            async function carregarHistorico() {
                try {
                    setCarregando(true);
                    setDados(await obterHistorico(usuario.id_usuario));
                } catch (error) {
                    Alert.alert('Erro', 'Não foi possível carregar o histórico.');
                } finally {
                    setCarregando(false);
                }
            }

            if (usuario?.id_usuario) {
                carregarHistorico();
            } else {
                setCarregando(false);
            }
        }, [usuario]
        ));

    const ItemSeparator = () => (
        <View style={estilos.separator} />
    );

    function agruparPorData(lista) {
        const grupos = [];
        lista.forEach((historico) => {
            const dia = new Date(historico.data_hora).toLocaleDateString('pt-BR');
            const ultimo = grupos[grupos.length - 1];
            if (ultimo && ultimo.title === dia) {
                ultimo.data.push(historico);
            } else {
                grupos.push({ title: dia, data: [historico] });
            }
        });
        return grupos;
    }



    const content = (
        <View style={[estilos.container, prefs.adapted && { paddingTop: 12 }]}>
            {prefs.adapted ? <View style={{ paddingHorizontal: 22, paddingTop: 6 }}>
                <TituloPagina title="Histórico" subtitle="Veja quem entrou e os avisos da sua casa." />
            </View> : <View style={{ width: '100%', paddingHorizontal: 22, paddingTop: 18 }}>
                <TituloPagina eyebrow="REGISTROS DA UNIDADE" title="Histórico" subtitle="Acompanhe os acessos e alertas da sua casa." />
            </View>}

            <View style={{ flexDirection: 'row', flexWrap: prefs.adapted ? 'wrap' : 'nowrap', marginTop: prefs.adapted ? 4 : 0, marginHorizontal: prefs.adapted ? 12 : 22, marginBottom: 16, padding: 4, borderRadius: 26, backgroundColor: c.raised }}>
                {['Todos', 'Acessos', 'Alertas'].map(label => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: filter === label }}
                    onPress={() => setFilter(label)} style={{ flex: 1, minWidth: prefs.adapted ? 80 : undefined, minHeight: prefs.adapted ? 48 : 44, paddingVertical: prefs.adapted ? 8 : 0, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: filter === label ? c.accent : 'transparent' }}>
                    <Text style={{ color: filter === label ? '#FFFFFF' : prefs.adapted ? c.accent : c.muted, fontSize: prefs.adapted ? 16 : undefined }}>{label}</Text>
                </Pressable>)}
            </View>

            {carregando ? (
                <View style={estilos.centeredMessage}>
                    <ActivityIndicator size="large" color={colorsLightMode.primary} />
                </View>
            ) : visible.length === 0 ? (
                <View style={estilos.centeredMessage}>
                    <Text style={estilos.emptyText}>Nenhum evento encontrado.</Text>
                </View>
            ) : (
                <View style={estilos.scrollArea}>
                    <SectionList
                        sections={secoes}
                        keyExtractor={(d) => d.tipo === 'acesso' ? 'acesso-' + d.id_acesso : 'alerta-' + d.id_alerta}
                        renderSectionHeader={({ section }) => (
                            <Text style={estilos.dateHeader}>{section.title}</Text>
                        )}
                        renderItem={({ item }) => <ActivitysCard historico={item} onPress={setEventoSelecionado} />}
                        ItemSeparatorComponent={ItemSeparator}
                        stickySectionHeadersEnabled={false}
                        contentContainerStyle={{ paddingHorizontal: 23, paddingBottom: 100 }}
                    />
                </View>
            )}

            <HistoricoModal
                visible={eventoSelecionado !== null}
                evento={eventoSelecionado}
                onClose={() => setEventoSelecionado(null)}
            />
        </View >
    );
    return <Tela navigation={navigation} scroll={false}>{content}</Tela>;
}

const estilosAntigos = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    titlePage: {
        ...typography.title,
        color: colorsLightMode.black,
    },
    subtitlePage: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        paddingLeft: 10,
    },
    containerTitlesPage: {
        justifyContent: 'flex-start',
        width: '100%',
        paddingLeft: 10,
    },
    scrollArea: {
        flex: 1,
    },
    dateHeader: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        marginTop: 20,
        marginBottom: 12,
    },
    separator: {
        height: 12,
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    emptyText: {
        ...typography.body,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
    },
});
