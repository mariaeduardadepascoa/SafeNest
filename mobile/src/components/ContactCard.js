import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import EditIcon from '../../assets/Edit.svg';
import PhoneCallIcon from '../../assets/Phone call.svg';

export default function ContactCard({ nome_contato, telefone, foto, onEdit }) {
    const primeiraLetra = nome_contato ? nome_contato.charAt(0).toUpperCase() : '?';
    return (

        <View style={styles.contatos}>
            <View style={styles.card}>
                <View style={styles.contatoFoto}>
                    {foto ? (
                        <Image
                            source={{ uri: foto }}
                            style={styles.foto}
                        />
                    ) : (
                        <Text style={styles.letraContato}>
                            {primeiraLetra}
                        </Text>
                    )}
                </View>
                <Text style={styles.nomeContato}>{nome_contato}</Text>
                <Pressable style={styles.editContato} onPress={onEdit}>
                    <EditIcon width={16} height={16} />
                </Pressable>
                <View style={styles.callContato}>
                    <PhoneCallIcon width={20} height={20} />
                    <Text style={styles.ligarText}>Ligar</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contatos: {
        alignItems: 'center',
        paddingTop: 25,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        height: 70,
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colorsLightMode.gray,
        justifyContent: 'space-around',
    },
    contatoFoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colorsLightMode.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
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
    },
    editContato: {
        borderRadius: '100%',
        backgroundColor: colorsLightMode.lightBlue,
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
        flexDirection: 'row'
    },
    ligarText: {
        ...typography.body,
        color: colorsLightMode.white,
    },
});