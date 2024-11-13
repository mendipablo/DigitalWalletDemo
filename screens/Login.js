import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.0.130:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data.token)
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigation.navigate('Home');
       
    } else {
      Alert.alert('Login failed:', data.error);
    }
     
  } catch (error) {
      console.error('Error during login:', error);
  }finally {
      setIsLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
