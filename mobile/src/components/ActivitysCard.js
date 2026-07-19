import { View, Text, StyleSheet } from 'react-native';
import WifiIcon from '../../assets/Wifi.svg';
import { colorsLightMode, typography } from '../theme';

export default function SensorCard({Icon, title, time, danger = false}){
    return (
    <View style={[styles.card, danger && styles.dangerCard]}>
                <View style={styles.left}>
                    <View style={styles.whiteContainerIcon}>
                    <Icon width={26} height={26} />
                    </View>
                    <Text style={danger? styles.dangerText : styles.normalText}>{title}</Text>
                </View>
    
                <View style={styles.right}>
                    <Text style={danger? styles.dangerText : styles.normalText}>Há {time} horas</Text>
                </View>
                
            </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 10,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colorsLightMode.black,
    },

    dangerCard: {
        borderWidth: 0,
        backgroundColor: colorsLightMode.danger,
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    whiteContainerIcon: {
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        padding: 4,
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    normalText: {
        ...typography.body,
        color: colorsLightMode.white,
    },

    dangerText: {
        ...typography.body,
        color: colorsLightMode.white,
    },
});