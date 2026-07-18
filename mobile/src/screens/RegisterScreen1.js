import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';
import ProgressBar from '../components/ProgressBar';
import PersonIcon from '../../assets/person.svg';
import LockIcon from '../../assets/Lock.svg';
import EyeIcon from '../../assets/Eye.svg';
import EyeOffIcon from '../../assets/Eye off.svg';

export default function RegisterScreen({ navigation }) {
    const [step, setStep] = useState(1);

    const [code, setCode] = useState(['', '', '', '']);
    const codeRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Step 1 - email
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    // Step 2 - senha
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 3 - faixa etária
    const [ageRange, setAgeRange] = useState('18-50');
    const [infoCardOpen, setInfoCardOpen] = useState(false);

    function codeChange(text, index) {
        let newCode = code.slice(); // copia o array do código
        newCode[index] = text;
        setCode(newCode);

        //se a pessoa digitou algo, pula pro próximo quadradinho
        if (text !== '' && index < 3) {
            codeRefs[index + 1].current.focus();
        }
    }

    function codeKeyPress(e, index) {
        //se a pessoa apertou backspace num quadradinho vazio volta pro anterior
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
            codeRefs[index - 1].current.focus();
        }
    }

    function confirmEmail() {
        if (!emailSent) {
            // TODO: chamar API para enviar código por email
            setEmailSent(true);
        } else {
            // TODO: validar código recebido
            setStep(2);
        }
    }

    function handleConfirmPassword() {
        // TODO: validar se password === confirmPassword
        setStep(3);
    }

    function finishRegister() {
        // TODO: enviar cadastro completo
        navigation.navigate('Main');
    }

    return (
        <View style={styles.container}>
            <LogoSafeNest width={160} height={60} style={{ marginTop: 15 }} />
            <View style={styles.progressBarContainer}>
                <ProgressBar totalSteps={3} currentStep={step} />
            </View>

            <View style={styles.mainTexts}>
                <Text style={styles.title}>Cadastre-se e construa seu espaço protegido.</Text>
                <Text style={styles.subtitle}>Deixe seu lar sempre seguro.</Text>
            </View>

            <View style={styles.contentArea}>
                {/* STEP 1 - EMAIL*/}
                {step === 1 && (
                    <View style={styles.authContainer}>
                        <View style={styles.authSubContainer}>
                            <Text style={styles.caption}>Insira seu email</Text>
                            <View style={styles.inputs}>
                                <PersonIcon width={30} height={30} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="email123@email.com"
                                    placeholderTextColor={colorsLightMode.subtitles}
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!emailSent}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {emailSent && (
                            <View style={styles.authSubContainer}>
                                <Text style={styles.caption}>
                                    Insira o código de confirmação enviado via email
                                </Text>
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
                )}

                {/* STEP 2 - SENHA */}
                {step === 2 && (
                    <View style={styles.authContainer}>
                        <View style={styles.authSubContainer}>
                            <Text style={styles.caption}>Crie sua senha</Text>
                            <View style={styles.inputs}>
                                <LockIcon width={20} height={20} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Digite aqui uma senha"
                                    placeholderTextColor={colorsLightMode.subtitles}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Text style={styles.eyeIcon}>{showPassword ? <EyeIcon /> : <EyeOffIcon />}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.authSubContainer}>
                            <Text style={styles.caption}>Confirme sua senha</Text>
                            <View style={styles.inputs}>
                                <LockIcon width={20} height={20} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Confirme a senha"
                                    placeholderTextColor={colorsLightMode.subtitles}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Text style={styles.eyeIcon}>{showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* STEP 3 - FAIXA ETÁRIA */}
                {step === 3 && (
                    <View style={styles.authContainer}>
                        <View style={styles.ageTitleRow}>
                            <Text style={[styles.caption, { width: undefined }]}>Nos informe sua faixa etária</Text>
                            <TouchableOpacity onPress={() => setInfoCardOpen(!infoCardOpen)}>
                                <Text style={styles.seta}>{infoCardOpen ? '⌄' : '›'}</Text>
                            </TouchableOpacity>
                        </View>

                        {infoCardOpen && (
                            <View style={styles.infoCard}>
                                <Text style={styles.infoCardText}>
                                    Nós possuímos um sistema de adaptação conforme a idade. Se você
                                    possuir mais de 50 anos o SafeNest irá se adaptar visualmente
                                    para você.
                                </Text>
                                <Text style={styles.infoCardTextBold}>É possível editar essa adaptação nas configurações do aplicativo.</Text>
                            </View>
                        )}

                        <TouchableOpacity style={[styles.radioOption, ageRange === '18-50' && styles.radioOptionSelected,]} onPress={() => setAgeRange('18-50')} >
                            <View style={[styles.radioCircle, ageRange === '18-50' && styles.radioCircleSelected,]} >
                                {ageRange === '18-50' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[styles.radioText, ageRange === '18-50' && styles.radioTextSelected,]}>Entre 18 e 50 anos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.radioOption, ageRange === '50+' && styles.radioOptionSelected,]} onPress={() => setAgeRange('50+')}>
                            <View style={[styles.radioCircle, ageRange === '50+' && styles.radioCircleSelected,]}>
                                {ageRange === '50+' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[styles.radioText, ageRange === '50+' && styles.radioTextSelected,]}>Mais de 50 anos</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* BOTÕES */}
            {step === 1 && !emailSent && (
                <>
                    <TouchableOpacity style={styles.input} onPress={confirmEmail}>
                        <Text style={styles.text}>Enviar código de confirmação</Text>
                    </TouchableOpacity>
                    <Text style={styles.caption}>
                        Já tem uma conta? <Text style={styles.caption2}>Faça login.</Text>
                    </Text>
                </>
            )}

            {step === 1 && emailSent && (
                <>
                    <TouchableOpacity style={styles.input} onPress={confirmEmail}>
                        <Text style={styles.text}>Confirmar e-mail</Text>
                    </TouchableOpacity>
                    <Text style={styles.caption}>
                        Já tem uma conta? <Text style={styles.caption2}>Faça login.</Text>
                    </Text>
                </>
            )}

            {step === 2 && (
                <>
                    <TouchableOpacity style={styles.input} onPress={handleConfirmPassword}>
                        <Text style={styles.text}>Cadastre-se</Text>
                    </TouchableOpacity>
                    <Text style={styles.caption}>
                        Já tem uma conta? <Text style={styles.caption2}>Faça login.</Text>
                    </Text>
                </>
            )}

            {step === 3 && (
                <>
                    <TouchableOpacity style={styles.input} onPress={finishRegister}>
                        <Text style={styles.text}>Cadastre-se</Text>
                    </TouchableOpacity>
                    <Text style={styles.caption}>
                        Já tem uma conta? <Text style={styles.caption2}>Faça login.</Text>
                    </Text>
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
        includeFontPadding: false,
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
});