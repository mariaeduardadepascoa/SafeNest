import { View, Text, StyleSheet } from 'react-native';
import WifiIcon from '../../assets/Wifi.svg';
import { colorsLightMode, typography } from '../theme';

export default function SensorCard({Icon, title, status, warning = false}) {
    return (
        <View style={[styles.card, warning && styles.warningCard]}>

            <View style={styles.left}>
                <Icon width={26} height={26} />
                <Text style={warning? styles.warningText : styles.normalText}>{title}</Text>
            </View>

            <View style={styles.right}>
                {!warning && (<WifiIcon width={20} height={20} />)}
                <Text style={warning? styles.warningText : styles.normalText}>{status}</Text>
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
        borderRadius: 15,
    },

    warningCard: {
        borderWidth: 2,
        borderColor: colorsLightMode.warning,
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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

    warningText: {
        ...typography.body,
        color: colorsLightMode.warning,
    },
});