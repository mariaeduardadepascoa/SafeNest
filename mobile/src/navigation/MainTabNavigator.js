import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Clock, Camera, Warning, SquaresFour } from "phosphor-react-native";
import { Pressable, View, Text } from 'react-native';
import { useDesign } from '../design/DesignProvider';
import ModernHomeScreen, { DevicesScreen } from '../design/HomeScreen';
import AppearanceScreen from '../design/AppearanceScreen';

import HomeScreen from '../screens/HomeScreen.js';
import HistoryScreen from '../screens/HistoryScreen.js';
import CameraScreen from '../screens/CameraScreen.js';
import EmergencyScreen from '../screens/EmergencyScreen.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();


export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { c, prefs } = useDesign();
  if (!prefs.configured) return <AppearanceScreen />;
  return (
    <Tab.Navigator
      initialRouteName="Início"
      screenOptions={({ navigation }) => ({
        headerShown: prefs.adapted,
        headerTitle: 'SafeNest',
        headerStyle: { backgroundColor: c.bg },
        headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Abrir configurações" onPress={() => navigation.navigate('Configurações')}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', paddingRight: 16 }}><Text>⚙</Text></Pressable>,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: '#647286',
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
          borderTopWidth: 1,
          borderTopColor: '#E2E2E2',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        } : {
          marginHorizontal: 12, marginBottom: Math.max(insets.bottom, 12), marginTop: 8,
          paddingTop: 9, paddingBottom: 9, height: 76, borderWidth: 1, borderTopWidth: 1,
          borderColor: c.line, borderRadius: 36, backgroundColor: '#FFFFFF',
          elevation: 4, shadowColor: '#1C3D68', shadowOpacity: 0.08, shadowRadius: 18,
        },
        tabBarItemStyle: prefs.adapted ? undefined : { borderRadius: 27, marginHorizontal: 2 },
        tabBarActiveBackgroundColor: prefs.adapted ? undefined : c.raised,
      })}
    >
      <Tab.Screen
        name="Início"
        component={prefs.adapted ? HomeScreen : ModernHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <House size={24} color={color} weight="bold" />
          ),
          tabBarLabel: 'Início',
          tabBarAccessibilityLabel: 'Início, resumo dos sistemas da residência',
        }}
      />
      <Tab.Screen name="Dispositivos" component={DevicesScreen} options={{
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
