// TODAS OS BOTOES, TEXTOS, TITULOS E ETC DA VERSAO NROMAL

import React from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesign } from './DesignProvider';

export function Txt({ children, muted, size = 14, weight = '400', style, ...props }) {
  const { c, prefs } = useDesign();
  const fontSize = prefs.adapted ? Math.max(size, 16) : size;
  return <Text {...props} style={[{ color: muted ? c.muted : c.text, fontSize, lineHeight: fontSize * 1.5, fontWeight: weight }, style]}>{children}</Text>;
}
export function Icon({ name, size = 20, color }) {
  const { c } = useDesign();
  return <Feather name={name} size={size} color={color || c.accent} accessibilityElementsHidden importantForAccessibility="no" />;
}
export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}
export function Card({ children, style }) {
  const { c } = useDesign();
  return <View style={[{ padding: 18, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }, style]}>{children}</View>;
}
export function Button({ title, onPress, secondary, destructive, disabled, busy, accessibilityHint }) {
  const { c, prefs } = useDesign();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ minHeight: prefs.adapted ? 60 : 50, padding: 14, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center', backgroundColor: destructive ? c.red : secondary ? c.raised : c.accent,
      opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
    {busy ? <ActivityIndicator color={secondary ? c.accent : '#FFFFFF'} /> : <Txt weight="600" style={{ color: secondary ? c.text : '#FFFFFF' }}>{title}</Txt>}
  </Pressable>;
}
export function Heading({ title, action, onPress }) {
  return <Row style={{ justifyContent: 'space-between', marginTop: 26, marginBottom: 14, flexWrap: 'wrap' }}>
    <Txt accessibilityRole="header" size={18} weight="600">{title}</Txt>
    {action && <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Txt muted size={12}>{action}</Txt></Pressable>}
  </Row>;
}
export function PageTitle({ eyebrow, title, subtitle }) {
  return <View style={{ marginBottom: 24, gap: 6 }}>
    {eyebrow && <Txt muted size={11} weight="600">{eyebrow}</Txt>}
    <Txt accessibilityRole="header" size={30} weight="600" style={{ letterSpacing: -0.8 }}>{title}</Txt>
    {subtitle && <Txt muted size={13}>{subtitle}</Txt>}
  </View>;
}
export function Brand() {
  return <Image source={require('../../assets/safenest-design-logo.png')} resizeMode="contain" accessibilityLabel="SafeNest" style={{ width: 176, height: 58 }} />;
}
export function Screen({ children, navigation, back, scroll = true }) {
  const { c } = useDesign();
  const content = <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 }}>{children}</View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.bg }}>
    <Row style={{ paddingHorizontal: 22, paddingVertical: 12, justifyContent: 'space-between' }}>
      <Brand />
      <Pressable accessibilityRole="button" accessibilityLabel={back ? 'Voltar' : 'Abrir configurações'}
        onPress={() => back ? navigation.goBack() : navigation.navigate('Configurações')}
        style={{ minWidth: 44, minHeight: 44, borderRadius: 22, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={back ? 'arrow-left' : 'user'} />
      </Pressable>
    </Row>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : <View style={{ flex: 1 }}>{children}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
