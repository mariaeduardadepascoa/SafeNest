import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { colorsLightMode, typography } from '../theme';



const AddLockButton = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>Adicionar{'\n'}Fechadura</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 140,
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
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AddLockButton;