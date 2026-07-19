import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import { cadastro } from '../services/api';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';
import ProgressBar from '../components/ProgressBar';

export default function RegisterAgeScreen({ navigation, route }) {
    const { nome, email, senha } = route.params;

    const [ageRange, setAgeRange] = useState('18-60');
    const [infoCardOpen, setInfoCardOpen] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function finishRegister() {
        setCarregando(true);
        try {
            await cadastro(nome, email, senha);
            navigation.replace('Main');
        } catch (err) {
            Alert.alert('Erro ao cadastrar', err.message);
        } finally {
            setCarregando(false);
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
                    currentStep={3}
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

                    <View style={styles.ageTitleRow}>

                        <Text
                            style={[
                                styles.caption,
                                { width: undefined }
                            ]}
                        >
                            Nos informe sua faixa etária
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                setInfoCardOpen(!infoCardOpen)
                            }
                        >
                            <Text style={styles.seta}>
                                {infoCardOpen ? '⌄' : '›'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {infoCardOpen && (
                        <View style={styles.infoCard}>

                            <Text style={styles.infoCardText}>
                                Nós possuímos um sistema de adaptação conforme a idade.
                                Se você possuir mais de 60 anos o SafeNest irá se
                                adaptar visualmente para você.
                            </Text>

                            <Text style={styles.infoCardTextBold}>
                                É possível editar essa adaptação nas configurações
                                do aplicativo.
                            </Text>

                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.radioOption,
                            ageRange === '18-60' &&
                            styles.radioOptionSelected
                        ]}
                        onPress={() =>
                            setAgeRange('18-60')
                        }
                    >

                        <View
                            style={[
                                styles.radioCircle,
                                ageRange === '18-60' &&
                                styles.radioCircleSelected
                            ]}
                        >
                            {ageRange === '18-60' &&
                                <View style={styles.radioDot} />
                            }
                        </View>

                        <Text
                            style={[
                                styles.radioText,
                                ageRange === '18-60' &&
                                styles.radioTextSelected
                            ]}
                        >
                            Entre 18 e 60 anos
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.radioOption,
                            ageRange === '60+' &&
                            styles.radioOptionSelected
                        ]}
                        onPress={() =>
                            setAgeRange('60+')
                        }
                    >

                        <View
                            style={[
                                styles.radioCircle,
                                ageRange === '60+' &&
                                styles.radioCircleSelected
                            ]}
                        >
                            {ageRange === '60+' &&
                                <View style={styles.radioDot} />
                            }
                        </View>

                        <Text
                            style={[
                                styles.radioText,
                                ageRange === '60+' &&
                                styles.radioTextSelected
                            ]}
                        >
                            Mais de 60 anos
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

            <TouchableOpacity style={styles.input} onPress={finishRegister} disabled={carregando}>
                {carregando ? <ActivityIndicator color={colorsLightMode.white} /> : <Text style={styles.text}>Cadastre-se</Text>}
            </TouchableOpacity>

            <Text style={styles.caption}>Já tem uma conta?<Text style={styles.caption2}> Faça login.</Text></Text>

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


