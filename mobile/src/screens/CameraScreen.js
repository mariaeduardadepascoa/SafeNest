import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import CameraStream from '../design/CameraStream';
import { Button, Card, PageTitle, Screen, Txt } from '../design/UI';
import { useDesign } from '../design/DesignProvider';

// The real RTSP source already configured by the project is preserved.
const CAMERA_URL = 'rtsp://192.168.1.5:8554/camera';
export default function CameraScreen({ navigation }) {
  const { prefs } = useDesign();
  const focused = useIsFocused();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('Conectando à câmera…');
  const player = Platform.OS === 'web' ? <Txt>Esta transmissão RTSP está disponível na versão nativa do aplicativo.</Txt> : focused &&
    <CameraStream key={attempt} source={{ uri: CAMERA_URL }} autoplay
      style={{ width: '100%', height: 250, backgroundColor: '#0B2342' }}
      onPlaying={() => setStatus('Transmissão em reprodução')}
      onBuffering={() => setStatus('Carregando transmissão…')}
      onStopped={() => setStatus('Transmissão interrompida')}
      onError={() => setStatus('Não foi possível acessar a câmera. Verifique a conexão e o endereço RTSP.')} />;
  const reconnect = () => { setStatus('Conectando à câmera…'); setAttempt(v => v + 1); };
  if (prefs.adapted) return <View style={{ flex: 1, padding: 18, gap: 18 }}>{player}<Txt accessibilityLiveRegion="polite">{status}</Txt><Button title="Reconectar câmera" onPress={reconnect} /></View>;
  return <Screen navigation={navigation}>
    <PageTitle eyebrow="MONITORAMENTO" title="Sua casa, por perto." subtitle="Acompanhe a transmissão da câmera." />
    <Card style={{ padding: 0, overflow: 'hidden' }}>{player}</Card>
    <View style={{ marginVertical: 20, gap: 16 }}><Txt accessibilityLiveRegion="polite">{status}</Txt>
      <Button title="Reconectar câmera" secondary onPress={reconnect} />
    </View>
  </Screen>;
}
