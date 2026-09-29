import { StyleSheet,View } from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';

export default function CameraScreen() {
  return (
    <VLCPlayer
      source={{
        uri: 'rtsp://192.168.1.5:8554/camera',
      }}
      style={{
        width: '90%',
        height: 250,
      }}
      autoplay={true}
    />
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },




   
});