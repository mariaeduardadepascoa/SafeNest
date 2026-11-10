// aplica os designs de acordo com a versao

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisual } from './DesignProvider';


export function useEstilos(estilosOriginais, tela) {

  const { c, prefs } = useVisual();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const telaDeAutenticacao = /Login|Register|Password/.test(tela);
    const telaComLetrasMaiores = ['HomeScreen', 'HistoryScreen', 'EmergencyScreen'].includes(tela);
    if (prefs.adapted && !prefs.colorVision && !telaDeAutenticacao && !telaComLetrasMaiores) return estilosOriginais;

    const estilosNovos = {};

    const cores = {
      '#2B5081': c.accent, '#F8FAFC': c.bg, '#252525': c.text, '#1E1E1E': c.text,
      '#848484': c.muted, '#BABABB': c.muted, '#E2E2E2': c.line, '#C2D1E4': c.raised,
      '#D54144': c.red, '#E53E3E': c.red, '#EA8C2F': '#926018',
      '#64748B': c.muted, '#94A3B8': c.muted, '#CBD5E1': c.line, '#E2E8F0': c.line,
    };


    for (const [key, value] of Object.entries(estilosOriginais)) {

      estilosNovos[key] = { ...StyleSheet.flatten(value) };

      for (const prop of ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']) {
        if (cores[estilosNovos[key][prop]]) estilosNovos[key][prop] = cores[estilosNovos[key][prop]];

      }

      if (!prefs.adapted && estilosNovos[key].textAlign === 'flex-start') estilosNovos[key].textAlign = 'left';
    }

    const mudarEstilo = (key, value) => { if (estilosNovos[key]) estilosNovos[key] = { ...estilosNovos[key], ...value }; };

    // No modo acessível, aumenta os textos e as áreas de toque.
    if (prefs.adapted) {
      if (!telaDeAutenticacao) {
        if (telaComLetrasMaiores) {
          mudarEstilo('titles', { fontSize: 20, lineHeight: 28, color: c.text });
          mudarEstilo('contentContainer', { gap: 24 });
          mudarEstilo('title', { fontSize: 20, lineHeight: 28, color: c.text });
          mudarEstilo('emptyText', { fontSize: 18, lineHeight: 28, color: c.muted });
          mudarEstilo('dateHeader', { fontSize: 18, lineHeight: 28, color: c.text });
          mudarEstilo('spanVerMais', { fontSize: 18, lineHeight: 28, color: c.accent, textDecorationLine: 'underline' });
          mudarEstilo('pressables', { minHeight: 48 });
        }
        return estilosNovos;
      }

      const corDoTexto = prefs.colorVision ? c.text : '#111111';
      const corSecundaria = prefs.colorVision ? c.muted : '#404040';
      const corDoCampo = prefs.colorVision ? c.text : '#000000';
      const corDaBorda = prefs.colorVision ? c.line : '#64748B';

      mudarEstilo('container', { flex: 0, width: '100%', paddingTop: 0, alignItems: 'stretch', justifyContent: 'flex-start', gap: 24 });
      for (const key of ['mainTexts', 'contentArea', 'authContainer', 'authSubContainer', 'inputs', 'input', 'progressBarContainer', 'ageTitleRow', 'radioOption', 'infoCard', 'codeContainer', 'header']) {
        mudarEstilo(key, { width: '100%' });
      }

      mudarEstilo('mainTexts', { paddingBottom: 0, gap: 10 });
      mudarEstilo('contentArea', { minHeight: 0, alignItems: 'stretch' });
      mudarEstilo('authContainer', { alignItems: 'stretch', gap: 24, paddingBottom: 0 });
      mudarEstilo('authSubContainer', { gap: 10 });
      mudarEstilo('title', { fontSize: 28, lineHeight: 38, color: corDoTexto, textAlign: 'left' });
      mudarEstilo('subtitle', { fontSize: 18, lineHeight: 28, color: corSecundaria, textAlign: 'left' });
      mudarEstilo('caption', { width: '100%', fontSize: 18, lineHeight: 28, color: corDoTexto, textAlign: 'left' });
      mudarEstilo('caption2', { fontSize: 18, lineHeight: 28, textDecorationLine: 'underline', textAlign: 'left' });
      mudarEstilo('inputs', { minHeight: 64, height: undefined, borderColor: corDaBorda, paddingHorizontal: 14 });
      for (const key of ['textInput', 'textSubContainer']) {
        mudarEstilo(key, { minWidth: 0, minHeight: 60, height: undefined, paddingVertical: 12, fontSize: 20, lineHeight: 30, color: corDoCampo });
      }
      mudarEstilo('input', { height: undefined, minHeight: 64, paddingVertical: 16, paddingHorizontal: 16 });
      mudarEstilo('text', { fontSize: 20, lineHeight: 30, fontWeight: '600', textAlign: 'center' });
      mudarEstilo('titlesInputPassword', { flexDirection: 'column', alignItems: 'flex-start', gap: 4 });
      mudarEstilo('forgotPassword', { fontSize: 18, lineHeight: 28, minHeight: 48, paddingVertical: 10, textDecorationLine: 'underline' });
      mudarEstilo('codeContainer', { gap: 8, flexWrap: 'wrap' });
      mudarEstilo('codeBox', { flex: 1, width: undefined, minWidth: 44, height: undefined, minHeight: 64, paddingVertical: 12, fontSize: 24, color: corDoCampo, borderColor: corDaBorda });
      mudarEstilo('radioOption', { height: undefined, minHeight: 64, paddingVertical: 14, borderColor: corDaBorda });
      mudarEstilo('radioText', { fontSize: 18, lineHeight: 28, color: corDoTexto, flexShrink: 1 });
      mudarEstilo('radioTextSelected', { color: corDoTexto });
      mudarEstilo('infoCardText', { fontSize: 18, lineHeight: 28, color: corSecundaria });
      mudarEstilo('infoCardTextBold', { fontSize: 18, lineHeight: 28 });
      mudarEstilo('progressBarContainer', { paddingTop: 0, paddingBottom: 0 });
      mudarEstilo('backButton', { minWidth: 48, minHeight: 48 });
      estilosNovos.visibilityButton = { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' };
      estilosNovos.inputHint = { color: prefs.colorVision ? c.muted : '#595959' };
      return estilosNovos;
    }

    if (/Login|Register|Password/.test(tela)) {
      mudarEstilo('container', { backgroundColor: c.bg, paddingTop: 0, gap: 24, alignItems: 'stretch', justifyContent: 'flex-start' });

      for (const key of ['mainTexts', 'authContainer', 'authSubContainer', 'contentArea', 'inputs', 'input', 'ageTitleRow', 'radioOption', 'infoCard', 'codeContainer']) {
        mudarEstilo(key, { width: '100%' });
      }

      mudarEstilo('contentArea', { minHeight: 0 });
      mudarEstilo('mainTexts', { paddingBottom: 0 });
      mudarEstilo('authContainer', { alignItems: 'stretch', gap: 18 });
      mudarEstilo('title', { fontSize: 30, lineHeight: 38, letterSpacing: -0.8, textAlign: 'left' });
      mudarEstilo('subtitle', { fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: 'left' });
      mudarEstilo('caption', { fontSize: 14, lineHeight: 22, width: undefined });
      mudarEstilo('inputs', { minHeight: 54, height: 58, borderWidth: 1, borderRadius: 14 });
      mudarEstilo('input', { minHeight: 54, borderRadius: 14 });
      mudarEstilo('textInput', { fontSize: 16, color: c.text });
      mudarEstilo('textSubContainer', { fontSize: 16, color: c.text });

    }

    if (tela === 'HistoryScreen' || tela === 'EmergencyScreen') {
      mudarEstilo('container', { paddingTop: 0, backgroundColor: c.bg });
      mudarEstilo('containerTitlesPage', { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20 });
      mudarEstilo('titlePage', { fontSize: 30, lineHeight: 38, color: c.text, letterSpacing: -0.8 });
      mudarEstilo('subtitlePage', { fontSize: 13, lineHeight: 21, paddingLeft: 0, marginTop: 6, color: c.muted });
      mudarEstilo('contentArea', { width: '100%', paddingHorizontal: 22, paddingTop: 8 });
      mudarEstilo('titlesTop', { justifyContent: 'space-between' });
      mudarEstilo('dateHeader', { fontSize: 13, fontWeight: '600' });
      mudarEstilo('scrollContent', { paddingBottom: 32 });
    }

    if (tela === 'ActivitysCard') {
      mudarEstilo('card', { minHeight: 84, padding: 16, backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 20 });
      mudarEstilo('perigoCard', { backgroundColor: c.surface, borderWidth: 1, borderColor: c.red });
      mudarEstilo('negadoCard', { backgroundColor: c.surface, borderColor: c.red, borderWidth: 1 });
      mudarEstilo('normalText', { color: c.text, fontSize: 14 });
      mudarEstilo('negadoText', { color: c.red, fontSize: 14 });
      mudarEstilo('timeText', { color: c.muted, fontSize: 11, maxWidth: 90 });
      mudarEstilo('whiteContainerIcon', { backgroundColor: c.raised, borderRadius: 12, width: 40, height: 40 });
      mudarEstilo('redContainerIcon', { backgroundColor: c.red, borderRadius: 12, width: 40, height: 40 });
    }

    if (tela === 'ContactCard') {
      mudarEstilo('contatos', { paddingTop: 12 });
      mudarEstilo('card', { width: '100%', height: undefined, minHeight: 112, borderRadius: 22, borderWidth: 1, padding: 16, flexWrap: 'wrap', gap: 14 });
      mudarEstilo('infoContato', { width: '100%' });
      mudarEstilo('nomeContato', { color: c.text, fontSize: 16 });
      mudarEstilo('botoesContato', { flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' });
    }
    
    for (const key of ['editContato', 'deleteContato', 'callContato', 'backButton', 'cancelButton', 'saveButton', 'closeButton']) {
      mudarEstilo(key, { minHeight: 44, minWidth: 44 });
    }

    return estilosNovos;

  }, [estilosOriginais, tela, c.bg, c.accent, c.red, c.text, c.muted, c.line, c.raised, c.surface, prefs.adapted, prefs.colorVision, insets.top]);
}
