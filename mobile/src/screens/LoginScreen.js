import EstruturaEntrada from '../design/AuthLayout';
import { useVisual } from '../design/DesignProvider';
import { Botao } from '../design/UI';
import { useEstilos } from '../design/useScreenStyles';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../design/AuthBrand';
import PersonIcon from '../../assets/person.svg';
import LockIcon from '../../assets/Lock.svg';
import EyeIcon from '../../assets/Eye.svg';
import EyeOffIcon from '../../assets/Eye off.svg';
import ForgotPassword from '../screens/ForgotPasswordScreen.js';


export default function LoginScreen({ navigation }) {
    const estilos = useEstilos(estilosAntigos, 'LoginScreen');
    const { prefs, ready, saving, savePreferences } = useVisual();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const { setUsuario } = useAuth();
    const loginEmAndamento = useRef(false);

    async function handleLogin() {
        if (loginEmAndamento.current) return;
        if (!email.trim() || !senha) {
            Alert.alert('Atenção: email e senha são obrigatórios!');
            return;
        }

        loginEmAndamento.current = true;
        setCarregando(true);

        try {
            const usuarioLogado = await login(email.trim().toLowerCase(), senha);
            setUsuario(usuarioLogado);
            navigation.replace('Main');
        } catch (err) {
            Alert.alert('Erro ao entrar ', err.message);
        } finally {
            loginEmAndamento.current = false;
            setCarregando(false);
        }
    }

    return (
        <EstruturaEntrada style={estilos.container}>
            <LogoSafeNest width={160} height={60} />
            <View style={estilos.mainTexts}>
                <Text style={estilos.title}>Faça login e sinta-se em casa.</Text>
                <Text style={estilos.subtitle}>Seu lar, sempre seguro.</Text>
            </View>

            <View style={estilos.authContainer}>

                <View style={estilos.authSubContainer}>
                    <Text style={estilos.caption}>Insira seu email</Text>
                    <View style={estilos.inputs}>
                        <PersonIcon width={30} height={30} />
                        <TextInput
                            accessibilityLabel="E-mail"
                            style={estilos.textSubContainer}
                            placeholder="exemplo123@gmail.com"
                            placeholderTextColor={estilos.inputHint?.color || colorsLightMode.subtitles}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <View style={estilos.authSubContainer}>
                    <View style={estilos.titlesInputPassword}>
                        <Text style={estilos.caption}>Insira sua senha</Text>
                        <Text accessibilityRole="link" style={estilos.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>Esqueceu a senha?</Text>
                    </View>
                    <View style={estilos.inputs}>
                        <LockIcon width={30} height={20} />
                        <TextInput
                            accessibilityLabel="Senha"
                            style={estilos.textSubContainer}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor={estilos.inputHint?.color || colorsLightMode.subtitles}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="current-password"
                            returnKeyType="go"
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel={showSenha ? 'Ocultar senha' : 'Mostrar senha'} style={[{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, estilos.visibilityButton]} onPress={() => setShowSenha(!showSenha)}>
                            {showSenha ? <EyeIcon /> : <EyeOffIcon />}
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: carregando, busy: carregando }} style={estilos.input} onPress={handleLogin} disabled={carregando}>
                {carregando ? <ActivityIndicator color={colorsLightMode.white} /> : <Text style={estilos.text}>Entrar</Text>}
            </TouchableOpacity>
            <Text style={estilos.caption}>Não tem uma conta? <Text accessibilityRole="link" style={estilos.caption2} onPress={() => navigation.navigate('Register')}>Faça cadastro.</Text></Text>
            <Botao title={prefs.adapted ? 'Usar novo visual' : 'Usar design acessível'} secondary disabled={!ready || saving}
                onPress={async () => { try { await savePreferences({ adapted: !prefs.adapted }); } catch (error) { Alert.alert('Erro ao salvar preferência', error.message); } }} />
            <StatusBar style="auto" />
        </EstruturaEntrada>
    );
}

const estilosAntigos = StyleSheet.create({
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
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 12,
        paddingRight: 12,
        gap: 8,
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
        ...typography.subtitle,
        color: colorsLightMode.white,
    },
    textSubContainer: {
        ...typography.body,
        color: colorsLightMode.subtitles,
        height: '100%',
        flex: 1,
    },
    titlesInputPassword: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    forgotPassword: {
        ...typography.body,
        color: colorsLightMode.primary,
    },
});
