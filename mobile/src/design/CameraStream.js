import React from 'react';
import { WebView } from 'react-native-webview';

// A API devolve a página de transmissão do servidor de vídeo.
export default function TransmissaoCamera({ url, aoCarregar, aoFalhar }) {
  return <WebView source={{ uri: url }} style={{ width: '100%', height: 250 }}
    allowsInlineMediaPlayback allowsFullscreenVideo mediaPlaybackRequiresUserAction={false}
    onLoad={aoCarregar} onError={aoFalhar} onHttpError={aoFalhar} />;
}
