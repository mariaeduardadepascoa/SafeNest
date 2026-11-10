import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useVisual } from '../design/DesignProvider';
import { Botao, Cartao, Icone, Linha, Texto } from '../design/UI';

export default function ContactCard({ nome_contato, telefone, foto, onEdit, onDelete }) {
    const { c, prefs } = useVisual();

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

    if (prefs.adapted) return <Cartao style={{ marginTop: 16, gap: 16 }}>
        <Linha style={{ alignItems: 'center' }}>
            {foto ? <Image source={{ uri: foto }} accessibilityLabel={`Foto de ${nome_contato}`} style={{ width: 52, height: 52, borderRadius: 26 }} /> : <Icone name="user" size={30} />}
            <Texto size={22} weight="600" style={{ flex: 1 }}>{nome_contato}</Texto>
        </Linha>
        <View style={{ gap: 4 }}><Texto muted>Telefone</Texto><Texto size={24}>{telefone || 'Número não informado'}</Texto></View>
        <Botao title={`Ligar para ${nome_contato}`} accessibilityHint="Abre o aplicativo de telefone" onPress={ligar} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Editar contato ${nome_contato}`} onPress={onEdit} style={{ flex: 1, minWidth: 100, minHeight: 56, borderWidth: 1, borderColor: c.muted, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Texto>Editar</Texto></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Excluir contato ${nome_contato}`} onPress={onDelete} style={{ flex: 1, minWidth: 100, minHeight: 56, borderWidth: 1, borderColor: c.muted, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Texto>Excluir</Texto></Pressable>
        </View>
    </Cartao>;

    return (
        <View style={[estilos.card, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={estilos.conteudo}>
                <View style={estilos.informacoes}>
                    <View style={estilos.nomeFoto}>
                        {foto && <Image source={{ uri: foto }} accessibilityLabel={`Foto de ${nome_contato}`} style={estilos.foto} />}
                        <Texto size={prefs.adapted ? 18 : 16} weight="500" style={{ flex: 1 }}>{nome_contato}</Texto>
                    </View>
                    <Texto muted size={13}>Contato de emergência</Texto>
                    <Texto size={prefs.adapted ? 28 : 26} style={{ marginTop: 5, flexShrink: 1 }}>{telefone || 'Número não informado'}</Texto>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Ligar para ${nome_contato}`}
                    accessibilityHint="Abre o aplicativo de telefone" onPress={ligar}
                    style={({ pressed }) => [estilos.telefone, { backgroundColor: c.raised, opacity: pressed ? 0.65 : 1 }]}>
                    <Icone name="phone" size={22} />
                </Pressable>
            </View>
            <View style={[estilos.acoes, { borderTopColor: c.line }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar contato ${nome_contato}`} onPress={onEdit} style={estilos.acao}>
                    <Icone name="edit-2" size={16} /><Texto size={14}>Editar</Texto>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Excluir contato ${nome_contato}`} onPress={onDelete} style={estilos.acao}>
                    <Icone name="trash-2" size={16} color={c.red} /><Texto size={14} style={{ color: c.red }}>Excluir</Texto>
                </Pressable>
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
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
