import { StyleSheet, Text, View } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';

export default function CameraScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text>
                camera
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