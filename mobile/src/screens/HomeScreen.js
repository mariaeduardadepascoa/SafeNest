
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/Group 104.svg';
import WifiIcon from '../../assets/Wifi.svg';
import GroupIcon from '../../assets/groups.svg';
import AlertCircleIcon from '../../assets/Alert circle.svg';
import OrangeCameraIcon from '../../assets/Camera.svg';
import SensorCard from '../components/SensoresCard';
import ActivityCard from '../components/ActivitysCard';
import HomeBlueIcon from '../../assets/Home.svg';
import AlertOctagonRedIcon from '../../assets/Alert octagon.svg';
import CheckCircleBlueIcon from '../../assets/Check circle.svg';
import { useState } from 'react';


import LockButton from '../components/LockButton';


export default function HomeScreen({ navigation }) {
    
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <LogoSafeNest width={215} />
            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>Fechadura</Text>

                </View>

                <LockButton></LockButton>



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
                    <Text style={styles.spanVerMais}>Ver todos </Text>
                </View>

                <ActivityCard
                    Icon={HomeBlueIcon}
                    title="Porta aberta"
                    time='3' />

                <ActivityCard
                    Icon={AlertOctagonRedIcon}
                    title="Alerta acionado"
                    time='4'
                    danger />

                <ActivityCard
                    Icon={CheckCircleBlueIcon}
                    title="Entrada permitida"
                    time='8' />
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
});