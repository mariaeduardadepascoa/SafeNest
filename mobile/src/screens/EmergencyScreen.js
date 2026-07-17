
import { StyleSheet, Text, View } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';

export default function EmergencyScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text>
                emergencia
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
    }
});