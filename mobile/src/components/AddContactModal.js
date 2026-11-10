import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisual } from '../design/DesignProvider';
import { Botao, Icone, Texto } from '../design/UI';

export default function AddContactModal({ visible, onClose, onSave, contato, salvando }) {
    const { c, prefs } = useVisual();
    const insets = useSafeAreaInsets();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [foto, setFoto] = useState(null);

    useEffect(() => {
        if (visible) {
            setNome(contato?.nome || '');
            setTelefone(contato?.telefone || '');
            setFoto(contato?.foto || null);
        }
    }, [visible, contato]);

    async function escolherFoto() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para adicionar uma imagem ao contato.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1], //corte quadrado
            quality: 0.7,
        });

        if (!resultado.canceled) {
            setFoto(resultado.assets[0].uri);
        }
    }

    function salvarContato() {
        if (salvando) return;
        if (!nome.trim() || !telefone.replace(/\D/g, '')) {
            Alert.alert('Confira os dados', 'Informe o nome e o telefone do contato.');
            return;
        }
        onSave({ id: contato?.id, nome: nome.trim(), telefone: telefone.trim(), foto });
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={salvando ? () => {} : onClose}>
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(11,35,66,0.38)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
                    contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16), paddingHorizontal: 16 }}>
                    <Pressable accessible={false} disabled={salvando} onPress={onClose} style={{ flex: 1, minHeight: 16 }} />
                    <View accessibilityViewIsModal style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 28, padding: 22, gap: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                            <View style={{ flex: 1, gap: 4 }}>
                                <Texto accessibilityRole="header" size={24} weight="600">{contato ? 'Editar contato' : 'Novo contato'}</Texto>
                                <Texto muted size={13}>Uma pessoa de confiança para ter por perto.</Texto>
                            </View>
                            <Pressable accessibilityRole="button" accessibilityLabel="Fechar contato" disabled={salvando} onPress={onClose}
                                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}>
                                <Icone name="x" />
                            </Pressable>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel={foto ? 'Alterar foto do contato' : 'Adicionar foto do contato'}
                            accessibilityHint="Abre a galeria de imagens" disabled={salvando} onPress={escolherFoto} style={{ alignSelf: 'center', alignItems: 'center', gap: 8 }}>
                            <View>
                                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.raised, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                                    {foto ? <Image source={{ uri: foto }} accessibilityLabel={`Foto de ${nome || 'contato'}`} style={{ width: '100%', height: '100%' }} /> : <Icone name="user" size={34} />}
                                </View>
                                <View style={{ position: 'absolute', bottom: 0, right: -4, width: 30, height: 30, borderRadius: 15, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface }}>
                                    <Icone name="camera" size={15} color="#FFFFFF" />
                                </View>
                            </View>
                            <Texto size={12}>{foto ? 'Alterar foto' : 'Adicionar foto'}</Texto>
                        </Pressable>
                        <View style={{ gap: 8 }}>
                            <Texto weight="600" size={13}>Nome do contato</Texto>
                            <TextInput accessibilityLabel="Nome do contato" placeholder="Como essa pessoa se chama?" placeholderTextColor={c.muted}
                                value={nome} onChangeText={setNome} editable={!salvando} autoCapitalize="words"
                                style={{ minHeight: prefs.adapted ? 64 : 54, padding: 14, borderWidth: 1, borderColor: c.line, borderRadius: 14, fontSize: prefs.adapted ? 20 : 16, color: c.text }} />
                        </View>
                        <View style={{ gap: 8 }}>
                            <Texto weight="600" size={13}>Telefone</Texto>
                            <TextInput accessibilityLabel="Número do contato" placeholder="DDD e número ou telefone de emergência" placeholderTextColor={c.muted}
                                value={telefone} onChangeText={setTelefone} editable={!salvando} keyboardType="phone-pad"
                                style={{ minHeight: prefs.adapted ? 64 : 54, padding: 14, borderWidth: 1, borderColor: c.line, borderRadius: 14, fontSize: prefs.adapted ? 20 : 16, color: c.text }} />
                        </View>
                        <Botao title={contato ? 'Salvar alterações' : 'Adicionar contato'} busy={salvando} onPress={salvarContato} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );

}
