import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen.js';
import MainTabNavigator from './MainTabNavigator.js';
import RegisterNavigator from './RegisterNavigator';
import ForgotPassword from '../screens/ForgotPasswordScreen.js';
import ResetPasswordScreen from '../screens/ResetPasswordScreen.js';

const Stack = createNativeStackNavigator(); // criando as pilhas (stack)
// stack.screen name='' -> esse nome a gente usa para navegar

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Register' component={RegisterNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }}/>
      <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}