import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import { Linking, Alert } from 'react-native';
import EditIcon from '../../assets/Edit.svg';
import PhoneCallIcon from '../../assets/Phone call.svg';
import DeleteIcon from '../../assets/delete.svg';

export default function ContactCard({ nome_contato, telefone, foto, onEdit, onDelete }) {
    const primeiraLetra = nome_contato ? nome_contato.charAt(0).toUpperCase() : '?';

    async function ligacao(telefone) {
        const numeroLimpo = telefone.replace(/[^0-9+]/g, ''); // remove qualquer caractere que não seja um número (parênteses, traços e espaços)

        try {
            await Linking.openURL(`tel:${numeroLimpo}`);
        } catch (err) {
            console.log('erro real:', err);
            Alert.alert('Erro', 'Não foi possível realizar a ligação.');
        }
    }
    return (

        <View style={styles.contatos}>
            <View style={styles.card}>

                <View style={styles.infoContato}>
                    <View style={styles.contatoFoto}>{foto ? (<Image source={{ uri: foto }} style={styles.foto} />) : (<Text style={styles.letraContato}>{primeiraLetra}</Text>)}
                    </View>
                    <Text style={styles.nomeContato} numberOfLines={1} ellipsizeMode="tail">{nome_contato}</Text>
                </View>

                <View style={styles.botoesContato}>
                    <Pressable style={styles.editContato} onPress={onEdit}>
                        <EditIcon width={12} height={12} />
                    </Pressable>
                    <Pressable style={styles.deleteContato} onPress={onDelete}>
                        <DeleteIcon width={16} height={16} />
                    </Pressable>
                    <Pressable style={styles.callContato} onPress={() => ligacao(telefone)}>
                        <PhoneCallIcon width={20} height={20} />
                        <Text style={styles.ligarText}>Ligar</Text>
                    </Pressable>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contatos: {
        alignItems: 'center',
        paddingTop: 24,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        height: 74,
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colorsLightMode.gray,
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        gap: 8,
    },
    infoContato: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'flex-start',
        flexShrink: 1,
        flexGrow: 1,
        gap: 10,
    },
    contatoFoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colorsLightMode.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0, //faz o elemento diminuir
    },
    foto: {
        width: '100%',
        height: '100%',
    },
    letraContato: {
        ...typography.title,
        color: colorsLightMode.white,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nomeContato: {
        ...typography.caption,
        flexShrink: 1,
    },
    botoesContato: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    editContato: {
        borderRadius: '100%',
        backgroundColor: colorsLightMode.lightBlue,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteContato: {
        borderRadius: '100%',
        backgroundColor: colorsLightMode.danger,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    callContato: {
        width: 80,
        height: 40,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        justifyContent: 'space-around',
        paddingHorizontal: 6,
        alignItems: 'center',
        flexDirection: 'row',
        flexShrink: 0,
    },
    ligarText: {
        ...typography.body,
        color: colorsLightMode.white,
    },
});