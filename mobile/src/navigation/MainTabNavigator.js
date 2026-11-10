import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { PlatformPressable } from '@react-navigation/elements';
import { House, Clock, Camera, Warning, SquaresFour } from "phosphor-react-native";
import { useVisual } from '../design/DesignProvider';
import InicioNormal, { Dispositivos } from '../design/HomeScreen';
import EscolhaVisual from '../design/AppearanceScreen';

import HomeScreen from '../screens/HomeScreen.js';
import HistoryScreen from '../screens/HistoryScreen.js';
import CameraScreen from '../screens/CameraScreen.js';
import EmergencyScreen from '../screens/EmergencyScreen.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// O círculo é apenas o fundo: ícones, textos e áreas de toque não mudam.
function BotaoDaAba({ children, style, ...props }) {
  const { c } = useVisual();
  return <PlatformPressable {...props} style={style}>
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {props['aria-selected'] && <View pointerEvents="none" style={{
      position: 'absolute', width: 54, height: 54, borderRadius: 27,
      left: '50%', top: '50%', marginLeft: -27, marginTop: -27, backgroundColor: c.raised,
      }} />}
      {children}
    </View>
  </PlatformPressable>;
}


export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { c, prefs } = useVisual();
  if (!prefs.configured) return <EscolhaVisual />;
  return (
    <Tab.Navigator
      initialRouteName="Início"
      screenOptions={({ navigation }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'RobotoMedium',
        },
        sceneStyle: { backgroundColor: c.bg },
        tabBarStyle: prefs.adapted ? {
          position: 'absolute',
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderTopColor: prefs.colorVision ? c.line : '#E2E2E2',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        } : {
          marginHorizontal: 12, marginBottom: Math.max(insets.bottom, 12), marginTop: 8,
          paddingTop: 9, paddingBottom: 9, height: 76, borderWidth: 0, borderTopWidth: 0,
          borderColor: c.line, borderRadius: 36, backgroundColor: '#FFFFFF',
          elevation: 4, shadowColor: '#1C3D68', shadowOpacity: 0.08, shadowRadius: 18,
        },
        tabBarItemStyle: prefs.adapted ? undefined : { borderRadius: 27, marginHorizontal: 2 },
        tabBarActiveBackgroundColor: prefs.adapted ? undefined : 'transparent',
        tabBarButton: prefs.adapted ? undefined : props => <BotaoDaAba {...props} />,
      })}
    >
      <Tab.Screen
        name="Início"
        component={prefs.adapted ? HomeScreen : InicioNormal}
        options={{
          tabBarIcon: ({ color }) => (
            <House size={24} color={color} weight="bold" />
          ),
          tabBarLabel: 'Início',
          tabBarAccessibilityLabel: 'Início, resumo dos sistemas da residência',
        }}
      />
      <Tab.Screen name="Dispositivos" component={Dispositivos} options={{
        tabBarIcon: ({ color }) => <SquaresFour size={24} color={color} />,
        tabBarAccessibilityLabel: 'Dispositivos, fechadura, câmera e tags',
      }} />
      <Tab.Screen
        name="Câmera"
        component={CameraScreen}
        options={{ tabBarIcon: ({ color }) => <Camera size={24} color={color} weight="bold" />,
          tabBarAccessibilityLabel: 'Câmera, transmissão da residência' }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Clock size={24} color={color} weight="bold" />
          ),
          tabBarLabel: 'Histórico',
          tabBarAccessibilityLabel: 'Histórico, registros e alertas da residência',
        }}
      />
      <Tab.Screen
        name="Emergência"
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Warning size={24} color={color} weight="bold" />
          ),
          tabBarLabel: 'Emergência',
          tabBarAccessibilityLabel: 'Emergnência, contatos de emergência salvos',
        }}
      />
    </Tab.Navigator>
  );
}
