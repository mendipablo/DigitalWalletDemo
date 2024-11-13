import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); 

  const navigation = useNavigation();
  const route = useRoute();

  const whenOpenScreen = async () => {
    setLoading(true); 

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.0.130:3000/generate-qr?type=json', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('token', token)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('DATA---', data);

     
        setModalVisible(true);
        
    } catch (error) {
        console.error("ERROR", error);
       
    } finally {
       
        setLoading(false);
    }
};
  

  useEffect(() => {
    whenOpenScreen();
  }, []);


  if (!permission) {
    return <View />;
  }

 
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const afterScannedBarCode = ({ type, data }) => {
    setScanned(true);
    setModalVisible(false);
    try {
      const dataFromQr = JSON.parse(data);

      if (dataFromQr.amount && dataFromQr.transactionId) {
       
        navigation.navigate('Payment', {
          transactionId: dataFromQr.transactionId,
          amount: dataFromQr.amount,
          
         
        });
      } else {
        console.error("QR data is missing required fields.");
      }
    } catch (error) {
      console.error("Error parsing QR data:", error);
    }
  };
    


  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : afterScannedBarCode} 
        barcodeScannerSettings={{
          barcodeTypes: ["qr"], 
        }}
      >
        <View style={styles.buttonContainer}></View>
      </CameraView>

      {scanned && (
        <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
