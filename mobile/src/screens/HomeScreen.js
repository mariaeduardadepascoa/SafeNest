
import { StyleSheet, Text, View, Image } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/Group 104.svg';
import WifiIcon from '../../assets/Wifi.svg';
import GroupIcon from '../../assets/groups.svg';
import AlertCircleIcon from '../../assets/Alert circle.svg';
import OrangeCameraIcon from '../../assets/Camera.svg';


export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <LogoSafeNest width={215} />
            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>SENSORES</Text>
                    <Text style={styles.spanVerMais}>Ver todos </Text>
                </View>

                <View style={styles.cardWarningSensor}>
                    <View style={styles.cardPrimeiroConjunto}>
                        <OrangeCameraIcon width={26} height={26} />
                        <Text style={styles.cardWarningTitle}>Câmera - entrada</Text>
                    </View>
                    <View style={styles.cardSegundoConjunto}>
                        <Text style={styles.cardWarningTitle}>BATERIA</Text>
                    </View>
                </View>

                <View style={styles.cardNormalSensor}>
                    <View style={styles.cardPrimeiroConjunto}>
                        <GroupIcon width={26} height={26} />
                        <Text style={styles.cardTitle}>Sensor de arrombamento</Text>
                    </View>
                    <View style={styles.cardSegundoConjunto}>
                        <WifiIcon width={20} height={20} />
                        <Text style={styles.cardTitle}>ON</Text>
                    </View>
                </View>

                <View style={styles.cardNormalSensor}>
                    <View style={styles.cardPrimeiroConjunto}>
                        <AlertCircleIcon width={26} height={26} />
                        <Text style={styles.cardTitle}>Sensor de incêndio</Text>
                    </View>
                    <View style={styles.cardSegundoConjunto}>
                        <WifiIcon width={20} height={20} />
                        <Text style={styles.cardTitle}>ON</Text>
                    </View>
                </View>

            </View>
            <View style={styles.container2}>
                <View style={styles.titlesContainer}>
                    <Text style={styles.titles}>ATIVIDADES RECENTES</Text>
                    <Text style={styles.spanVerMais}>Ver todos </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: 40,
        gap: 45,
        paddingHorizontal: 12,
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
    cardNormalSensor: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 60,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        backgroundColor: colorsLightMode.primary,
        borderRadius: 15,
    },
    cardPrimeiroConjunto: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cardSegundoConjunto: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardTitle: {
        ...typography.body,
        color: colorsLightMode.white,
    },
    cardWarningSensor: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 60,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        backgroundColor: colorsLightMode.primary,
        borderRadius: 15,
        borderColor: colorsLightMode.warning,
        borderWidth: 2,
    },
    cardWarningTitle: {
        ...typography.body,
        color: colorsLightMode.warning,
    },
});