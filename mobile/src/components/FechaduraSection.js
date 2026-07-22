import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AddLockButton from '../components/AddLockButton';
import LockButton from './LockButton';
import UrlModal from '../components/UrlModal';
import { obterFechadura } from '../services/api';

function useFechadura() {
    const [fechadura, setFechadura] = useState(null); // Agora é um objeto ou null!
    const [carregando, setCarregando] = useState(true);

    async function carregarFechadura() {
        try {
            setCarregando(true);
            const data = await obterFechadura(); // Retorna o objeto direto do .single()
            setFechadura(data);
        } catch (err) {
            console.error(err);
            setFechadura(null);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarFechadura();
        }, [])
    );

    return { fechadura, carregando, recarregar: carregarFechadura };
}

export function FechaduraSection() {
    const [modalVisible, setModalVisible] = useState(false);
    const { fechadura, carregando } = useFechadura();

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
                <AddLockButton onPress={() => setModalVisible(true)} />
                <UrlModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    url="http://192.168.4.1"
                />
            </View>
        );
    }

    const id_fechadura = fechadura.id;

    return (
        <View>
            <LockButton id_fechadura={id_fechadura} />
        </View>
    );
}
const styles = StyleSheet.create({
    center: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
});