import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/Home';
import QRScannerScreen from './screens/QRScanner';
import PaymentScreen from './screens/Payment'; 
import LoginScreen from './screens/Login';
import { AuthProvider } from './hooks/auth';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
    
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
  );
}
