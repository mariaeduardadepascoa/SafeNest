import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { resetPassword } from '../services/api';
import { colorsLightMode, typography } from '../theme';

export default function ResetPasswordScreen({ route, navigation }) {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleReset() {
        if (!novaSenha.trim() || !confirmarSenha.trim()) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }
        if (novaSenha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(route.params.token, novaSenha);
            Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
            navigation.navigate('Login');
        } catch (err) {
            if (err.message.includes('TOKEN_INVALIDO')) {
                Alert.alert('Erro', 'O código informado é inválido. Solicite novamente a redefinição.');
            } else if (err.message.includes('TOKEN_EXPIRADO')) {
                Alert.alert('Erro', 'O código expirou. Solicite novamente a redefinição.');
            } else {
                Alert.alert('Erro', 'Não foi possível redefinir a senha. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Redefinir senha</Text>
            <Text style={styles.subtitle}>Digite sua nova senha abaixo</Text>

            <View style={styles.authSubContainer}>
                <Text style={styles.caption}>Nova senha</Text>
                <View style={styles.inputs}>
                    <TextInput
                        style={styles.textInput}
                        secureTextEntry
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                        placeholder="********"
                        placeholderTextColor={colorsLightMode.subtitles}
                    />
                </View>
            </View>

            <View style={styles.authSubContainer}>
                <Text style={styles.caption}>Confirmar senha</Text>
                <View style={styles.inputs}>
                    <TextInput
                        style={styles.textInput}
                        secureTextEntry
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        placeholder="********"
                        placeholderTextColor={colorsLightMode.subtitles}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.input} onPress={handleReset} disabled={loading}>
                <Text style={styles.text}>{loading ? 'Redefinindo...' : 'Redefinir senha'}</Text>
            </TouchableOpacity>

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
    title: {
        ...typography.title,
        color: colorsLightMode.titles,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
        marginBottom: 20,
    },
    caption: {
        ...typography.caption,
        color: colorsLightMode.titles,
        textAlign: 'flex-start',
        width: 260,
    },
    authSubContainer: {
        gap: 10,
        width: 260,
        marginBottom: 16,
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
    },
    textInput: {
        ...typography.body,
        color: colorsLightMode.titles,
        flex: 1,
        height: '100%',
    },
    input: {
        height: 60,
        width: 260,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        marginTop: 20,
    },
    text: {
        ...typography.subtitle,
        color: colorsLightMode.white,
    },
});
