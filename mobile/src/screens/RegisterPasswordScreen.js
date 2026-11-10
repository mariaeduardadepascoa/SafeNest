import AuthLayout from '../design/AuthLayout';
import { useScreenStyles } from '../design/useScreenStyles';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';

import LogoSafeNest from '../design/AuthBrand';
import ProgressBar from '../components/ProgressBar';
import LockIcon from '../../assets/Lock.svg';
import EyeIcon from '../../assets/Eye.svg';
import EyeOffIcon from '../../assets/Eye off.svg';

export default function RegisterPasswordScreen({ navigation, route }) {
    const styles = useScreenStyles(legacyStyles, 'RegisterPasswordScreen');
    const { nome, email } = route.params; // pega o que veio da tela anterior

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function handleConfirmPassword() {
        if (password !== confirmPassword) {
            Alert.alert('Atenção: as senhas não coincidem');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Atenção: A senha deve ter no mínimo 6 caracteres');
            return;
        }

        navigation.navigate('RegisterAge', { nome, email, senha: password });
    }

    return (
        <AuthLayout style={styles.container}>

            <LogoSafeNest
                width={160}
                height={60}
                style={{ marginTop: 15 }}
            />

            <View style={styles.progressBarContainer} accessible accessibilityLabel="Cadastro, etapa 2 de 3">
                <ProgressBar
                    totalSteps={3}
                    currentStep={2}
                />
            </View>

            <View style={styles.mainTexts}>
                <Text style={styles.title}>
                    Cadastre-se e construa seu espaço protegido.
                </Text>

                <Text style={styles.subtitle}>
                    Deixe seu lar sempre seguro.
                </Text>
            </View>

            <View style={styles.contentArea}>

                <View style={styles.authContainer}>

                    <View style={styles.authSubContainer}>

                        <Text style={styles.caption}>
                            Crie sua senha
                        </Text>

                        <View style={styles.inputs}>

                            <LockIcon width={20} height={20} />

                            <TextInput accessibilityLabel="Crie sua senha"
                                style={styles.textInput}
                                placeholder="Digite aqui uma senha"
                                placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="new-password"
                            />

                            <TouchableOpacity accessibilityRole="button"
                                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                style={styles.visibilityButton}
                                onPress={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword
                                    ? <EyeIcon />
                                    : <EyeOffIcon />
                                }
                            </TouchableOpacity>

                        </View>

                    </View>

                    <View style={styles.authSubContainer}>

                        <Text style={styles.caption}>
                            Confirme sua senha
                        </Text>

                        <View style={styles.inputs}>

                            <LockIcon width={20} height={20} />

                            <TextInput accessibilityLabel="Confirme sua senha"
                                style={styles.textInput}
                                placeholder="Confirme a senha"
                                placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="new-password"
                            />

                            <TouchableOpacity accessibilityRole="button" accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'} style={styles.visibilityButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </View>

            <TouchableOpacity accessibilityRole="button" style={styles.input} onPress={handleConfirmPassword}
            >
                <Text style={styles.text}>Continuar</Text>
            </TouchableOpacity>

            <Text style={styles.caption}>Já tem uma conta?
                <Text accessibilityRole="link" style={styles.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text>
            </Text>

            <StatusBar style="auto" />

        </AuthLayout>
    );
}

const legacyStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colorsLightMode.background,
        paddingTop: 40,
    },
    progressBarContainer: {
        width: '90%',
        paddingTop: 25,
        paddingBottom: 10,
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
        textAlign: 'flex-start',
        width: 260,
    },
    caption2: {
        ...typography.caption,
        color: colorsLightMode.primary,
        cursor: 'pointer',
        textAlign: 'flex-start',
    },
    mainTexts: {
        width: 260,
        paddingBottom: 25,
    },
    contentArea: {
        minHeight: 220,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    authContainer: {
        gap: 10,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    authSubContainer: {
        gap: 10,
        width: 260,
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
    textInput: {
        ...typography.body,
        color: colorsLightMode.titles,
        flex: 1,
        height: '100%',
        paddingVertical: 0,
        margin: 0,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    EyeIcon: {
        fontSize: 18,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        width: 260,
    },
    codeBox: {
        width: 55,
        height: 55,
        borderWidth: 2,
        borderColor: colorsLightMode.gray,
        borderRadius: 10,
        backgroundColor: colorsLightMode.white,
        ...typography.body,
        color: colorsLightMode.titles,
        fontSize: 20,
        padding: 0,
        margin: 0,
        textAlignVertical: 'center',
        includeFontPadding: false,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageTitleRow: {
        width: 260,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    seta: {
        fontSize: 22,
        color: colorsLightMode.titles,
        fontWeight: 'bold',
    },
    infoCard: {
        width: 260,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.gray,
        borderWidth: 2,
        borderRadius: 10,
        padding: 12,
    },
    infoCardText: {
        ...typography.body,
        color: colorsLightMode.subtitles,
    },
    infoCardTextBold: {
        ...typography.body,
        color: colorsLightMode.primary,
    },
    input: {
        height: 60,
        width: 260,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        marginBottom: 12,
    },
    text: {
        ...typography.subtitle,
        color: colorsLightMode.white,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: 260,
        height: 55,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
    },
    radioOptionSelected: {
        borderColor: colorsLightMode.primary,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: colorsLightMode.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colorsLightMode.primary,
    },
    radioText: {
        ...typography.body,
        color: '#94A3B8',
    },
    radioTextSelected: {
        ...typography.body,
        color: colorsLightMode.titles,
        fontWeight: 'bold',
    },
});


