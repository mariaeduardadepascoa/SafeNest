// import { StyleSheet, Text, View, Alert, ActivityIndicator, FlatList } from 'react-native';
import { StyleSheet, Text, View, Alert, ActivityIndicator, SectionList } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ActivitysCard from '../components/ActivitysCard';

import { obterHistorico } from '../services/api';

export default function HistoryScreen({ navigation }) {
    const { usuario } = useAuth();
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const secoes = agruparPorData(dados);

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
        lista.forEach((item) => {
            const dia = new Date(item.data_hora).toLocaleDateString('pt-BR');
            const ultimo = grupos[grupos.length - 1];
            if (ultimo && ultimo.title === dia) {
                ultimo.data.push(item);
            } else {
                grupos.push({ title: dia, data: [item] });
            }
        });
        return grupos;
    }



    return (
        <View style={styles.container}>
            <View style={styles.containerTitlesPage}>
                <Text style={styles.titlePage}>Histórico</Text>
                <Text style={styles.subtitlePage}>Visualize todos os eventos aqui.</Text>
            </View>

            {carregando ? (
                <View style={styles.centeredMessage}>
                    <ActivityIndicator size="large" color={colorsLightMode.primary} />
                </View>
            ) : dados.length === 0 ? (
                <View style={styles.centeredMessage}>
                    <Text style={styles.emptyText}>Você não tem nenhum alerta ou registro de acessos ainda.</Text>
                </View>
            ) : (
                <View style={styles.scrollArea}>
                    <SectionList
                        sections={secoes}
                        keyExtractor={(d) => d.tipo === 'acesso' ? 'acesso-' + d.id_acesso : 'alerta-' + d.id_alerta}
                        renderSectionHeader={({ section }) => (
                            <Text style={styles.dateHeader}>{section.title}</Text>
                        )}
                        renderItem={({ item }) => <ActivitysCard item={item} />}
                        ItemSeparatorComponent={ItemSeparator}
                        stickySectionHeadersEnabled={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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