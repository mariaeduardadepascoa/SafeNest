import { useEstilos } from '../design/useScreenStyles';
import { useVisual } from '../design/DesignProvider';
import { Feather } from '@expo/vector-icons';
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
    const estilos = useEstilos(estilosAntigos, 'ActivitysCard');
    const { c, prefs } = useVisual();

    // estilização para os acessos
    let title = 'Entrada permitida';
    let subtitle = historico.id_tag != null ? `Tag ${historico.id_tag}` : 'Origem não informada';
    let variant = 'normal';
    let icone = 'casa'

    // Respostas antigas da API ainda podem vir sem o campo origem.
    const aberturaPeloApp = historico.tipo === 'acesso' && (historico.origem === 'aplicativo' || (!historico.origem && historico.id_tag === null));
    if (aberturaPeloApp) {
        title = 'Abertura pelo aplicativo';
        subtitle = 'Comando de abertura enviado';
    }

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

    const textoStyle = variant === 'negado' ? estilos.negadoText : estilos.normalText;
    const alertaSemFundo = !prefs.adapted && historico.tipo === 'alerta';

    return (
        <Pressable
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}, ${tempoDecorrido(historico.data_hora)}`}
            onPress={() => onPress && onPress({ ...historico, titulo: title })} //manda o item e o título para abrir os detalhes
            style={[estilos.card,
            variant === 'perigo' && estilos.perigoCard, //se variant === perigo -> perigoCard
            variant === 'negado' && estilos.negadoCard, //se variant === negado -> negadoCard
            ]}>
            <View style={estilos.left}>
                <View style={[variant === 'negado' ? estilos.redContainerIcon : estilos.whiteContainerIcon,
                    variant === 'negado' && { backgroundColor: c.red },
                    alertaSemFundo && { backgroundColor: 'transparent' }]}>
                    {prefs.colorVision || alertaSemFundo ? <Feather name={variant === 'negado' ? 'x-circle' : variant === 'perigo' ? 'alert-triangle' : 'check-circle'} size={20} color={variant === 'negado' ? (alertaSemFundo ? c.red : '#FFFFFF') : variant === 'perigo' ? c.red : c.accent} /> : <Icone width={20} height={20} />}
                </View>
                <View style={estilos.texts}>
                    <Text style={textoStyle}>{title}</Text>
                    {subtitle && <Text style={[textoStyle, estilos.subtitleText]}>{subtitle}</Text>}
                </View>
            </View>

            <Text style={[textoStyle, estilos.timeText]}>{tempoDecorrido(historico.data_hora)}</Text>
        </Pressable>
    );
}

const estilosAntigos = StyleSheet.create({
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
