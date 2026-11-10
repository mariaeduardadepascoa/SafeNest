import { useEstilos } from '../design/useScreenStyles';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colorsLightMode, typography } from '../theme';

export default function HistoricoModal({ visible, evento, onClose }) {
    const estilos = useEstilos(estilosAntigos, 'HistoricoModal');
    if (!evento) return null;

    const momento = new Date(evento.data_hora);
    const data = momento.toLocaleDateString('pt-BR');
    const hora = momento.toLocaleTimeString('pt-BR');

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={estilos.overlay} onPress={onClose}>
                {/* Pressable vazio para que tocar dentro da caixa não feche o modal */}
                <Pressable style={estilos.container} onPress={() => { }} accessible={false} accessibilityViewIsModal>
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

                    <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes do evento" style={estilos.closeButton} onPress={onClose}>
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
