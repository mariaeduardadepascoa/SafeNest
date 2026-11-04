import AuthLayout from '../design/AuthLayout';
import { useDesign } from '../design/DesignProvider';
import { Button } from '../design/UI';
import { useScreenStyles } from '../design/useScreenStyles';
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
    const styles = useScreenStyles(legacyStyles, 'LoginScreen');
    const { prefs, ready, saving, savePreferences } = useDesign();
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
        <AuthLayout style={styles.container}>
            <LogoSafeNest width={160} height={60} />
            <View style={styles.mainTexts}>
                <Text style={styles.title}>Faça login e sinta-se em casa.</Text>
                <Text style={styles.subtitle}>Seu lar, sempre seguro.</Text>
            </View>

            <View style={styles.authContainer}>

                <View style={styles.authSubContainer}>
                    <Text style={styles.caption}>Insira seu email</Text>
                    <View style={styles.inputs}>
                        <PersonIcon width={30} height={30} />
                        <TextInput
                            accessibilityLabel="E-mail"
                            style={styles.textSubContainer}
                            placeholder="exemplo123@gmail.com"
                            placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <View style={styles.authSubContainer}>
                    <View style={styles.titlesInputPassword}>
                        <Text style={styles.caption}>Insira sua senha</Text>
                        <Text accessibilityRole="link" style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>Esqueceu a senha?</Text>
                    </View>
                    <View style={styles.inputs}>
                        <LockIcon width={30} height={20} />
                        <TextInput
                            accessibilityLabel="Senha"
                            style={styles.textSubContainer}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="current-password"
                            returnKeyType="go"
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel={showSenha ? 'Ocultar senha' : 'Mostrar senha'} style={[{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, styles.visibilityButton]} onPress={() => setShowSenha(!showSenha)}>
                            {showSenha ? <EyeIcon /> : <EyeOffIcon />}
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: carregando, busy: carregando }} style={styles.input} onPress={handleLogin} disabled={carregando}>
                {carregando ? <ActivityIndicator color={colorsLightMode.white} /> : <Text style={styles.text}>Entrar</Text>}
            </TouchableOpacity>
            <Text style={styles.caption}>Não tem uma conta? <Text accessibilityRole="link" style={styles.caption2} onPress={() => navigation.navigate('Register')}>Faça cadastro.</Text></Text>
            <Button title={prefs.adapted ? 'Usar novo visual' : 'Usar design acessível'} secondary disabled={!ready || saving}
                onPress={async () => { try { await savePreferences({ adapted: !prefs.adapted }); } catch (error) { Alert.alert('Erro ao salvar preferência', error.message); } }} />
            <StatusBar style="auto" />
        </AuthLayout>
    );
}

const legacyStyles = StyleSheet.create({
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
