import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colorsLightMode, typography } from '../theme';
import HouseIcon from '../../assets/houseIcon-entrada-permitida.svg';
import AlertIcon from '../../assets/alertIcon-perigo.svg';
import PerigoIcon from '../../assets/perigoIcon-acesso-negado2.svg';
import CorrectIcon from '../../assets/okIcon-entrada-permitida.svg';

const ALERTAS = {
    fogo: { title: 'Alerta de incêndio acionado', variant: 'perigo', icone: 'alerta' },
    ACESSONEGADO: { title: 'Acesso negado', variant: 'negado', icone: 'negado' },
    FECHADURANOVA: { title: 'Nova fechadura cadastrada', variant: 'normal', icone: 'fechadura' },
};

const ICONES = {
    casa: HouseIcon,
    alerta: AlertIcon,
    negado: PerigoIcon,
    fechadura: CorrectIcon,
};

// função para traduzir as datas
function tempoDecorrido(dataHora) {
    const minutos = Math.floor((Date.now() - new Date(dataHora).getTime()) / 60000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `Há ${minutos} min`;
    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `Há ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

    const dias = Math.floor(horas / 24);
    return `Há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

export default function ActivitysCard({ historico, onPress }) {

    // estilização para os acessos
    let title = 'Entrada permitida';
    let subtitle = `Tag ${historico.id_tag}`;
    let variant = 'normal';
    let icone = 'casa'

    //estilização para os alertas
    if (historico.tipo === 'alerta') {
        const alerta = ALERTAS[historico.tipo_alerta]; //busca o alerta na constante ALERTAS 
        title = alerta ? alerta.title : historico.tipo_alerta;
        variant = alerta ? alerta.variant : 'perigo';
        icone = alerta ? alerta.icone : 'alerta';
        subtitle = null;
    }

    // para ser importado com letra maiscula
    const Icone = ICONES[icone];

    const textoStyle = variant === 'negado' ? styles.negadoText : styles.normalText;

    return (
        <Pressable
            onPress={() => onPress && onPress({ ...historico, titulo: title })} //manda o item e o título para abrir os detalhes
            style={[styles.card,
            variant === 'perigo' && styles.perigoCard, //se variant === perigo -> perigoCard
            variant === 'negado' && styles.negadoCard, //se variant === negado -> negadoCard
            ]}>
            <View style={styles.left}>
                <View style={variant === 'negado' ? styles.redContainerIcon : styles.whiteContainerIcon}>
                    <Icone width={20} height={20} />
                </View>
                <View style={styles.texts}>
                    <Text style={textoStyle} numberOfLines={2}>{title}</Text>
                    {subtitle && <Text style={[textoStyle, styles.subtitleText]} numberOfLines={1}>{subtitle}</Text>}
                </View>
            </View>

            <Text style={[textoStyle, styles.timeText]}>{tempoDecorrido(historico.data_hora)}</Text>
        </Pressable>
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
        borderWidth: 2,
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
    redContainerIcon: {
        width: 34,
        height: 34,
        backgroundColor: colorsLightMode.danger,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flexShrink: 1,
    },
    normalText: {
        ...typography.bodyBold,
        color: colorsLightMode.white,
    },
    negadoText: {
        ...typography.bodyBold,
        color: colorsLightMode.white,
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