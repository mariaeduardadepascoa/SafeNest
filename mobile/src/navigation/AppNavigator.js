import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen.js';
import MainTabNavigator from './MainTabNavigator.js';
import RegisterNavigator from './RegisterNavigator';
import ForgotPassword from '../screens/ForgotPasswordScreen.js';
import ResetPasswordScreen from '../screens/ResetPasswordScreen.js';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useVisual } from '../design/DesignProvider';
import TelaFechadura from '../design/LockCard';
import TelaTags from '../design/TagsScreen';
import { Configuracoes } from '../design/AppearanceScreen';

const Stack = createNativeStackNavigator(); // criando as pilhas (stack)
// stack.screen name='' -> esse nome a gente usa para navegar

export default function AppNavigator() {
  const { usuario, carregando } = useAuth();
  const { c, ready } = useVisual();
  if (carregando || !ready) return <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Carregando sessão" /></View>;
  return (
    <Stack.Navigator initialRouteName={usuario ? 'Main' : 'Login'} screenOptions={{ contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Register' component={RegisterNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='Fechadura' component={TelaFechadura} options={{ headerShown: false }} />
      <Stack.Screen name='Tags' component={TelaTags} options={{ headerShown: false }} />
      <Stack.Screen name='Configurações' component={Configuracoes} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
