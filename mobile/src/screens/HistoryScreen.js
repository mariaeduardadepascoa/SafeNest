import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';

export default function HistoryScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...typography.title,
        color: colorsLightMode.black,
    },
});