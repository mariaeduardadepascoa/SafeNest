import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterEmailScreen from '../screens/RegisterEmailScreen';
import RegisterPasswordScreen from '../screens/RegisterPasswordScreen';
import RegisterAgeScreen from '../screens/RegisterAgeScreen';

const Stack = createNativeStackNavigator();

export default function RegisterNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen}/>
      <Stack.Screen name="RegisterPassword" component={RegisterPasswordScreen}/>
      <Stack.Screen name="RegisterAge"component={RegisterAgeScreen}/>
    </Stack.Navigator>
  );
}