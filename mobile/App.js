
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import AppNavigator from './src/navigation/AppNavigator.js';
import { AuthProvider } from './src/context/AuthContext.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProvedorVisual } from './src/design/DesignProvider';
import { ProvedorFotoPerfil } from './src/context/FotoPerfilContext';

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_400Regular,
    RobotoMedium: Roboto_500Medium,
    RobotoBold: Roboto_700Bold,
  });
  return (
    <SafeAreaProvider><AuthProvider><ProvedorFotoPerfil><ProvedorVisual>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ProvedorVisual></ProvedorFotoPerfil></AuthProvider></SafeAreaProvider>
  );
}
