import { StyleSheet, Text, View, TouchableOpacity, Switch, Modal, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useScreenStyles } from '../design/useScreenStyles';
import React, { useState, useRef, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colorsLightMode, typography } from '../theme';
import { abrirFechadura, statusFechadura, travarFechadura, destravarFechadura, excluirFechadura, cadastrarTag as cadastrarTagApi } from '../services/api';
import Locker from '../../assets/Locker.svg';
import LockIcon from '../../assets/Lock.svg';
import UnlockIcon from '../../assets/UnlockIconWhite.svg';
import TagIcon from '../../assets/Credit card.svg';
import TrashRedIcon from '../../assets/icon.svg';
import personIcon from '../../assets/personWhiteIcon.svg';
import { obterAccessToken } from '../services/tokenStorage';

const LockButton = ({ id_fechadura }) => {
    const navigation = useNavigation();
    const styles = useScreenStyles(legacyStyles, 'LockButton');
    const [travado, setTravado] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [tagModalVisible, setTagModalVisible] = useState(false);
    const [nomeDono, setNomeDono] = useState('');
    const [statusConhecido, setStatusConhecido] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [carregandoStatus, setCarregandoStatus] = useState(true);
    const [erroStatus, setErroStatus] = useState('');

    // trava independente pra cada ação, pra não deixar toques acumularem
    const [carregandoAbrir, setCarregandoAbrir] = useState(false);
    const [carregandoTravar, setCarregandoTravar] = useState(false);
    const [carregandoTag, setCarregandoTag] = useState(false);

    // ref pra checagem síncrona imediata (o state do React só atualiza no próximo render)
    const acaoEmAndamento = useRef(false);

    // Consulta novamente ao voltar para a tela ou tocar em Atualizar estado.
    useFocusEffect(useCallback(() => {
        let telaAtiva = true;
        const carregarStatus = async () => {
            setCarregandoStatus(true);
            setStatusConhecido(false);
            setErroStatus('');
            try {
                const blocked = await statusFechadura();
                if (telaAtiva) {
                    setTravado(blocked);
                    setStatusConhecido(true);
                }
            } catch (error) {
                if (telaAtiva) {
                    setStatusConhecido(false);
                    setErroStatus('Não foi possível consultar a fechadura. Tente atualizar o estado.');
                }
            } finally {
                if (telaAtiva) setCarregandoStatus(false);
            }
        };
        carregarStatus();
        return () => { telaAtiva = false; };
    }, [refresh]));

    const abrirMenu = () => setMenuVisible(true);

    const handleExcluir = () => {
        setMenuVisible(false);
        Alert.alert('Remover fechadura?', 'O vínculo será removido da sua conta.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: async () => {
                try { await excluirFechadura(); setStatusConhecido(false); }
                catch (error) { Alert.alert('Erro ao remover', error.message); }
            } },
        ]);
    };

    const handleAbrir = async () => {
        if (acaoEmAndamento.current) return; // ignora toque se já tem algo rodando
        acaoEmAndamento.current = true;
        setCarregandoAbrir(true);
        try {
            await abrirFechadura(id_fechadura);
            Alert.alert('Comando enviado', 'O pedido de abertura foi enviado à fechadura.');
            setRefresh(valor => valor + 1);
        } catch (error) {
            Alert.alert('Erro ao abrir', error.message);
            console.error("Erro ao abrir fechadura:", error);
        } finally {
            setCarregandoAbrir(false);
            acaoEmAndamento.current = false;
        }
    };

    const handleToggleTravar = async (value) => {
        if (acaoEmAndamento.current) return;
        acaoEmAndamento.current = true;
        setCarregandoTravar(true);
        setTravado(value); // feedback visual imediato

        try {
            if (value) {
                await travarFechadura(id_fechadura);
            } else {
                await destravarFechadura(id_fechadura);
            }
            const blockedAtual = await statusFechadura();
            setTravado(blockedAtual);
            setStatusConhecido(true);
        } catch (error) {
            Alert.alert('Erro ao alterar acesso', error.message);
            console.error(error);
            try {
                const blockedAtual = await statusFechadura();
                setTravado(blockedAtual);
                setStatusConhecido(true);
            } catch {
                setStatusConhecido(false);
                setErroStatus('Estado indisponível. Atualize antes de enviar outro comando.');
            }
        } finally {
            setCarregandoTravar(false);
            acaoEmAndamento.current = false;
        }
    };

    const handleSalvarTag = async () => {
        if (!nomeDono.trim() || carregandoTag) return;
        setCarregandoTag(true);
        try {
            await cadastrarTagApi(nomeDono);
            setNomeDono('');
            setTagModalVisible(false);
        } catch (error) {
            Alert.alert('Erro ao cadastrar tag', error.message);
            console.error(error);
        } finally {
            setCarregandoTag(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titlesView}>
                <View style={styles.headerLeft}>
                    <View style={styles.containerIcon}>
                        <Locker width={30} height={30} color={colorsLightMode.white} />
                    </View>
                    <View style={styles.titles}>
                        <Text style={styles.title}>Fechadura - entrada</Text>
                        <Text style={styles.status} accessibilityLiveRegion="polite">{carregandoStatus ? 'Consultando estado…' : statusConhecido ? (travado ? 'Acesso bloqueado' : 'Acesso liberado') : 'Estado indisponível'}</Text>
                    </View>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Opções da fechadura" hitSlop={12} onPress={abrirMenu}>
                    <Text style={styles.menuDots}>⋮</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.principalButton, carregandoAbrir && styles.buttonDisabled]}
                    onPress={handleAbrir}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir fechadura"
                    disabled={carregandoAbrir || !statusConhecido}
                >
                    {carregandoAbrir ? (
                        <ActivityIndicator color={colorsLightMode.white} />
                    ) : (
                        <>
                            <UnlockIcon width={20} height={20} />
                            <Text style={styles.text1}>Abrir</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tagButton, carregandoTag && styles.buttonDisabled]}
                    onPress={() => setTagModalVisible(true)}
                    accessibilityRole="button"
                    disabled={carregandoTag || !statusConhecido}
                >
                    <TagIcon width={18} height={18} />
                    <Text style={styles.text2}>Cadastrar Tag</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.tagButton, { minHeight: 56, height: undefined, paddingVertical: 12 }]}
                    accessibilityRole="button" accessibilityLabel="Editar ou remover tags de acesso"
                    onPress={() => navigation.navigate('Tags')}>
                    <Text style={styles.text2}>Editar ou remover tags</Text>
                </TouchableOpacity>

                <View style={styles.travarButton}>
                    <View style={styles.travarButtonTexts}>
                        <LockIcon width={18} height={18} />
                        <Text style={styles.text3}>Travar</Text>
                    </View>
                    {carregandoTravar || carregandoStatus ? (
                        <ActivityIndicator color={colorsLightMode.primary} />
                    ) : (
                        <Switch
                            accessibilityLabel="Bloquear acesso pela fechadura"
                            value={travado}
                            onValueChange={handleToggleTravar}
                            disabled={carregandoTravar || !statusConhecido}
                            trackColor={{ false: colorsLightMode.primary, true: colorsLightMode.primary }}
                            thumbColor={colorsLightMode.white}
                        />
                    )}
                </View>
                {!!erroStatus && <Text accessibilityRole="alert" style={{ color: colorsLightMode.danger }}>{erroStatus}</Text>}
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: carregandoStatus || carregandoAbrir || carregandoTravar || carregandoTag, busy: carregandoStatus }}
                    disabled={carregandoStatus || carregandoAbrir || carregandoTravar || carregandoTag}
                    onPress={() => setRefresh(v => v + 1)} style={[styles.tagButton, { minHeight: 56, height: undefined, paddingVertical: 12 }]}>
                    <Text style={styles.text2}>{carregandoStatus ? 'Atualizando…' : 'Atualizar estado'}</Text>
                </TouchableOpacity>
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
                            accessibilityLabel="Nome do dono da tag"
                            style={styles.tagInput}
                            placeholder="Nome do dono da tag"
                            placeholderTextColor={colorsLightMode.darkGray}
                            value={nomeDono}
                            onChangeText={(texto) => {
                                setNomeDono(texto);
                            }}
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


const legacyStyles = StyleSheet.create({
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
