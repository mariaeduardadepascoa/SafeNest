import { StyleSheet, Text, View, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import ContactCard from '../components/ContactCard.js';
import AddContactModal from '../components/AddContactModal.js';
import PlusCircleIcon from '../../assets/Plus circle.svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { obterContatosEmergencia, criarContatoEmergencia, atualizarContatoEmergencia, deletarContatoEmergencia } from '../services/api';
import { getFotosLocais, salvarFotoLocal, removerFotoLocal } from '../services/fotosLocais';

export default function EmergencyScreen({ navigation }) {
    const { usuario } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [contatos, setContatos] = useState([]);
    const [contatoEditando, setContatoEditando] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {

        async function carregarContatos() {
            try {
                setCarregando(true);
                const dados = await obterContatosEmergencia(usuario.id_usuario);
                const fotosLocais = await getFotosLocais();
                setContatos(dados.map(c => ({
                    id: c.id_contato,
                    nome: c.nome_contato,
                    telefone: c.telefone_contato,
                    foto: fotosLocais[c.id_contato] || null,
                })));
            } catch (err) {
                Alert.alert('Erro', 'Não foi possível carregar os contatos de emergência.');
            } finally {
                setCarregando(false);
            }
        }

        if (usuario?.id_usuario) {
            carregarContatos();
        } else {
            setCarregando(false);
        }
    }, [usuario]);

    // Cria um novo contato e salva um contato editado

    async function handleSave(novoContato) {
        setSalvando(true);
        try {
            if (contatoEditando) {
                const atualizado = await atualizarContatoEmergencia(
                    usuario.id_usuario, contatoEditando.id, novoContato.nome, novoContato.telefone
                );
                await salvarFotoLocal(atualizado.id_contato, novoContato.foto);
                setContatos(contatos.map(c =>
                    c.id === contatoEditando.id
                        ? { id: atualizado.id_contato, nome: atualizado.nome_contato, telefone: atualizado.telefone_contato, foto: novoContato.foto }
                        : c
                ));
            } else {
                const criado = await criarContatoEmergencia(
                    usuario.id_usuario, novoContato.nome, novoContato.telefone
                );
                await salvarFotoLocal(criado.id_contato, novoContato.foto);
                setContatos([...contatos, {
                    id: criado.id_contato, nome: criado.nome_contato, telefone: criado.telefone_contato, foto: novoContato.foto
                }]);
            }
            setModalVisible(false);
            setContatoEditando(null);
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setSalvando(false);
        }
    }

    // deleta contato
    async function handleDelete(contato) {
        Alert.alert(
            'Excluir contato',
            `Tem certeza que deseja excluir ${contato.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletarContatoEmergencia(usuario.id_usuario, contato.id);
                            await removerFotoLocal(contato.id);
                            setContatos(contatos.filter(c => c.id !== contato.id));
                        } catch (err) {
                            Alert.alert('Erro', err.message);
                        }
                    },
                },
            ]
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerTitlesPage}>
                <Text style={styles.titlePage}>Emergência</Text>
                <Text style={styles.subtitlePage}>Em caso de emergências, contate-os.</Text>
            </View>
            <View style={styles.contentArea}>
                <View style={styles.titlesTop}>
                    <Text style={styles.title}>CONTATOS DE EMERGÊNCIA</Text>
                    <Pressable onPress={() => { setContatoEditando(null); setModalVisible(true); }}>
                        <PlusCircleIcon width={28} height={28} />
                    </Pressable>
                </View>

                <AddContactModal
                    visible={modalVisible}
                    contato={contatoEditando}
                    onClose={() => { setModalVisible(false); setContatoEditando(null); }}
                    onSave={handleSave}
                    salvando={salvando}
                />

                {carregando ? (
                    <View style={styles.centeredMessage}>
                        <ActivityIndicator size="large" color={colorsLightMode.primary} />
                    </View>
                ) : contatos.length === 0 ? (
                    <View style={styles.centeredMessage}>
                        <Text style={styles.emptyText}>Você não tem nenhum contato de emergência adicionado ainda.</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        // showsVerticalScrollIndicator={false}
                        indicatorStyle="black"
                    >
                        {contatos.map((contato) => (
                            <ContactCard
                                key={contato.id}
                                nome_contato={contato.nome}
                                telefone={contato.telefone}
                                foto={contato.foto}
                                onEdit={() => { setContatoEditando(contato); setModalVisible(true); }}
                                onDelete={() => handleDelete(contato)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    containerTitlesPage: {
        justifyContent: 'flex-start',
        width: '100%',
        paddingLeft: 10,
    },
    titlePage: {
        ...typography.title,
        color: colorsLightMode.black,
    },
    subtitlePage: {
        ...typography.subtitle,
        color: colorsLightMode.subtitles,
        paddingLeft: 10,
    },
    contentArea: {
        flex: 1,
        width: '90%',
        justifyContent: 'flex-start',
        paddingTop: 50,
        alignSelf: 'center',
    },
    titlesTop: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    title: {
        ...typography.caption,
        color: colorsLightMode.primary,
    },
    scrollArea: {
        flex: 1,
        marginTop: 8,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    emptyText: {
        ...typography.body,
        color: colorsLightMode.subtitles,
        textAlign: 'center',
    },
});