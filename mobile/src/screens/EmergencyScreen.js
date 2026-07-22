
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import ContactCard from '../components/ContactCard.js';
import AddContactModal from '../components/AddContactModal.js';
import PlusCircleIcon from '../../assets/Plus circle.svg';
import { useState } from 'react';

export default function EmergencyScreen({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [contatos, setContatos] = useState([]);
    const [contatoEditando, setContatoEditando] = useState(null);

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
                    onClose={() => {
                        setModalVisible(false);
                        setContatoEditando(null);
                    }}
                    onSave={(novoContato) => {

                        if (contatoEditando) {
                            setContatos(
                                contatos.map(c =>
                                    c.id === novoContato.id
                                        ? novoContato
                                        : c
                                )
                            );
                        } else {
                            setContatos([
                                ...contatos,
                                novoContato
                            ]);
                        }

                        setModalVisible(false);
                        setContatoEditando(null);
                    }}
                />


                {
                    contatos.map((contato, index) => (
                        <ContactCard
                            key={index}
                            nome_contato={contato.nome}
                            telefone={contato.telefone}
                            foto={contato.foto}
                            onEdit={() => {
                                setContatoEditando(contato);
                                setModalVisible(true);
                            }}
                        />
                    ))
                }
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