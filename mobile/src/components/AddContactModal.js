import { View, Text, StyleSheet, Modal, TextInput, Pressable } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import PersonWhiteIcon from '../../assets/personWhiteIcon.svg';
import { useEffect, useState } from 'react';

export default function AddContactModal({ visible, onClose, onSave, contato }) {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');

    useEffect(() => {
        if (visible) {
            setNome(contato?.nome || '');
            setTelefone(contato?.telefone || '');
        }
    }, [visible, contato]);

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

                    <Pressable style={styles.photoButton}>
                        <PersonWhiteIcon width={80} height={80} />
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
                        style={styles.saveButton}
                        onPress={() => {
                            onSave({
                                id: contato?.id || Date.now().toString(),
                                nome,
                                telefone,
                                foto: contato?.foto || null
                            });

                            setNome('');
                            setTelefone('');
                        }}
                    >
                        <Text style={styles.saveText}>
                            {
                                contato
                                    ? 'Salvar alterações'
                                    : 'Salvar contato'
                            }
                        </Text>
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

    photoButton: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#2F5B9A',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 35,
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
        // paddingHorizontal: 15,
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