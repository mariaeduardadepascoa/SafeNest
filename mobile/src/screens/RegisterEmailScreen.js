import AuthLayout from '../design/AuthLayout';
import { useScreenStyles } from '../design/useScreenStyles';

import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';

import LogoSafeNest from '../design/AuthBrand';
import ProgressBar from '../components/ProgressBar';
import PersonIcon from '../../assets/person.svg';
import { cadastro, verificarEmailExiste, enviarCodigoVerificacao, verificarCodigoVerificacao } from '../services/api';

export default function RegisterEmailScreen({ navigation, route }) {
    const styles = useScreenStyles(legacyStyles, 'RegisterEmailScreen');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [verificando, setVerificando] = useState(false);
    const verificacaoEmAndamento = useRef(false);

    const [code, setCode] = useState(['', '', '', '']);

    const codeRefs = [ //array para cada quadradinho do codigo de confirmação de email
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    //função para guardar oq foi digitado e em qual foi digitado, ex: codeChange("1", 0)
    function codeChange(text, index) {
        const digitos = text.replace(/\D/g, '').slice(0, 4 - index);
        const newCode = [...code];
        newCode[index] = '';
        for (let posicao = 0; posicao < digitos.length; posicao++) {
            newCode[index + posicao] = digitos[posicao];
        }
        setCode(newCode);

        if (digitos.length > 0) {
            const proximoCampo = Math.min(index + digitos.length, 3);
            codeRefs[proximoCampo].current?.focus();
        }
    }

    function codeKeyPress(e, index) {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) { //volta para o quadrado anterior se o usuario apagar
            codeRefs[index - 1].current.focus();
        }
    }

    // enviando e confirmando email
    async function confirmEmail() {
        if (verificacaoEmAndamento.current) return;
        if (!emailSent) {
            if (!nome.trim() || !email.trim()) {
                Alert.alert('Preencha seus dados', 'Informe seu nome e e-mail para continuar.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                setEmailError(true);
                Alert.alert('Confira seu e-mail', 'Digite um e-mail válido, como nome@exemplo.com.');
                return;
            }
        } else if (!/^\d{4}$/.test(code.join(''))) {
            Alert.alert('Confira o código', 'Insira os quatro números enviados para seu e-mail.');
            return;
        }

        verificacaoEmAndamento.current = true;
        setVerificando(true);
        try {
            const emailNormalizado = email.trim().toLowerCase();
            if (!emailSent) {
                const existe = await verificarEmailExiste(emailNormalizado);
                if (existe) {
                    setEmailError(true);
                    Alert.alert('Atenção: Este e-mail já está cadastrado no sistema.');
                    return;
                }

                await enviarCodigoVerificacao(emailNormalizado);
                setEmailSent(true);
            } else {
                await verificarCodigoVerificacao(emailNormalizado, code.join(''));
                navigation.navigate('RegisterPassword', { nome: nome.trim(), email: emailNormalizado });
            }
        } catch (err) {
            Alert.alert('Não foi possível continuar', err.message);
        } finally {
            verificacaoEmAndamento.current = false;
            setVerificando(false);
        }
    }

    return (
        <AuthLayout style={styles.container}>

            <LogoSafeNest
                width={160}
                height={60}
                style={{ marginTop: 15 }}
            />

            <View style={styles.progressBarContainer} accessible accessibilityLabel="Cadastro, etapa 1 de 3">
                <ProgressBar
                    totalSteps={3}
                    currentStep={1}
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

                        <Text style={styles.caption}>Insira seu nome</Text>
                        <View style={styles.inputs}>
                            <PersonIcon width={30} height={30} />
                            <TextInput accessibilityLabel="Nome completo"
                                style={styles.textInput}
                                placeholder="Seu nome completo"
                                placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                                value={nome}
                                onChangeText={setNome}
                                editable={!emailSent && !verificando}
                            />
                        </View>
                    </View>

                    <View style={styles.authSubContainer}>
                        <Text style={styles.caption}>Insira seu email</Text>
                        <View style={[styles.inputs, emailError && styles.inputsError]}>
                            <PersonIcon width={30} height={30} />
                            <TextInput accessibilityLabel="E-mail"
                                style={styles.textInput}
                                placeholder="email123@email.com"
                                placeholderTextColor={styles.inputHint?.color || colorsLightMode.subtitles}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError(false);
                                }}
                                editable={!emailSent && !verificando}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    {emailSent && (
                        <View style={styles.authSubContainer}>

                            <Text style={styles.caption}>
                                Insira o código enviado por email
                            </Text>

                            <View style={styles.codeContainer}>

                                {code.map((digit, index) => (
                                    <TextInput accessibilityLabel={`Dígito ${index + 1} do código de verificação`}
                                        key={index}
                                        ref={codeRefs[index]}
                                        style={styles.codeBox}
                                        value={digit}
                                        onChangeText={(text) =>
                                            codeChange(text, index)
                                        }
                                        onKeyPress={(e) =>
                                            codeKeyPress(e, index)
                                        }
                                        maxLength={4 - index}
                                        editable={!verificando}
                                        keyboardType="number-pad"
                                        textAlign="center"
                                    />
                                ))}

                            </View>

                        </View>
                    )}

                </View>

            </View>

            {!emailSent ? (
                <>
                    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: verificando, busy: verificando }} style={styles.input} onPress={confirmEmail} disabled={verificando}>
                        <Text style={styles.text}>{verificando ? 'Enviando código…' : 'Enviar código de confirmação'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.caption}>Já tem uma conta?<Text accessibilityRole="link" style={styles.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text></Text>
                </>
            ) : (
                <>
                    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: verificando, busy: verificando }} style={styles.input} onPress={confirmEmail} disabled={verificando}>
                        <Text style={styles.text}>{verificando ? 'Verificando código…' : 'Confirmar e-mail'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.caption}>Já tem uma conta?<Text accessibilityRole="link" style={styles.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text></Text>
                </>
            )}

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
    },
    eyeIcon: {
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
    inputsError: {
        borderColor: '#E53E3E',
    },
});


