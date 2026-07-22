import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFechaduras } from '../hooks/useFechaduras';
import { colorsLightMode, typography } from '../theme';
import AddLockButton from '../components/AddLockButton';
import UrlModal from '../components/UrlModal';


export function FechadurasSection() {
    const [modalVisible, setModalVisible] = useState(false);
    const { fechaduras, carregando } = useFechaduras();

    if (carregando) {
        return (
            <View>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (fechaduras.length === 0) {
        return (
            <View>
                <AddLockButton onPress={() => setModalVisible(true)} />
                <UrlModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    url="https://google.com"   // depois colocar o ip do wifi menager do esp
                />
            </View>
        );
    }

    return (
        <View >
            {fechaduras.map((item) => (
                <View key={item.id} style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
                    <Text>{item.nome || `Fechadura ${item.id}`}</Text>
                </View>
            ))}
        </View>
    );
}