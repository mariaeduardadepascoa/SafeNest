import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import ContactCard from '../components/ContactCard.js';
import AddContactModal from '../components/AddContactModal.js';
import PlusCircleIcon from '../../assets/Plus circle.svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { obterContatosEmergencia, criarContatoEmergencia, atualizarContatoEmergencia, deletarContatoEmergencia } from '../services/api';

export default function EmergencyScreen({ navigation }) {
    const { usuario } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [contatos, setContatos] = useState([]);
    const [contatoEditando, setContatoEditando] = useState(null);

    useEffect(() => {
        async function carregarContatos() {
            try {
                const dados = await obterContatosEmergencia(usuario.id_usuario);
                setContatos(dados.map(c => ({
                    id: c.id_contato,
                    nome: c.nome_contato,
                    telefone: c.telefone_contato,
                })));
            } catch (err) {
                Alert.alert('Erro', 'Não foi possível carregar os contatos de emergência.');
            }
        }
        if (usuario?.id) carregarContatos(); //checa se o usuario existe (ocorre quando o app abre antes do securestore checar ent evita trava)
    }, [usuario]); //roda toda vez que o usuario mudar

    // Cria um novo contato e salva um contato editado
    async function handleSave(novoContato) {
        try {
            if (contatoEditando) {
                const atualizado = await atualizarContatoEmergencia(
                    usuario.id_usuario, contatoEditando.id, novoContato.nome, novoContato.telefone
                );
                setContatos(contatos.map(c =>
                    c.id === contatoEditando.id
                        ? { id: atualizado.id_contato, nome: atualizado.nome_contato, telefone: atualizado.telefone_contato }
                        : c
                ));
            } else {
                const criado = await criarContatoEmergencia(
                    usuario.id_usuario, novoContato.nome, novoContato.telefone
                );
                setContatos([...contatos, {
                    id: criado.id_contato, nome: criado.nome_contato, telefone: criado.telefone_contato
                }]);
            }
            setModalVisible(false);
            setContatoEditando(null);
        } catch (err) {
            Alert.alert('Erro', err.message);
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
                />

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
    }
});