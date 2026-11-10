import { useEstilos } from '../design/useScreenStyles';
import { View, StyleSheet } from 'react-native';
import { colorsLightMode } from '../theme';

export default function ProgressBar({ totalSteps = 3, currentStep = 1 }) {
    const estilos = useEstilos(estilosAntigos, 'ProgressBar');
    return (
        <View style={estilos.container}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        estilos.bar,
                        index < currentStep ? estilos.barActive : estilos.barInactive,
                    ]}
                />
            ))}
        </View>
    );
}

const estilosAntigos = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
    },
    bar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    barActive: {
        backgroundColor: colorsLightMode.primary,
    },
    barInactive: {
        backgroundColor: '#E2E8F0',
    },
});