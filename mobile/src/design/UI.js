// Textos, botões e estruturas compartilhadas pelos dois visuais.

import React from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisual } from './DesignProvider';
import FotoDoPerfil from '../components/FotoDoPerfil';

export function Texto({ children, muted, size = 14, weight = '400', style, ...props }) {
  const { c, prefs } = useVisual();
  const fontSize = prefs.adapted ? Math.max(size, 18) : size;
  return <Text {...props} style={[{ color: muted ? c.muted : c.text, fontSize, lineHeight: fontSize * 1.5, fontWeight: weight }, style]}>{children}</Text>;
}
export function Icone({ name, size = 20, color }) {
  const { c } = useVisual();
  return <Feather name={name} size={size} color={color || c.accent} accessibilityElementsHidden importantForAccessibility="no" />;
}
export function Linha({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}
export function Cartao({ children, style }) {
  const { c, prefs } = useVisual();
  return <View style={[{ padding: prefs.adapted ? 20 : 18, borderRadius: prefs.adapted ? 16 : 22, backgroundColor: c.surface, borderWidth: 1, borderColor: prefs.adapted ? c.muted : c.line }, style]}>{children}</View>;
}
export function Botao({ title, onPress, secondary, destructive, disabled, busy, accessibilityHint }) {
  const { c, prefs } = useVisual();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ minHeight: prefs.adapted ? 60 : 50, padding: 14, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center', backgroundColor: destructive ? c.red : secondary ? c.raised : c.accent,
      opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
    {busy ? <ActivityIndicator color={secondary ? c.accent : '#FFFFFF'} /> : <Texto weight="600" style={{ color: secondary ? c.text : '#FFFFFF' }}>{title}</Texto>}
  </Pressable>;
}
export function TituloSecao({ title, action, onPress }) {
  const { prefs } = useVisual();
  return <Linha style={{ justifyContent: 'space-between', marginTop: 26, marginBottom: 14, flexWrap: 'wrap' }}>
    <Texto accessibilityRole="header" size={prefs.adapted ? 22 : 18} weight="600">{title}</Texto>
    {action && <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Texto muted size={12}>{action}</Texto></Pressable>}
  </Linha>;
}
export function TituloPagina({ eyebrow, title, subtitle, style }) {
  const { prefs } = useVisual();
  return <View style={[{ marginBottom: 24, gap: 6 }, style]}>
    {eyebrow && !prefs.adapted && <Texto muted size={11} weight="600">{eyebrow}</Texto>}
    <Texto accessibilityRole="header" size={prefs.adapted ? 28 : 30} weight="600" style={{ letterSpacing: prefs.adapted ? 0 : -0.8 }}>{title}</Texto>
    {subtitle && <Texto muted size={prefs.adapted ? 18 : 13}>{subtitle}</Texto>}
  </View>;
}
export function Logo() {
  return <Image source={require('../../assets/safenest-design-logo.png')} resizeMode="contain" accessibilityLabel="SafeNest" style={{ width: 176, height: 58 }} />;
}
export function Cabecalho({ navigation, back = false }) {
  const { c, prefs } = useVisual();
  return <Linha style={{ width: '100%', flexShrink: 0, paddingHorizontal: 22, paddingVertical: 12, justifyContent: 'space-between' }}>
    <Logo />
    <Pressable accessibilityRole="button" accessibilityLabel={back ? 'Voltar' : 'Abrir configurações'}
      onPress={() => back ? navigation.goBack() : navigation.navigate('Configurações')}
      style={{ width: prefs.adapted ? 56 : 44, height: prefs.adapted ? 56 : 44, flexShrink: 0, borderRadius: prefs.adapted ? 28 : 22, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}>
      {back ? <Icone name="arrow-left" /> : <FotoDoPerfil tamanho={prefs.adapted ? 56 : 44} />}
    </Pressable>
  </Linha>;
}
export function Tela({ children, navigation, back, scroll = true }) {
  const { c, prefs } = useVisual();
  const insets = useSafeAreaInsets();
  const content = <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: prefs.adapted ? 120 + insets.bottom : 32 }}>{children}</View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.bg }}>
    <Cabecalho navigation={navigation} back={back} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : <View style={{ flex: 1 }}>{children}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
