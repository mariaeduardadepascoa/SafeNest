
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Roboto_400Regular,Roboto_500Medium ,Roboto_700Bold } from '@expo-google-fonts/roboto';

import AppNavigator from './src/navigation/AppNavigator.js';


export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_400Regular,
    RobotoMedium: Roboto_500Medium,
    RobotoBold: Roboto_700Bold,
  });
  return (

    <NavigationContainer>
      <AppNavigator />

    </NavigationContainer>

  );
}