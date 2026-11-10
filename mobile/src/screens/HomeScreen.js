
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { obterHistorico } from '../services/api';
import SensorCard from '../components/SensoresCard';
import ActivityCard from '../components/ActivitysCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoSafeNest from '../../assets/Group 104.svg';
import WifiIcon from '../../assets/Wifi.svg';
import GroupIcon from '../../assets/groups.svg';
import AlertCircleIcon from '../../assets/Alert circle.svg';
import OrangeCameraIcon from '../../assets/Camera.svg';
import HomeBlueIcon from '../../assets/Home.svg';
import AlertOctagonRedIcon from '../../assets/Alert octagon.svg';
import CheckCircleBlueIcon from '../../assets/Check circle.svg';
import { Ionicons } from '@expo/vector-icons';


import { FechaduraSection } from '../components/FechaduraSection';
import { TituloPagina, Tela } from '../design/UI';
import { useVisual } from '../design/DesignProvider';
import { useEstilos } from '../design/useScreenStyles';


export default function HomeScreen({ navigation }) {
    const estilos = useEstilos(estilosAntigos, 'HomeScreen');
    const insets = useSafeAreaInsets();
    const { usuario } = useAuth();
    const { c } = useVisual();
    const [recentes, setRecentes] = useState([]);
    const [carregandoAtividades, setCarregandoAtividades] = useState(true);

    useFocusEffect(
        useCallback(() => {
            async function carregarAtividades() {
                try {
                    const dados = await obterHistorico(usuario.id_usuario);
                    setRecentes(dados.slice(0, 3));
                } catch (error) {
                    console.log(error.message);
                } finally {
                    setCarregandoAtividades(false);
                }
            }

            if (usuario?.id_usuario) {
                carregarAtividades();
            } else {
                setCarregandoAtividades(false);
            }
        }, [usuario])
    );

    return (
        <Tela navigation={navigation} scroll={false}>
        <ScrollView style={[estilos.container, { backgroundColor: c.bg }]} contentContainerStyle={[estilos.contentContainer, { paddingTop: 18, paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
            <TituloPagina title="Início" subtitle="Veja e controle os acessos da sua casa." style={{ marginBottom: 0 }} />
            <View style={estilos.container2}>
                <View style={estilos.titlesContainer}>
                    <Text style={estilos.titles}>FECHADURA</Text>
                </View>

                <FechaduraSection></FechaduraSection>
            </View>
            <View style={estilos.container2}>
                <View style={estilos.titlesContainer}>
                    <Text style={estilos.titles}>DISPOSITIVOS</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os dispositivos" style={estilos.pressables} onPress={() => navigation.navigate('Dispositivos')}>
                    <Text style={estilos.spanVerMais}>Ver todos </Text>
                    <Ionicons name="chevron-forward" size={15} color={colorsLightMode.primary} style={{ marginTop: 1.5 }}/>
                    </Pressable>
                </View>

                <Pressable accessibilityRole="button" accessibilityLabel="Abrir câmera" onPress={() => navigation.navigate('Câmera')}><SensorCard
                    Icone={OrangeCameraIcon}
                    title="Câmera - entrada"
                    status="VER"
                /></Pressable>

                <Pressable accessibilityRole="button" accessibilityLabel="Gerenciar tags de acesso" onPress={() => navigation.navigate('Tags')}><SensorCard
                    Icone={GroupIcon}
                    title="Tags de acesso"
                    status="VER"
                /></Pressable>

            </View>

            <View style={estilos.container2}>
                <View style={estilos.titlesContainer}>
                    <Text style={estilos.titles}>ATIVIDADES RECENTES</Text>
                    <Pressable style={estilos.pressables} onPress={() => navigation.navigate('Histórico')}>
                        <Text style={estilos.spanVerMais}>Ver todos</Text>
                        <Ionicons name="chevron-forward" size={15} color={colorsLightMode.primary} style={{ marginTop: 1.5 }}/>
                    </Pressable>
                </View>

                {carregandoAtividades ? (
                    <ActivityIndicator size="small" color={colorsLightMode.primary} />
                ) : recentes.length === 0 ? (
                    <Text style={estilos.emptyText}>Nenhuma atividade recente.</Text>
                ) : (
                    recentes.map((item) => (
                        <ActivityCard
                            key={item.tipo === 'acesso' ? 'acesso-' + item.id_acesso : 'alerta-' + item.id_alerta}
                            historico={item}
                        />
                    ))
                )}
            </View>
        </ScrollView>
        </Tela>
    );
}

const estilosAntigos = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 40,
        paddingHorizontal: 12,
        gap: 45,
        paddingBottom: 100,
    },
    container2: {
        width: '100%',
        gap: 15,
    },
    titlesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    titles: {
        ...typography.caption,
        color: colorsLightMode.subtitles,
    },
    spanVerMais: {
        ...typography.caption,
        color: colorsLightMode.primary,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    pressables: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
    },
});
