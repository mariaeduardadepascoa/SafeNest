import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen.js';
import RegisterScreen1 from './src/screens/RegisterScreen1.js';


const Stack = createNativeStackNavigator(); //criando as pilhas (stack)
// const Drawer = createDrawerNavigator(); //criando o hamburguer
//stack.screen name='' -> esse nome a gente usa para navegar
export default function App() {
  return (
    <NavigationContainer >
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name='Register' component={RegisterScreen1} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
});
