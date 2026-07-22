import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { colorsLightMode, typography } from '../theme';
import Locker from '../../assets/Locker.svg'


const LockButton = () => {
    return (
        <View style={styles.containerLock}>
            <Locker
                width={70}
                height={70}
                color="#d10f15" 
            />
            <View  style={styles.containerbutton}>
                < TouchableOpacity>
                     <Text style={styles.text}>Abrir</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                     <Text style={styles.text}>Cadastrar Tag</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                     <Text style={styles.text}>Travar fechadura</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerLock: {
        flex: 1,
        flexDirection: 'row',
        height: 140,
        padding:5,
        borderRadius: 16,
        backgroundColor: colorsLightMode.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    containerbutton:{
        flex: 1,
        flexDirection: 'column',
        
        alignItems:'space-between',
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default LockButton;