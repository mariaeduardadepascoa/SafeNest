import { useScreenStyles } from '../design/useScreenStyles';
// import { StyleSheet, Text, View, Alert, ActivityIndicator, FlatList } from 'react-native';
import { StyleSheet, Text, View, Alert, ActivityIndicator, SectionList, Pressable } from 'react-native';
import { useDesign } from '../design/DesignProvider';
import { Screen } from '../design/UI';
import { colorsLightMode, typography } from '../theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ActivitysCard from '../components/ActivitysCard';
import HistoricoModal from '../components/HistoricoModal';

import { obterHistorico } from '../services/api';

export default function HistoryScreen({ navigation }) {
    const styles = useScreenStyles(legacyStyles, 'HistoryScreen');
    const { prefs, c } = useDesign();
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
        <View style={styles.separator} />
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
        <View style={styles.container}>
            <View style={styles.containerTitlesPage}>
                <Text style={styles.titlePage}>Histórico</Text>
                <Text style={styles.subtitlePage}>Visualize todos os eventos aqui.</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: prefs.adapted ? 'wrap' : 'nowrap', marginHorizontal: prefs.adapted ? 12 : 22, marginBottom: 16, padding: 4, borderRadius: 26, backgroundColor: c.raised }}>
                {['Todos', 'Acessos', 'Alertas'].map(label => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: filter === label }}
                    onPress={() => setFilter(label)} style={{ flex: 1, minWidth: prefs.adapted ? 88 : undefined, minHeight: prefs.adapted ? 56 : 44, paddingVertical: prefs.adapted ? 12 : 0, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: filter === label ? c.accent : 'transparent' }}>
                    <Text style={{ color: filter === label ? '#FFFFFF' : prefs.adapted ? '#2B5081' : c.muted, fontSize: prefs.adapted ? 18 : undefined }}>{label}</Text>
                </Pressable>)}
            </View>

            {carregando ? (
                <View style={styles.centeredMessage}>
                    <ActivityIndicator size="large" color={colorsLightMode.primary} />
                </View>
            ) : visible.length === 0 ? (
                <View style={styles.centeredMessage}>
                    <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
                </View>
            ) : (
                <View style={styles.scrollArea}>
                    <SectionList
                        sections={secoes}
                        keyExtractor={(d) => d.tipo === 'acesso' ? 'acesso-' + d.id_acesso : 'alerta-' + d.id_alerta}
                        renderSectionHeader={({ section }) => (
                            <Text style={styles.dateHeader}>{section.title}</Text>
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
    return prefs.adapted ? content : <Screen navigation={navigation} scroll={false}>{content}</Screen>;
}

const legacyStyles = StyleSheet.create({
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
