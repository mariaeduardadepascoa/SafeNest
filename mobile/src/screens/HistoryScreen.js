import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';


// WIFIMANAGER
import WifiIcon from '../../assets/WifiBlue.svg';

export default function HistoryScreen({ navigation }) {
    return (
        <View style={styles.container1}>
            <View style={styles.texts}>
                <Text style={styles.title}>Wifi Manager</Text>
                <Text style={styles.subtitle}>Configure sua rede wifi para cadastrar sua fechadura inteligente</Text>
            </View>
            <View style={styles.mainContent}>
                <View style={styles.circle}><WifiIcon /></View>

                <View style={styles.stepsSection}>
                    <View style={styles.steps}>
                        <View style={styles.miniCircle}><Text style={styles.titleCircle}>1</Text></View>
                        <Text style={styles.step}>Escolha sua rede.</Text>
                    </View>

                    <View style={styles.steps}>
                        <View style={styles.miniCircle}><Text style={styles.titleCircle}>2</Text></View>
                        <Text style={styles.step}>Insira sua senha.</Text>
                    </View>

                    <View style={styles.steps}>
                        <View style={styles.miniCircle}><Text style={styles.titleCircle}>3</Text></View>
                        <Text style={styles.step}>Pronto! Sua fechadura está online.</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.mainButton} >
                <Text style={styles.titleButton}>Configurar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },




    // a partir daqui de baixo é a tela do wifimanager(ps: quando for usar mudar o container dela de "container1" para "container" para seguir o padrao de tudo)
    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    texts: {
        alignItems: 'flex-start',
        width: '80%',
    },
    mainContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 50,
    },
    title: {
        ...typography.title,
        color: colorsLightMode.black,
    },
    subtitle: {
        ...typography.subtitle,
        color: colorsLightMode.black,
    },
    circle: {
        width: 180,
        height: 180,
        borderRadius: '100%',
        backgroundColor: colorsLightMode.gray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepsSection: {
        alignItems: 'flex-start',
        gap: 30,
    },
    steps: {
        flexDirection: 'row',
        gap: 14,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    step: {
        ...typography.subtitle,
        color: colorsLightMode.black,
        textAlign: 'center',
    },
    miniCircle: {
        width: 24,
        height: 24,
        borderRadius: '100%',
        backgroundColor: colorsLightMode.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleCircle: {
        ...typography.caption,
        color: colorsLightMode.white,
    },
    mainButton: {
        backgroundColor: colorsLightMode.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        height: 65,
        borderRadius: 20,
    },
    titleButton: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.white,
    },
});