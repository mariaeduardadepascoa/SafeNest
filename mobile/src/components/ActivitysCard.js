import { View, Text, StyleSheet } from 'react-native';
import { colorsLightMode, typography } from '../theme';

const ALERTAS = {
    fogo: { title: 'Alerta de incêndio acionado', variant: 'perigo' },
    ACESSONEGADO: { title: 'Acesso negado', variant: 'perigo' },
    FECHADURANOVA: { title: 'Nova fechadura cadastrada', variant: 'normal' },
};

function tempoDecorrido(dataHora) {
    const minutos = Math.floor((Date.now() - new Date(dataHora).getTime()) / 60000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `Há ${minutos} min`;
    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `Há ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

    const dias = Math.floor(horas / 24);
    return `Há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

export default function ActivitysCard({ item }) {
    let title = 'Entrada permitida';
    let subtitle = `Tag ${item.id_tag}`;
    let variant = 'normal';

    if (item.tipo === 'alerta') {
        const alerta = ALERTAS[item.tipo_alerta];
        title = alerta ? alerta.title : item.tipo_alerta;
        variant = alerta ? alerta.variant : 'perigo';
        subtitle = null;
    }

    const textoStyle = variant === 'negado' ? styles.negadoText : styles.normalText;

    return (
        <View style={[
            styles.card,
            variant === 'perigo' && styles.perigoCard,
            variant === 'negado' && styles.negadoCard,
        ]}>
            <View style={styles.left}>
                {variant !== 'negado' && (
                    <View style={styles.whiteContainerIcon}>
                        {/* icone[ aqui: escolher por variant*/}
                    </View>
                )}
                <View style={styles.texts}>
                    <Text style={textoStyle} numberOfLines={2}>{title}</Text>
                    {subtitle && <Text style={[textoStyle, styles.subtitleText]} numberOfLines={1}>{subtitle}</Text>}
                </View>
            </View>

            <Text style={[textoStyle, styles.timeText]}>{tempoDecorrido(item.data_hora)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 64,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colorsLightMode.primary,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colorsLightMode.black,
    },
    perigoCard: {
        borderWidth: 0,
        backgroundColor: colorsLightMode.danger,
    },
    negadoCard: {
        borderColor: colorsLightMode.danger,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 1,
    },
    whiteContainerIcon: {
        width: 34,
        height: 34,
        backgroundColor: colorsLightMode.white,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flexShrink: 1,
    },
    normalText: {
        ...typography.body,
        color: colorsLightMode.white,
    },
    negadoText: {
        ...typography.body,
        color: colorsLightMode.danger,
    },
    subtitleText: {
        fontSize: 11,
        opacity: 0.8,
    },
    timeText: {
        fontSize: 12,
        marginLeft: 8,
    },
});