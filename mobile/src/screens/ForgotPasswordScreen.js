import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { colorsLightMode, typography } from '../theme';

import PersonIcon from '../../assets/person.svg';
import { forgotPassword, validateResetCode } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [verificando, setVerificando] = useState(false);

    const [code, setCode] = useState(['', '', '', '']);
    const codeRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    function codeChange(text, index) {
        let newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        if (text !== '' && index < 3) {
            codeRefs[index + 1].current.focus();
        }
    }

    function codeKeyPress(e, index) {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
            codeRefs[index - 1].current.focus();
        }
    }

    async function handleSubmit() {
        if (!email.trim()) {
            setEmailError(true);
            return;
        }

        if (!emailSent) {
            setEnviando(true);
            try {
                await forgotPassword(email.trim().toLowerCase());
                setEmailSent(true);
            } catch (err) {
                Alert.alert('Erro', 'Não foi possível enviar o código.');
            } finally {
                setEnviando(false);
            }
        } else {
            const codigoDigitado = code.join('');

            if (codigoDigitado.length < 4) {
                Alert.alert('Atenção', 'Insira o código completo.');
                return;
            }

            setVerificando(true);

            try {
                await validateResetCode(codigoDigitado);
                navigation.navigate('ResetPassword', { token: codigoDigitado });
            } catch (err) {
                Alert.alert('Erro', err.message);
            } finally {
                setVerificando(false);
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.seta}>{'‹'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mainTexts}>
                <Text style={styles.title}>
                    Esqueceu sua senha?
                </Text>

                <Text style={styles.subtitle}>
                    Enviaremos um código de redefinição para o seu email.
                </Text>
            </View>

            <View style={styles.contentArea}>
                <View style={styles.authContainer}>
                    <View style={styles.authSubContainer}>
                        <Text style={styles.caption}>Insira seu email</Text>
                        <View style={[styles.inputs, emailError && styles.inputsError]}>
                            <PersonIcon width={30} height={30} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="email123@email.com"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError(false);
                                }}
                                editable={!emailSent}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {emailSent && (
                        <View style={styles.authSubContainer}>
                            <Text style={styles.caption}>Insira o código enviado por email</Text>
                            <View style={styles.codeContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={codeRefs[index]}
                                        style={styles.codeBox}
                                        value={digit}
                                        onChangeText={(text) => codeChange(text, index)}
                                        onKeyPress={(e) => codeKeyPress(e, index)}
                                        maxLength={1}
                                        keyboardType="number-pad"
                                        textAlign="center"
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.input} onPress={handleSubmit} disabled={enviando || verificando}>
                <Text style={styles.text}>
                    {!emailSent ? (enviando ? 'Enviando...' : 'Enviar código') : (verificando ? 'Verificando...' : 'Confirmar código')}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorsLightMode.background,
        // gap: 20,
    },
    header: {
        width: 260,
        alignItems: 'flex-start',
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.gray,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.title,
        color: colorsLightMode.titles,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentArea: {
        minHeight: 100,
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
    inputsError: {
        borderColor: '#E53E3E',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 260,
        marginTop: 10,
    },
    codeBox: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderColor: colorsLightMode.gray,
        borderRadius: 10,
        backgroundColor: colorsLightMode.white,
        fontSize: 24,
        textAlign: 'center',
        color: colorsLightMode.titles,
    },
});