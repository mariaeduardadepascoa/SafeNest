import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { colorsLightMode, typography } from '../theme';
import Locker from '../../assets/Locker.svg'
import { abrirFechadura } from '../services/api'

const LockButton = ({ id_fechadura }) => {
    return (
        <View style={styles.container}>
            <View style={styles.titlesView}>
                <View style={styles.containerIcon}>
                    <Locker
                        width={40}
                        height={40}
                        color={colorsLightMode.white}
                    />
                </View>
                <View style={styles.titles}>
                    <Text style={styles.title}>Fechadura - entrada</Text>
                    <Text style={styles.status}>Online</Text>
                </View>
            </View>
            <View style={styles.content}>
                <TouchableOpacity style={styles.principalButton} onPress={() => abrirFechadura(id_fechadura)}>
                    <Text style={styles.text1}>Abrir</Text>
                </TouchableOpacity>
                {/* mandar o id usuario junto com o cadastrar tag -- fazer  */}
                <TouchableOpacity style={styles.tagButton} onPress={() => cadastrarTag(id_fechadura)}>
                    <Text style={styles.text2}>Cadastrar Tag</Text>
                </TouchableOpacity>
                {/* o bota de travar fechadura pode operar com o endpoint travarFechadura(id_fechadura) */}
                <TouchableOpacity style={styles.travarButton} onPress={() => travarFechadura(id_fechadura)}>
                    <Text style={styles.text3}>Travar fechadura</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 210,
        width: 320,
        justifyContent: 'center',
        alignItems: 'center',


        borderRadius: 20,
        backgroundColor: colorsLightMode.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    titlesView: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 1,
        flexDirection: 'column',

        alignItems: 'space-between',
    },
    principalButton: {
        width: 280,
        height: 55,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,

        justifyContent: 'center',
        alignItems: 'center',
    },
    tagButton: {
        width: 280,
        height: 40,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.primary,
        borderWidth: 2,
        borderRadius: 10,
        
        justifyContent: 'center',
        alignItems: 'center',
    },
    travarButton: {
        width: 280,
        height: 40,
        backgroundColor: colorsLightMode.lightBlue,
        borderRadius: 10,

        justifyContent: 'center',
        alignItems: 'center',
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
});

export default LockButton;