import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import PersonWhiteIcon from '../../assets/personWhiteIcon.svg';
import PenToolIcon from '../../assets/Pen tool.svg';

export default function AddContactModal({ visible, onClose, onSave, contato, salvando }) {
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Pressable
                    style={styles.modalCard}
                    onPress={() => { }}
                >
                    <View style={styles.titlesModal}>
                        <Text style={styles.title}>
                            {
                                contato
                                    ? 'Editando contato'
                                    : 'Adicionando um contato de emergência'
                            }
                        </Text>

                        <Pressable onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </Pressable>
                    </View>

                    <Pressable style={styles.photoWrapper} onPress={escolherFoto}>
                        <View style={styles.photoButton}>
                            {foto ? (
                                <Image source={{ uri: foto }} style={styles.photoImage} />
                            ) : (
                                <PersonWhiteIcon width={80} height={80} />
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <PenToolIcon width={14} height={14} />
                        </View>
                    </Pressable>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome</Text>

                        <TextInput
                            placeholder="Digite aqui o nome do contato"
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Número</Text>

                        <TextInput
                            placeholder="Digite aqui o número do contato"
                            keyboardType="phone-pad"
                            style={styles.input}
                            value={telefone}
                            onChangeText={setTelefone}
                        />
                    </View>

                    <Pressable
                        style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
                        disabled={salvando}
                        onPress={() => {
                            onSave({
                                id: contato?.id || Date.now().toString(),
                                nome,
                                telefone,
                                foto
                            });
                        }}
                    >
                        {salvando ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveText}>
                                {contato ? 'Salvar alterações' : 'Salvar contato'}
                            </Text>
                        )}
                    </Pressable>

                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    closeText: {
        ...typography.title,
        color: colorsLightMode.black,
        fontWeight: 'bold',
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFF',
        paddingHorizontal: 25,
        borderTopWidth: 2,
        borderTopColor: colorsLightMode.gray,
        paddingVertical: 35,
    },
    titlesModal: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        justifyContent: 'space-between',
    },
    title: {
        ...typography.title,
        marginBottom: 35,
        flex: 1,
    },

    photoWrapper: {
        alignSelf: 'center',
        marginBottom: 35,
    },
    photoButton: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#2F5B9A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2E2E2E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    inputContainer: {
        marginBottom: 25,
    },

    label: {
        ...typography.subtitle,
        color: colorsLightMode.primary,
        marginBottom: 10,
    },

    input: {
        height: 55,
        borderWidth: 1,
        borderColor: colorsLightMode.gray,
        borderRadius: 8,
        ...typography.body,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },

    saveButton: {
        height: 55,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    saveText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});