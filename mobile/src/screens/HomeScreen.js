
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


import { FechaduraSection } from '../components/FechaduraSection';


export default function HomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { usuario } = useAuth();
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
        <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
            <LogoSafeNest width={215} />
            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>Fechadura</Text>
                </View>

                <FechaduraSection></FechaduraSection>
            </View>
            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>SENSORES</Text>
                    <Text style={styles.spanVerMais}>Ver todos </Text>
                </View>

                <SensorCard
                    Icon={OrangeCameraIcon}
                    title="Câmera - entrada"
                    status="BATERIA"
                    warning
                />

                <SensorCard
                    Icon={GroupIcon}
                    title="Sensor de arrombamento"
                    status="ON"
                />

                <SensorCard
                    Icon={AlertCircleIcon}
                    title="Sensor de incêndio"
                    status="ON"
                />

            </View>

            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>ATIVIDADES RECENTES</Text>
                    <Pressable onPress={() => navigation.navigate('Histórico')}>
                        <Text style={styles.spanVerMais}>Ver todos </Text>
                    </Pressable>
                </View>

                {carregandoAtividades ? (
                    <ActivityIndicator size="small" color={colorsLightMode.primary} />
                ) : recentes.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma atividade recente.</Text>
                ) : (
                    recentes.map((item) => (
                        <ActivityCard
                            key={item.tipo === 'acesso' ? 'acesso-' + item.id_acesso : 'alerta-' + item.id_alerta}
                            item={item}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    },
    emptyText: {
        ...typography.body,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
    },
});