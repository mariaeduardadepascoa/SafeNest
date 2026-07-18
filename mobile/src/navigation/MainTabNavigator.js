import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Clock, Camera, Warning } from "phosphor-react-native";

import HomeScreen from '../screens/HomeScreen.js';
import HistoryScreen from '../screens/HistoryScreen.js';
import CameraScreen from '../screens/CameraScreen.js';
import EmergencyScreen from '../screens/EmergencyScreen.js';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2B5081',
        tabBarInactiveTintColor: '#CDCDCD',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'RobotoMedium',
        },
        tabBarStyle: {
          position: 'absolute',
          height: 65,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E2E2',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <House size={24} color={color} weight="bold" />
          ),
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Clock size={24} color={color} weight="bold" />
          ),
        }}
      />
      <Tab.Screen
        name="Câmera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Camera size={24} color={color} weight="bold" />
          ),
        }}
      />
      <Tab.Screen
        name="Emergência"
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Warning size={24} color={color} weight="bold" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}