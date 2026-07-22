import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { obterFechadura } from '../services/api';

export function useFechaduras() {
    const [fechaduras, setFechaduras] = useState([]);
    const [carregando, setCarregando] = useState(true);

    async function carregarFechaduras() {
        try {
            setCarregando(true);
            const data = await obterFechaduras();
            setFechaduras(data);
        } catch (err) {
            console.error(err);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarFechaduras();
        }, [])
    );

    // Retorna o estado e a função para caso você queira recarregar manualmente (ex: pull-to-refresh)
    return { fechaduras, carregando, recarregar: carregarFechaduras };
}