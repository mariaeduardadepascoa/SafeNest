import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { colorsLightMode, typography } from '../theme';
import React from 'react'
import PlusIcon from '../../assets/add_30dp_FFFFFF_FILL0_wght600_GRAD0_opsz24.svg';


const AddLockButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cornerDot} />
      <View style={styles.circle}>
        <PlusIcon />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>Adicionar Fechadura</Text>
        <Text style={styles.subtitle}>Conecte sua fechadura</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,

    backgroundColor: colorsLightMode.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colorsLightMode.primary,
  },
  circle: {
    backgroundColor: colorsLightMode.primary,
    height: 45,
    width: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texts: {
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  title: {
    ...typography.boldTitlesForButtons,
    color: colorsLightMode.primary,
  },
  subtitle: {
    ...typography.body,
    color: colorsLightMode.black,
  },
  cornerDot: {
    position: 'absolute',
    top: -8,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: colorsLightMode.primary,
  },
});

export default AddLockButton;