import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { colorsLightMode, typography } from '../theme';

const UrlModal = ({ visible, onClose, url }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>Fechar</Text>
                </TouchableOpacity>

                <WebView source={{ uri: url }} />
            </View>
        </Modal>
    );
}

export default UrlModal;

const styles = StyleSheet.create({
    closeButton: {
        padding: 16,
        backgroundColor: colorsLightMode.danger,
    },
    closeText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    }
});