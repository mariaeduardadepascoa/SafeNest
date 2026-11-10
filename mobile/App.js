
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import AppNavigator from './src/navigation/AppNavigator.js';
import { AuthProvider } from './src/context/AuthContext.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DesignProvider } from './src/design/DesignProvider';

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_400Regular,
    RobotoMedium: Roboto_500Medium,
    RobotoBold: Roboto_700Bold,
  });
  return (
    <SafeAreaProvider><AuthProvider><DesignProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DesignProvider></AuthProvider></SafeAreaProvider>
  );
}
