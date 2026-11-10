import { View, Text, StyleSheet } from 'react-native';
import WifiIcon from '../../assets/Wifi.svg';
import { colorsLightMode, typography } from '../theme';
import { useEstilos } from '../design/useScreenStyles';

export default function SensorCard({Icone, title, status, warning = false}) {
    const estilos = useEstilos(estilosAntigos, 'SensorCard');
    return (
        <View style={[estilos.card, warning && estilos.warningCard]}>

            <View style={estilos.left}>
                <Icone width={26} height={26} />
                <Text style={warning? estilos.warningText : estilos.normalText}>{title}</Text>
            </View>

            <View style={estilos.right}>
                {!warning && (<WifiIcon width={20} height={20} />)}
                <Text style={warning? estilos.warningText : estilos.normalText}>{status}</Text>
            </View>
            
        </View>
    );
}

const estilosAntigos = StyleSheet.create({
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
