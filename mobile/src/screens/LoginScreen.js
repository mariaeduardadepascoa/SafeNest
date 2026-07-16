import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';

export default function LoginScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <LogoSafeNest width={175} height={60} />
            <View style={styles.mainTexts}>
                <Text style={styles.title}>Faça login e sinta-se em casa.</Text>
                <Text style={styles.subtitle}>Seu lar, sempre seguro.</Text>
            </View>
            
            <View style={styles.authContainer}>

                <View style={styles.authSubContainer}>
                    <Text style={styles.caption}>Insira seu email</Text>
                    <TouchableOpacity style={styles.inputs}></TouchableOpacity>
                </View>

                <View style={styles.authSubContainer}>
                    <Text style={styles.caption}>Insira sua senha</Text>
                    <TouchableOpacity style={styles.inputs}></TouchableOpacity>
                </View>

            </View>
            <TouchableOpacity style={styles.input} onPress={()=>navigation.navigate('Main')}>
                <Text style={styles.text}>Entrar</Text>
            </TouchableOpacity>
            <Text style={styles.caption}>Não tem uma conta? <Text style={styles.caption2}>Faça cadastro.</Text></Text>
            {/* <Button
                title='Ir para a tela Profile'
                onPress={() => {
                    navigation.navigate('Profile');
                }}
            /> */}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorsLightMode.background,
        gap: 26,
    },
    title: {
        ...typography.title,
        color: colorsLightMode.titles,
        textAlign: 'flex-start',
    },
    subtitle: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        textAlign: 'flex-start',
    },
    caption: {
        ...typography.caption,
        color: colorsLightMode.titles,
    },
    caption2: {
        ...typography.caption,
        color: colorsLightMode.primary,
        cursor: 'pointer',
    },
    mainTexts: {
        width: 260,
    },
    authContainer: {
        gap: 22,
    },
    authSubContainer: {
        gap: 10,
    },
    inputs: {
        height: 60,
        width: 260,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.gray,
        borderWidth: 2,
        borderRadius: 10,
    },
    input: {
        height: 60,
        width: 260,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
    },
    text: {
        ...typography.body,
        color: colorsLightMode.white,
    },
});