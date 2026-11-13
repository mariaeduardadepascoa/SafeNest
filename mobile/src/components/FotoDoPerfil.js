import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFotoPerfil } from '../context/FotoPerfilContext';
import { useVisual } from '../design/DesignProvider';

export default function FotoDoPerfil({ tamanho = 48 }) {
  const { foto } = useFotoPerfil();
  const { c } = useVisual();
  const [imagemIndisponivel, setImagemIndisponivel] = useState(false);
  useEffect(() => { setImagemIndisponivel(false); }, [foto]);

  return <View style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2,
    overflow: 'hidden', backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}>
    {foto && !imagemIndisponivel ? <Image source={{ uri: foto }} accessibilityLabel="Sua foto de perfil"
      style={{ width: '100%', height: '100%' }} resizeMode="cover" onError={() => setImagemIndisponivel(true)} />
      : <Feather name="user" size={Math.round(tamanho * 0.45)} color={c.accent} accessibilityElementsHidden />}
  </View>;
}
