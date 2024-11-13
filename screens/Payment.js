// PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';


const cryptocurrencies = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC' },
  { id: '2', name: 'Tether USD', symbol: 'USDT' },
  { id: '3', name: 'BNB', symbol: 'BNB' },
  // Agrega más criptomonedas si es necesario
];

const PaymentScreen = () => {
  const {transactionId, amount } = useRoute().params;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const navigation = useNavigation();
  const handleConfirmPayment = async () => {
    if (!transactionId || !amount || !selectedCrypto) {
      Alert.alert("Transacción inválida", "Tu pago no se puede procesar.");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.130:3000/process-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactionId, amount, crypto: selectedCrypto.symbol }),
      });
      console.log('respuesta',response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

      const transactionData = await response.json();

      
       // Llamar a la ruta para guardar la transacción
       await fetch('http://192.168.0.130:3000/save-transaction', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            transactionId,
            amount,
            date: new Date().toISOString(),
            crypto: selectedCrypto.symbol
        }),
    });

      navigation.navigate('Home');

      Alert.alert("Pago confirmado", "Tu pago ha sido procesado exitosamente.");
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      Alert.alert("Error", "Hubo un problema al procesar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Confirmar Pago</Text>
      <Text>Monto a pagar: ${amount}</Text>
      

      <Text style={{ marginTop: 20 }}>Selecciona una Criptomoneda:</Text>
      <FlatList
        data={cryptocurrencies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedCrypto(item)}>
            <Text style={{ fontSize: 18, padding: 10, color: selectedCrypto === item ? 'blue' : 'black' }}>
              {item.name} ({item.symbol})
            </Text>
          </TouchableOpacity>
        )}
      />

      {selectedCrypto && (
        <Text style={{ marginTop: 20 }}>Criptomoneda seleccionada: {selectedCrypto.name} ({selectedCrypto.symbol})</Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Confirmar Pago" onPress={handleConfirmPayment} />
      )}
    </View>
  );
};

export default PaymentScreen;
