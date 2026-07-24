import { StyleSheet, Text, View, Modal, TouchableOpacity, AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import { colorsLightMode, typography } from '../theme';
import { useRef, useState, useEffect } from 'react';

const UrlModal = ({ visible, onClose, url, accessToken }) => {
    const webViewRef = useRef(null);
    const [erro, setErro] = useState(false);

    // Recarrega sozinho quando o app volta pro primeiro plano
    // (ex: depois de você trocar o WiFi nas configurações do Android)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && visible) {
                webViewRef.current?.reload();
                setErro(false);
            }
        });
        return () => subscription.remove();
    }, [visible]);

    const tentarNovamente = () => {
        setErro(false);
        webViewRef.current?.reload();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onError={() => setErro(true)}
                onHttpError={() => setErro(true)}
                onLoadEnd={() => {
                    webViewRef.current?.injectJavaScript(`
                        const input = document.querySelector('input[name="user_id"]');

                        if (input) {
                            input.value = "${accessToken}";
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }

                        true;
                    `);
                }}
            />

            {erro && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>
                        Não foi possível conectar à fechadura. Confirme que o celular está conectado na rede SafeNest-Setup e tente novamente.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={tentarNovamente}>
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
        </Modal>
    );
};

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
    },
    errorOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 15,
    },
    retryButton: {
        backgroundColor: colorsLightMode.danger,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
}); 