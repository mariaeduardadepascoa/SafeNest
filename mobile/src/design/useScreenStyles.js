// aplica os designs de acordo com a versao

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from './DesignProvider';


export function useScreenStyles(original, screen) {

  const { c, prefs } = useDesign();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const telaDeAutenticacao = /Login|Register|Password/.test(screen);
    if (prefs.adapted && !prefs.colorVision && !telaDeAutenticacao) return original;

    const result = {};

    const palette = prefs.adapted ? { '#D54144': c.red, '#EA8C2F': '#926018' } : {
      '#2B5081': c.accent, '#F8FAFC': c.bg, '#252525': c.text, '#1E1E1E': c.text,
      '#848484': c.muted, '#BABABB': c.muted, '#E2E2E2': c.line, '#C2D1E4': c.raised,
      '#D54144': c.red, '#EA8C2F': '#926018',
    };


    for (const [key, value] of Object.entries(original)) {

      result[key] = { ...StyleSheet.flatten(value) };

      for (const prop of ['color', 'backgroundColor', 'borderColor']) {
        if (palette[result[key][prop]]) result[key][prop] = palette[result[key][prop]];

      }

      if (!prefs.adapted && result[key].textAlign === 'flex-start') result[key].textAlign = 'left';
    }

    const override = (key, value) => { if (result[key]) result[key] = { ...result[key], ...value }; };

    // Somente as telas de entrada do modo acessível recebem estes ajustes.
    if (prefs.adapted) {
      if (!telaDeAutenticacao) return result;

      override('container', { flex: 0, width: '100%', paddingTop: 0, alignItems: 'stretch', justifyContent: 'flex-start', gap: 24 });
      for (const key of ['mainTexts', 'contentArea', 'authContainer', 'authSubContainer', 'inputs', 'input', 'progressBarContainer', 'ageTitleRow', 'radioOption', 'infoCard', 'codeContainer', 'header']) {
        override(key, { width: '100%' });
      }

      override('mainTexts', { paddingBottom: 0, gap: 10 });
      override('contentArea', { minHeight: 0, alignItems: 'stretch' });
      override('authContainer', { alignItems: 'stretch', gap: 24, paddingBottom: 0 });
      override('authSubContainer', { gap: 10 });
      override('title', { fontSize: 28, lineHeight: 38, color: '#111111', textAlign: 'left' });
      override('subtitle', { fontSize: 18, lineHeight: 28, color: '#404040', textAlign: 'left' });
      override('caption', { width: '100%', fontSize: 18, lineHeight: 28, color: '#111111', textAlign: 'left' });
      override('caption2', { fontSize: 18, lineHeight: 28, textDecorationLine: 'underline', textAlign: 'left' });
      override('inputs', { minHeight: 64, height: undefined, borderColor: '#64748B', paddingHorizontal: 14 });
      for (const key of ['textInput', 'textSubContainer']) {
        override(key, { minWidth: 0, minHeight: 60, height: undefined, paddingVertical: 12, fontSize: 20, lineHeight: 30, color: '#000000' });
      }
      override('input', { height: undefined, minHeight: 64, paddingVertical: 16, paddingHorizontal: 16 });
      override('text', { fontSize: 20, lineHeight: 30, fontWeight: '600', textAlign: 'center' });
      override('titlesInputPassword', { flexDirection: 'column', alignItems: 'flex-start', gap: 4 });
      override('forgotPassword', { fontSize: 18, lineHeight: 28, minHeight: 48, paddingVertical: 10, textDecorationLine: 'underline' });
      override('codeContainer', { gap: 8, flexWrap: 'wrap' });
      override('codeBox', { flex: 1, width: undefined, minWidth: 44, height: undefined, minHeight: 64, paddingVertical: 12, fontSize: 24, color: '#000000', borderColor: '#64748B' });
      override('radioOption', { height: undefined, minHeight: 64, paddingVertical: 14, borderColor: '#64748B' });
      override('radioText', { fontSize: 18, lineHeight: 28, color: '#111111', flexShrink: 1 });
      override('radioTextSelected', { color: '#111111' });
      override('infoCardText', { fontSize: 18, lineHeight: 28, color: '#404040' });
      override('infoCardTextBold', { fontSize: 18, lineHeight: 28 });
      override('progressBarContainer', { paddingTop: 0, paddingBottom: 0 });
      override('backButton', { minWidth: 48, minHeight: 48 });
      result.visibilityButton = { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' };
      result.inputHint = { color: '#595959' };
      return result;
    }

    if (/Login|Register|Password/.test(screen)) {
      override('container', { backgroundColor: c.bg, paddingTop: 0, gap: 24, alignItems: 'stretch', justifyContent: 'flex-start' });

      for (const key of ['mainTexts', 'authContainer', 'authSubContainer', 'contentArea', 'inputs', 'input', 'ageTitleRow', 'radioOption', 'infoCard', 'codeContainer']) {
        override(key, { width: '100%' });
      }

      override('contentArea', { minHeight: 0 });
      override('mainTexts', { paddingBottom: 0 });
      override('authContainer', { alignItems: 'stretch', gap: 18 });
      override('title', { fontSize: 30, lineHeight: 38, letterSpacing: -0.8, textAlign: 'left' });
      override('subtitle', { fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: 'left' });
      override('caption', { fontSize: 14, lineHeight: 22, width: undefined });
      override('inputs', { minHeight: 54, height: 58, borderWidth: 1, borderRadius: 14 });
      override('input', { minHeight: 54, borderRadius: 14 });
      override('textInput', { fontSize: 16, color: c.text });
      override('textSubContainer', { fontSize: 16, color: c.text });

    }

    if (screen === 'HistoryScreen' || screen === 'EmergencyScreen') {
      override('container', { paddingTop: 0, backgroundColor: c.bg });
      override('containerTitlesPage', { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20 });
      override('titlePage', { fontSize: 30, lineHeight: 38, color: c.text, letterSpacing: -0.8 });
      override('subtitlePage', { fontSize: 13, lineHeight: 21, paddingLeft: 0, marginTop: 6, color: c.muted });
      override('contentArea', { width: '100%', paddingHorizontal: 22, paddingTop: 8 });
      override('titlesTop', { justifyContent: 'space-between' });
      override('dateHeader', { fontSize: 13, fontWeight: '600' });
      override('scrollContent', { paddingBottom: 32 });
    }

    if (screen === 'ActivitysCard') {
      override('card', { minHeight: 84, padding: 16, backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 20 });
      override('perigoCard', { backgroundColor: c.surface, borderWidth: 1, borderColor: c.red });
      override('negadoCard', { backgroundColor: c.surface, borderColor: c.red, borderWidth: 1 });
      override('normalText', { color: c.text, fontSize: 14 });
      override('negadoText', { color: c.red, fontSize: 14 });
      override('timeText', { color: c.muted, fontSize: 11, maxWidth: 90 });
      override('whiteContainerIcon', { backgroundColor: c.raised, borderRadius: 12, width: 40, height: 40 });
      override('redContainerIcon', { backgroundColor: c.raised, borderRadius: 12, width: 40, height: 40 });
    }

    if (screen === 'ContactCard') {
      override('contatos', { paddingTop: 12 });
      override('card', { width: '100%', height: undefined, minHeight: 112, borderRadius: 22, borderWidth: 1, padding: 16, flexWrap: 'wrap', gap: 14 });
      override('infoContato', { width: '100%' });
      override('nomeContato', { color: c.text, fontSize: 16 });
      override('botoesContato', { flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' });
    }
    
    for (const key of ['editContato', 'deleteContato', 'callContato', 'backButton', 'cancelButton', 'saveButton', 'closeButton']) {
      override(key, { minHeight: 44, minWidth: 44 });
    }

    return result;

  }, [original, screen, c.bg, c.accent, c.red, prefs.adapted, prefs.colorVision, insets.top]);
}
