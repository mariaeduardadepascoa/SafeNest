import { StyleSheet, Text, View, TouchableOpacity, Switch, Modal, TextInput, Pressable } from 'react-native'
import React, { useState, useRef } from 'react'
import { colorsLightMode, typography } from '../theme';
import { abrirFechadura, excluirFechadura, cadastrarTag as cadastrarTagApi } from '../services/api';
import Locker from '../../assets/Locker.svg';
import LockIcon from '../../assets/Lock.svg';
import UnlockIcon from '../../assets/UnlockIconWhite.svg';
import TagIcon from '../../assets/Credit card.svg';
import TrashRedIcon from '../../assets/icon.svg';
import personIcon from '../../assets/personWhiteIcon.svg';


const LockButton = ({ id_fechadura }) => {
    const [travado, setTravado] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false); //popup de excluir fechadura
    const [tagModalVisible, setTagModalVisible] = useState(false); //modal de cadastro de tag
    const [nomeDono, setNomeDono] = useState('');

    // abrir popup de excluir fechadura
    const abrirMenu = () => {
        setMenuVisible(true);
    };

    // excluir fechadura
    const handleExcluir = () => {
        setMenuVisible(false);
        excluirFechadura(id_fechadura);
    };

    // salvar tag
    const handleSalvarTag = () => {
        if (!nomeDono.trim()) return; //se nao existir nome nao salva nada e interrompe
        cadastrarTagApi(id_fechadura, nomeDono);
        setNomeDono('');
        setTagModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.titlesView}>
                <View style={styles.headerLeft}>
                    <View style={styles.containerIcon}>
                        <Locker
                            width={30}
                            height={30}
                            color={colorsLightMode.white}
                        />
                    </View>
                    <View style={styles.titles}>
                        <Text style={styles.title}>Fechadura - entrada</Text>
                        <Text style={styles.status}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={abrirMenu}>
                    <Text style={styles.menuDots}>⋮</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.principalButton} onPress={() => abrirFechadura(id_fechadura)}>
                    <UnlockIcon
                        width={20}
                        height={20}
                    />
                    <Text style={styles.text1}>Abrir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tagButton} onPress={() => setTagModalVisible(true)}>
                    <TagIcon
                        width={18}
                        height={18}
                    />
                    <Text style={styles.text2}>Cadastrar Tag</Text>
                </TouchableOpacity>

                <View style={styles.travarButton}>
                    <View style={styles.travarButtonTexts}>
                        <LockIcon
                            width={18}
                            height={18}
                        />
                        <Text style={styles.text3}>Travar</Text>
                    </View>
                    <Switch
                        value={travado}
                        onValueChange={(value) => {
                            setTravado(value);
                            travarFechadura(id_fechadura);
                        }}
                        trackColor={{ false: colorsLightMode.primary, true: colorsLightMode.primary }}
                        thumbColor={colorsLightMode.white}
                    />
                </View>
            </View>

            {/* --- Popup do menu (3 pontinhos) -> Excluir fechadura --- */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuPopup}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleExcluir}>
                            <TrashRedIcon
                                width={20}
                                height={20}
                            />
                            <Text style={styles.menuItemText}>Excluir fechadura</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* --- Modal de cadastrar tag NFC --- */}
            <Modal
                visible={tagModalVisible}
                transparent //deixa o fundo visivel
                onRequestClose={() => setTagModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.tagModal}>
                        <Text style={styles.tagModalTitle}>Cadastrar tag NFC</Text>
                        <Text style={styles.tagModalSubtitle}>
                            Aproxime a tag do leitor de sua fechadura e informe o nome do dono.
                        </Text>

                        <TextInput
                            style={styles.tagInput}
                            placeholder="Nome do dono da tag"
                            placeholderTextColor={colorsLightMode.darkGray}
                            value={nomeDono}
                            onChangeText={setNomeDono}
                        />

                        <View style={styles.tagModalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => {
                                setNomeDono('');
                                setTagModalVisible(false);
                            }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSalvarTag}>
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: 320,
        padding: 16,
        gap: 14,

        borderRadius: 20,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.primary,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    titlesView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuDots: {
        ...typography.title,
        color: colorsLightMode.darkGray,
    },
    title: {
        ...typography.boldText,
        color: colorsLightMode.primary,
    },
    status: {
        ...typography.subtitle,
        color: colorsLightMode.lightBlueMobile,
    },
    containerIcon: {
        padding: 10,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
    },
    content: {
        flexDirection: 'column',
        gap: 10,
    },
    principalButton: {
        width: '100%',
        height: 60,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 10,

        justifyContent: 'center',
        alignItems: 'center',
    },
    tagButton: {
        width: '100%',
        height: 45,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.primary,
        borderWidth: 2,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 10,

        justifyContent: 'center',
        alignItems: 'center',
    },
    travarButton: {
        width: '100%',
        height: 45,
        backgroundColor: colorsLightMode.lightBlue,
        borderRadius: 10,
        paddingHorizontal: 14,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    travarButtonTexts: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    text1: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.white,
        textAlign: 'center',
    },
    text2: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.primary,
        textAlign: 'center',
    },
    text3: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.primary,
        textAlign: 'left',
    },
    menuOverlay: {
        flex: 1,
    },
    menuPopup: {
        position: 'absolute',
        top: 130,
        right: 30,
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemText: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.danger,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', //fundo da tela
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagModal: {
        width: '85%',
        backgroundColor: colorsLightMode.white,
        borderRadius: 20,
        borderColor: colorsLightMode.primary,
        borderWidth: 2,
        padding: 24,
        gap: 16,
    },
    tagModalTitle: {
        ...typography.title,
        fontSize: 22,
        color: colorsLightMode.black,
    },
    tagModalSubtitle: {
        ...typography.subtitle,
        color: colorsLightMode.black,
    },
    tagInput: {
        borderWidth: 1,
        borderColor: colorsLightMode.darkGray,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colorsLightMode.gray,
    },
    tagModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colorsLightMode.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.primary,
    },
    saveButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: colorsLightMode.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.white,
    },
});

export default LockButton;