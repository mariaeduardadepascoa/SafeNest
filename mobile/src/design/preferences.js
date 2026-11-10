// Nomes usados pelas telas:
// - adapted: design acessível
// - colorVision: cores alternativas
// - configured: já terminou a escolha inicial do aparelho

export const defaultPreferences = {
  adapted: false,
  colorVision: false,
  configured: false,
};

// As telas recebem a mesma paleta, inclusive no modo acessível.
export function getDesignColors(preferencias) {
  if (preferencias.colorVision) {
    return {
      bg: '#FFFFFF', surface: '#FFFFFF', raised: '#E5EDF7',
      text: '#0B1B2E', muted: '#33465E', line: '#52647A',
      accent: '#123C69', green: '#174F80', red: '#805000',
    };
  }

  return {
    bg: preferencias.adapted ? '#F8FAFC' : '#F4F7FB',
    surface: '#FFFFFF', raised: '#EDF1F6', text: '#18283C',
    muted: '#647286', line: '#E3E8EF',
    accent: preferencias.adapted ? '#2B5081' : '#0B2342',
    green: '#237157', red: '#AD4444',
  };
}

// junta o que está salvo no celular com a escolha que veio da conta
export function resolvePreferences(preferenciasSalvas, usuario) {
  const preferencias = { ...defaultPreferences };

  if (preferenciasSalvas) {
    preferencias.adapted = preferenciasSalvas.adapted === true;
    preferencias.colorVision = preferenciasSalvas.colorVision === true;
    preferencias.configured = preferenciasSalvas.configured === true;
  }

  if (usuario && typeof usuario.versao_adaptada === 'boolean') {
    preferencias.adapted = usuario.versao_adaptada;
  }

  return preferencias;
}


export function preferenceKey(idUsuario) { // função de uma chave diferente para não misturar as preferências
  if (idUsuario === null || idUsuario === undefined) {
    return 'safenest:appearance:v1:guest';
  }

  return `safenest:appearance:v1:${idUsuario}`;
}
