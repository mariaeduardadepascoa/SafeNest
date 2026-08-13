import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colorsLightMode, colorsBlackMode, typography } from '../theme';
import LogoSafeNest from '../../assets/logoSafeNestescrita.svg';

// aqui
import { useState } from 'react';
import { Checkbox } from 'expo-checkbox';

export default function CameraScreen({ navigation }) {


    const [isChecked, setChecked] = useState(false);

    return (
        <View style={styles.container1}>
            <View style={styles.mainContent}>
                <View style={styles.box}>
                    <Text style={styles.title}>SSID (coloca um nome melhor aqui pro usuario entender)</Text>
                    <TextInput
                        style={styles.inputs}
                        placeholder="colocar placeholder se der"
                        placeholderTextColor={colorsLightMode.subtitles}
                    />
                </View>

                <View style={styles.box}>
                    <Text style={styles.title}>Senha</Text>
                    <TextInput
                        style={styles.inputs}
                        placeholder="Digite aqui a senha da sua internet (?)"
                        placeholderTextColor={colorsLightMode.subtitles}
                    />
                </View>


                <View style={styles.showPassword}>
                    <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} color={isChecked ? colorsLightMode.primary : undefined} />
                    <Text style={styles.titleShowPassword}>Mostrar senha</Text>
                </View>
                <View style={styles.line}></View>
                <View style={styles.box}>
                    <Text style={styles.grayTitle}>ID</Text>
                    <TextInput
                        style={styles.grayInput}
                        editable={false}
                        selectTextOnFocus={false}
                    />
                </View>
            </View>


            <View style={styles.buttons}>
                <TouchableOpacity style={styles.mainButton} >
                    <Text style={styles.titleButton}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reloadButton} >
                    <Text style={styles.titleReloadButton}>Reiniciar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },



    // A PARTIR DAQUI ----------------------------------
    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    title: {
        ...typography.regularText,
        color: colorsLightMode.black,
        textAlign: 'left',
    },
    titleShowPassword: {
        ...typography.regularText,
        color: colorsLightMode.black,
    },
    grayTitle: {
        ...typography.caption,
        color: colorsLightMode.darkGray,
        textAlign: 'left',
    },
    inputs: {
        width: 300,
        height: 50,
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        borderColor: colorsLightMode.primary,
        borderWidth: 2,
        paddingLeft: 20,
    },
    grayInput: {
        width: 300,
        height: 50,
        backgroundColor: colorsLightMode.gray,
        borderRadius: 10,
        borderColor: colorsLightMode.darkGray,
        borderWidth: 2,
        paddingLeft: 20,
    },
    mainContent: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '85%',
        gap: 22,
    },
    box: {
        gap: 15,
    },
    showPassword: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 5,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.primary,
    },
    line: {
        backgroundColor: colorsLightMode.gray,
        width: 300,
        height: 2,
        marginVertical: 5,
    },
    buttons: {
        gap: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainButton: {
        backgroundColor: colorsLightMode.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 65,
        borderRadius: 20,
    },
    titleButton: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.white,
    },
    reloadButton: {
        borderWidth: 2,
        backgroundColor: colorsLightMode.white,
        borderColor: colorsLightMode.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 65,
        borderRadius: 20,
    },
    titleReloadButton: {
        ...typography.boldTitlesForButtons,
        color: colorsLightMode.primary,
    },
});