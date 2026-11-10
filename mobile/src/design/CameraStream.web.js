// temporario: Evita carregar o reprodutor nativo no navegador.
import React from 'react';

export default function TransmissaoCamera({ url, aoCarregar, aoFalhar }) {
  return <iframe src={url} title="Transmissão da câmera" allow="autoplay; fullscreen"
    onLoad={aoCarregar} onError={aoFalhar} style={{ width: '100%', height: 250, border: 0 }} />;
}
