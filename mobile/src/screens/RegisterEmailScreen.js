
import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';

import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';
import ProgressBar from '../components/ProgressBar';
import PersonIcon from '../../assets/person.svg';
import { cadastro, verificarEmailExiste } from '../services/api';

export default function RegisterEmailScreen({ navigation, route }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [verificando, setVerificando] = useState(false);

    const [code, setCode] = useState(['', '', '', '']);

    const codeRefs = [ //array para cada quadradinho do codigo de confirmação de email
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    //função para guardar oq foi digitado e em qual foi digitado, ex: codeChange("1", 0)
    function codeChange(text, index) {
        let newCode = [...code]; //copia o array

        newCode[index] = text; //salva o numero

        setCode(newCode);

        if (text !== '' && index < 3) { //vai automaticamente para o proximo quadrado quando algo for digitado
            codeRefs[index + 1].current.focus();
        }
    }

    function codeKeyPress(e, index) {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) { //volta para o quadrado anterior se o usuario apagar
            codeRefs[index - 1].current.focus();
        }
    }

    // enviando e confirmando email
    async function confirmEmail() {
        if (!emailSent) {
            if (!nome.trim() || !email.trim()) {
                return; // depois dá pra trocar por um Alert avisando o usuário AARUMAR
            }

            setVerificando(true);

            try {

                const existe = await verificarEmailExiste(email.trim().toLowerCase());
                if (existe) {
                    setEmailError(true);
                    Alert.alert('Atenção: Este e-mail já está cadastrado no sistema.');
                    return;
                }

            } catch (err) {
                Alert.alert('Erro', err.message);
                return;
            } finally {
                setVerificando(false);
            }

            // enviar email aqui futuramente
            setEmailSent(true);

        } else {
            // validar código aqui futuramente ARRUMAR
            navigation.navigate('RegisterPassword', { nome, email });
        }
    }

    return (
        <View style={styles.container}>

            <LogoSafeNest
                width={160}
                height={60}
                style={{ marginTop: 15 }}
            />

            <View style={styles.progressBarContainer}>
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
                            <TextInput
                                style={styles.textInput}
                                placeholder="Seu nome completo"
                                placeholderTextColor={colorsLightMode.subtitles}
                                value={nome}
                                onChangeText={setNome}
                                editable={!emailSent}
                            />
                        </View>
                    </View>

                    <View style={styles.authSubContainer}>
                        <Text style={styles.caption}>Insira seu email</Text>
                        <View style={[styles.inputs, emailError && styles.inputsError]}>
                            <PersonIcon width={30} height={30} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="email123@email.com"
                                placeholderTextColor={colorsLightMode.subtitles}
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

                            <Text style={styles.caption}>
                                Insira o código enviado por email
                            </Text>

                            <View style={styles.codeContainer}>

                                {code.map((digit, index) => (
                                    <TextInput
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

            {!emailSent ? (
                <>
                    <TouchableOpacity style={styles.input} onPress={confirmEmail}>
                        <Text style={styles.text}>Enviar código de confirmação</Text>
                    </TouchableOpacity>

                    <Text style={styles.caption}>Já tem uma conta?<Text style={styles.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text></Text>
                </>
            ) : (
                <>
                    <TouchableOpacity style={styles.input} onPress={confirmEmail}
                    >
                        <Text style={styles.text}>Confirmar e-mail</Text>
                    </TouchableOpacity>

                    <Text style={styles.caption}>Já tem uma conta?<Text style={styles.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text></Text>
                </>
            )}

            <StatusBar style="auto" />

        </View>
    );
}

const styles = StyleSheet.create({
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


