import React, { useState, useCallback, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AddLockButton from '../components/AddLockButton';
import LockButton from './LockButton';
import UrlModal from '../components/UrlModal';
import { obterFechadura } from '../services/api';
import { obterAccessToken } from '../services/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { Botao, Texto } from '../design/UI';

function useFechadura() {
    const [fechadura, setFechadura] = useState(null); 
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [atualizacao, setAtualizacao] = useState(0);
    const { usuario } = useAuth();

    useFocusEffect(
        useCallback(() => {
            let telaAtiva = true;
            let novaConsulta;
            let tentativas = 0;
            setFechadura(null);
            setCarregando(true);

            async function carregarFechadura() {
                let encontrouFechadura = false;
                try {
                    const identificador = await obterFechadura();
                    encontrouFechadura = !!identificador;
                    if (telaAtiva) {
                        setFechadura(identificador);
                        setErro('');
                    }
                } catch (falha) {
                    if (telaAtiva) setErro(falha.message);
                } finally {
                    if (telaAtiva) {
                        setCarregando(false);
                        if (!encontrouFechadura && tentativas < 12) {
                            tentativas += 1;
                            novaConsulta = setTimeout(() => {
                                if (AppState.currentState === 'active') carregarFechadura();
                            }, 5000);
                        }
                    }
                }
            }
            carregarFechadura();
            const retornoAoApp = AppState.addEventListener('change', estado => {
                if (estado === 'active') setAtualizacao(valor => valor + 1);
            });
            return () => {
                telaAtiva = false;
                clearTimeout(novaConsulta);
                retornoAoApp.remove();
            };
        }, [atualizacao, usuario?.id_usuario])
    );

    return { fechadura, carregando, erro, recarregar: () => setAtualizacao(valor => valor + 1) };
}

export function FechaduraSection() {
    const [modalVisible, setModalVisible] = useState(false);
    const [accessToken, setAccessToken] = useState("");
    const { fechadura, carregando, erro, recarregar } = useFechadura();

    const abrirModal = async () => {
        const token = await obterAccessToken();
        setAccessToken(token ?? "");
        setModalVisible(true);
    };

    if (carregando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (!fechadura) {
        return (
            <View>
                {erro ? <View style={{ gap: 12 }}>
                    <Texto accessibilityRole="alert">Não foi possível consultar a fechadura: {erro}</Texto>
                    <Botao title="Tentar consultar novamente" onPress={recarregar} />
                </View> : <AddLockButton onPress={abrirModal} />}
                <UrlModal
                    visible={modalVisible}
                    onClose={() => { setModalVisible(false); recarregar(); }}
                    url="http://192.168.4.1"
                    accessToken={accessToken}
                />
            </View>
        );
    }

   const id_fechadura = fechadura;

    return (
        <View>
            <LockButton id_fechadura={id_fechadura} />
        </View>
    );
}
const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
