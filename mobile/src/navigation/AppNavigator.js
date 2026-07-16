import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen.js';
import RegisterScreen1 from '../screens/RegisterScreen1.js';
import MainTabNavigator from './MainTabNavigator.js';

const Stack = createNativeStackNavigator(); // criando as pilhas (stack)
// stack.screen name='' -> esse nome a gente usa para navegar

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Register' component={RegisterScreen1} options={{ headerShown: false }} />
      <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}