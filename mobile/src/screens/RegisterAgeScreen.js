import EstruturaEntrada from '../design/AuthLayout';
import { useEstilos } from '../design/useScreenStyles';
import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import { cadastro, login } from '../services/api';
import { useVisual } from '../design/DesignProvider';
import { useAuth } from '../context/AuthContext';
import LogoSafeNest from '../design/AuthBrand';
import ProgressBar from '../components/ProgressBar';

export default function RegisterAgeScreen({ navigation, route }) {
    const estilos = useEstilos(estilosAntigos, 'RegisterAgeScreen');
    const { prefs } = useVisual();
    const [wantsAccessible, setWantsAccessible] = useState(prefs.adapted);
    const { nome, email, senha } = route.params;
    const [ageRange, setAgeRange] = useState('18-60');
    const [infoCardOpen, setInfoCardOpen] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const { setUsuario } = useAuth();
    const cadastroEmAndamento = useRef(false);

    async function finishRegister() {
        if (cadastroEmAndamento.current) return;
        cadastroEmAndamento.current = true;
        setCarregando(true);
        try {
            await cadastro(nome, email, senha, ageRange, wantsAccessible);
            try {
                const usuarioLogado = await login(email, senha);
                setUsuario(usuarioLogado);
                navigation.getParent().replace('Main');
            } catch {
                Alert.alert('Conta criada', 'Faça login para iniciar sua sessão com segurança.');
                navigation.getParent().replace('Login');
            }
        } catch (err) {
            Alert.alert('Erro ao cadastrar', err.message);
        } finally {
            cadastroEmAndamento.current = false;
            setCarregando(false);
        }
    }

    return (
        <EstruturaEntrada style={estilos.container}>

            <LogoSafeNest
                width={160}
                height={60}
                style={{ marginTop: 15 }}
            />

            <View style={estilos.progressBarContainer} accessible accessibilityLabel="Cadastro, etapa 3 de 3">
                <ProgressBar
                    totalSteps={3}
                    currentStep={3}
                />
            </View>

            <View style={estilos.mainTexts}>
                <Text style={estilos.title}>
                    Cadastre-se e construa seu espaço protegido.
                </Text>

                <Text style={estilos.subtitle}>
                    Deixe seu lar sempre seguro.
                </Text>
            </View>

            <View style={estilos.contentArea}>

                <View style={estilos.authContainer}>

                    <View style={estilos.ageTitleRow}>

                        <Text
                            style={[
                                estilos.caption,
                                { width: undefined }
                            ]}
                        >
                            Nos informe sua faixa etária
                        </Text>

                        <TouchableOpacity accessibilityRole="button"
                            accessibilityLabel="Informações sobre o design acessível"
                            accessibilityState={{ expanded: infoCardOpen }}
                            style={estilos.visibilityButton}
                            onPress={() =>
                                setInfoCardOpen(!infoCardOpen)
                            }
                        >
                            <Text style={estilos.seta}>
                                {infoCardOpen ? '⌄' : '›'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {infoCardOpen && (
                        <View style={estilos.infoCard}>

                            <Text style={estilos.infoCardText}>
                                Você pode escolher o design acessível original do SafeNest,
                                independentemente da sua idade.
                            </Text>

                            <Text style={estilos.infoCardTextBold}>
                                É possível editar essa adaptação nas configurações
                                do aplicativo.
                            </Text>

                        </View>
                    )}

                    <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: ageRange === '18-60' }}
                        style={[
                            estilos.radioOption,
                            ageRange === '18-60' &&
                            estilos.radioOptionSelected
                        ]}
                        onPress={() =>
                            setAgeRange('18-60')
                        }
                    >

                        <View
                            style={[
                                estilos.radioCircle,
                                ageRange === '18-60' &&
                                estilos.radioCircleSelected
                            ]}
                        >
                            {ageRange === '18-60' &&
                                <View style={estilos.radioDot} />
                            }
                        </View>

                        <Text
                            style={[
                                estilos.radioText,
                                ageRange === '18-60' &&
                                estilos.radioTextSelected
                            ]}
                        >
                            Entre 18 e 60 anos
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: ageRange === '60+' }}
                        style={[
                            estilos.radioOption,
                            ageRange === '60+' &&
                            estilos.radioOptionSelected
                        ]}
                        onPress={() =>
                            setAgeRange('60+')
                        }
                    >

                        <View
                            style={[
                                estilos.radioCircle,
                                ageRange === '60+' &&
                                estilos.radioCircleSelected
                            ]}
                        >
                            {ageRange === '60+' &&
                                <View style={estilos.radioDot} />
                            }
                        </View>

                        <Text
                            style={[
                                estilos.radioText,
                                ageRange === '60+' &&
                                estilos.radioTextSelected
                            ]}
                        >
                            Mais de 60 anos
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: '100%', paddingVertical: 12 }}>
                <Text style={[estilos.caption, { flexShrink: 1 }]}>Quero usar o design acessível original</Text>
                <Switch accessibilityLabel="Quero usar o design acessível original" value={wantsAccessible} onValueChange={setWantsAccessible} disabled={carregando} />
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: carregando, busy: carregando }} style={estilos.input} onPress={finishRegister} disabled={carregando}>
                {carregando ? <ActivityIndicator color={colorsLightMode.white} /> : <Text style={estilos.text}>Cadastre-se</Text>}
            </TouchableOpacity>

            <Text style={estilos.caption}>Já tem uma conta?<Text accessibilityRole="link" style={estilos.caption2} onPress={() => navigation.navigate('Login')}> Faça login.</Text></Text>

            <StatusBar style="auto" />

        </EstruturaEntrada>
    );
}

const estilosAntigos = StyleSheet.create({
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


