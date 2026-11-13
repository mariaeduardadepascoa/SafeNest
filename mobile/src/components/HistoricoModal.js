import { useEstilos } from '../design/useScreenStyles';
import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useVisual } from '../design/DesignProvider';
import { colorsLightMode, typography } from '../theme';

export default function HistoricoModal({ visible, evento, onClose }) {
    const estilos = useEstilos(estilosAntigos, 'HistoricoModal');
    const { c, prefs } = useVisual();
    const [carregandoFoto, setCarregandoFoto] = useState(true);
    const [erroFoto, setErroFoto] = useState(false);
    const incendio = evento?.tipo === 'alerta' && evento?.tipo_alerta?.toLowerCase() === 'fogo';
    const imagem = incendio ? evento.imagem_url : null;
    useEffect(() => {
        setCarregandoFoto(true);
        setErroFoto(false);
    }, [evento, visible]);
    if (!evento) return null;

    const momento = new Date(evento.data_hora);
    const data = momento.toLocaleDateString('pt-BR');
    const hora = momento.toLocaleTimeString('pt-BR');

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={estilos.overlay} onPress={onClose}>
                {/* Pressable vazio para que tocar dentro da caixa não feche o modal */}
                <Pressable style={[estilos.container, { maxHeight: '85%', backgroundColor: c.surface }]} onPress={() => { }} accessible={false} accessibilityViewIsModal>
                    <ScrollView contentContainerStyle={{ gap: 14 }}>
                    <Text style={estilos.title}>{evento.titulo}</Text>

                    {evento.tipo === 'acesso' && (
                        <View style={estilos.row}>
                            <Text style={estilos.label}>Dono da tag</Text>
                            <Text style={estilos.value}>{evento.nome_tag || `Tag ${evento.id_tag}`}</Text>
                        </View>
                    )}

                    <View style={estilos.row}>
                        <Text style={estilos.label}>Data</Text>
                        <Text style={estilos.value}>{data}</Text>
                    </View>

                    <View style={estilos.row}>
                        <Text style={estilos.label}>Hora</Text>
                        <Text style={estilos.value}>{hora}</Text>
                    </View>

                    {incendio && <View style={{ gap: 10 }}>
                        <Text style={[estilos.label, { color: c.text, fontSize: prefs.adapted ? 20 : 16 }]}>Foto do incêndio detectado</Text>
                        {!imagem ? <Text style={[estilos.value, { color: c.text }]}>Este alerta não possui foto registrada.</Text> : erroFoto ?
                            <Text accessibilityRole="alert" style={[estilos.value, { color: c.text }]}>Não foi possível carregar a foto deste alerta.</Text> : <>
                                {carregandoFoto && <ActivityIndicator color={c.accent} accessibilityLabel="Carregando foto do incêndio" />}
                                <Image key={`${evento.id_alerta}-${imagem}`} source={{ uri: imagem }} resizeMode="contain"
                                    accessibilityLabel="Foto do incêndio registrada no momento deste alerta"
                                    style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 10 }}
                                    onLoad={() => setCarregandoFoto(false)}
                                    onError={() => { setCarregandoFoto(false); setErroFoto(true); }} />
                            </>}
                    </View>}
                    </ScrollView>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes do evento" style={[estilos.closeButton, { minHeight: prefs.adapted ? 60 : 48, justifyContent: 'center', backgroundColor: c.accent }]} onPress={onClose}>
                        <Text style={estilos.closeText}>Fechar</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const estilosAntigos = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        backgroundColor: colorsLightMode.white,
        borderRadius: 16,
        padding: 20,
        gap: 14,
    },
    title: {
        ...typography.subtitle,
        color: colorsLightMode.black,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        ...typography.body,
        color: colorsLightMode.subtitles,
    },
    value: {
        ...typography.bodyBold,
        color: colorsLightMode.black,
    },
    closeButton: {
        marginTop: 6,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    closeText: {
        ...typography.bodyBold,
        color: colorsLightMode.white,
    },
});
