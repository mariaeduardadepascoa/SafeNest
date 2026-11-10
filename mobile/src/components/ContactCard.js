import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useDesign } from '../design/DesignProvider';
import { Icon, Txt } from '../design/UI';

export default function ContactCard({ nome_contato, telefone, foto, onEdit, onDelete }) {
    const { c, prefs } = useDesign();

    async function ligar() {
        const numero = String(telefone || '').replace(/[^0-9+]/g, '');
        if (!numero) {
            Alert.alert('Telefone indisponível', 'Edite o contato para informar um número.');
            return;
        }

        try {
            await Linking.openURL(`tel:${numero}`);
        } catch {
            Alert.alert('Erro', 'Não foi possível abrir a ligação.');
        }
    }

    return (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={styles.conteudo}>
                <View style={styles.informacoes}>
                    <View style={styles.nomeFoto}>
                        {foto && <Image source={{ uri: foto }} accessibilityLabel={`Foto de ${nome_contato}`} style={styles.foto} />}
                        <Txt size={prefs.adapted ? 18 : 16} weight="500" style={{ flex: 1 }}>{nome_contato}</Txt>
                    </View>
                    <Txt muted size={13}>Contato de emergência</Txt>
                    <Txt size={prefs.adapted ? 28 : 26} style={{ marginTop: 5, flexShrink: 1 }}>{telefone || 'Número não informado'}</Txt>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Ligar para ${nome_contato}`}
                    accessibilityHint="Abre o aplicativo de telefone" onPress={ligar}
                    style={({ pressed }) => [styles.telefone, { backgroundColor: c.raised, opacity: pressed ? 0.65 : 1 }]}>
                    <Icon name="phone" size={22} />
                </Pressable>
            </View>
            <View style={[styles.acoes, { borderTopColor: c.line }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar contato ${nome_contato}`} onPress={onEdit} style={styles.acao}>
                    <Icon name="edit-2" size={16} /><Txt size={14}>Editar</Txt>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Excluir contato ${nome_contato}`} onPress={onDelete} style={styles.acao}>
                    <Icon name="trash-2" size={16} color={c.red} /><Txt size={14} style={{ color: c.red }}>Excluir</Txt>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%', borderWidth: 1, borderRadius: 28,
        paddingHorizontal: 22, paddingTop: 24, paddingBottom: 8, marginTop: 16,
    },
    conteudo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    informacoes: { flex: 1, gap: 6, minWidth: 0 },
    nomeFoto: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    foto: { width: 36, height: 36, borderRadius: 18 },
    telefone: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    acoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 18, marginTop: 16, borderTopWidth: 1, paddingTop: 4 },
    acao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, paddingHorizontal: 4 },
});
