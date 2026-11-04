// Nomes usados pelas telas:
// - adapted: design acessível
// - colorVision: cores alternativas
// - configured: já terminou a escolha inicial do aparelho

export const defaultPreferences = {
  adapted: false,
  colorVision: false,
  configured: false,
};

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
