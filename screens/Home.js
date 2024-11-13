import React, { useState, useEffect } from 'react';
import { View, Image ,Text, Button, StyleSheet, FlatList, TouchableOpacity  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard'; 


const HomeScreen = () => {
  
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState("Tokens");
  const [transactions, setTransactions] = useState([]);
  const accountName = "Acc 1 Principal"; 
  const accountAddress = "0x07Sf974c244cV08Del136514Figf5303C8D8cd41"; 
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTransactions = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://192.168.0.130:3000/transactions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error al obtener las transacciones:", error);
        }
    };

    fetchTransactions();
}, []);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionContainer}>
    <Text style={styles.dateText}>{item.date}</Text>
    <View style={styles.transactionContent}>
        <Image source={{ uri: 'https://path/to/icon.png' }} style={styles.icon} />
        <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>{item.name || 'Transacción'}</Text>
            <Text style={styles.transactionStatus}>{item.status || 'Confirmada'}</Text>
        </View>
        <View style={styles.transactionAmounts}>
            <Text style={styles.usdAmount}>${item.amount} USD</Text>
            <Text style={styles.bnbAmount}>{item.bnbAmount} BNB</Text>
        </View>
    </View>
</View>
);


  const getShortenedAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = () => {
    Clipboard.setString(accountAddress);
    Alert.alert("Copiado", "La dirección completa se ha copiado al portapapeles.");
  };

  const handleScanQRCode = () => {
    navigation.navigate('QRScanner');
  };

  const fetchTokensFromBackend = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.0.130:3000/tokens', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('data', data)
        setTokens(data.enrichedTokens); 
        setBalance(data.totalBalanceInUSD); 
    } catch (error) {
        console.error("Error fetching tokens:", error);
    }
};

useEffect(() => {
    fetchTokensFromBackend();
}, []);


  
const renderToken = ({ item }) => {
  
  const tokenImageUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${item.ids}.png`; 

  return (
    <View style={styles.tokenCard}>
      <View style={styles.tokenInfoLeft}>
        <Image source={{ uri: tokenImageUrl }} style={styles.tokenIcon} />
        <View>
          <Text style={styles.tokenName}>{item.name}</Text>
          <Text
            style={[
              styles.percentChange,
              item.percentChange >= 0 ? styles.positiveChange : styles.negativeChange
            ]}
          >
            {item.percentChange.toFixed(2)}%
          </Text>
        </View>
      </View>
      <View style={styles.tokenInfoRight}>
        <Text style={styles.tokenValue}>${item.balanceInUSD.toFixed(2)} USD</Text>
        <Text style={styles.tokenBalance}>{item.balance} {item.symbol}</Text>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* Header con el nombre de la cuenta */}
      <View style={styles.header}>
        <Text style={styles.accountName}>{accountName}</Text>
        
        <View style={styles.accountAddressContainer}>
          {/* Dirección acortada */}
          <Text style={styles.accountAddress}>{getShortenedAddress(accountAddress)}</Text>
          {/* Botón de copiar */}
      
      <TouchableOpacity onPress={copyToClipboard}>
      <Feather name="copy" size={24} color="black" />
        </TouchableOpacity>
      
        </View>
      </View>
       {/* Sección del balance general */}
       <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>$ {balance.toFixed(2)}</Text>
        <Text style={styles.subtext}>Balance Total en USD</Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>

       <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.actionButton}>
    <MaterialCommunityIcons name="plus-minus-variant" size={40} color="white" />
    </TouchableOpacity>
    <Text style={styles.buttonText}>Comprar</Text>
  </View>

  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.actionButton}>
    <FontAwesome name="exchange" size={40} color="white" />
    </TouchableOpacity>
    <Text style={styles.buttonText}>Intercambiar</Text>
  </View>

  <View style={styles.buttonContainer}>
    <TouchableOpacity onPress={handleScanQRCode} style={styles.actionButton}>
    <AntDesign name="qrcode" size={40} color="white" />
    </TouchableOpacity>
    <Text style={styles.buttonText}>Escanear</Text>
  </View>
        

        <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.actionButton}>
    <Feather name="arrow-up-right" size={40} color="white" />
    </TouchableOpacity>
    <Text style={styles.buttonText}>Enviar</Text>
  </View>

  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.actionButton}>
    <FontAwesome6 name="money-bill-transfer" size={32} color="white" />
    </TouchableOpacity>
    <Text style={styles.buttonText}>Recibir</Text>
  </View>
      </View>

 {/* Tabs para navegar entre Tokens y Actividad */}
 <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab("Tokens")} style={[styles.tabButton, activeTab === "Tokens" && styles.activeTab]}>
          <Text style={activeTab === "Tokens" ? styles.activeTabText : styles.tabText}>Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Actividad")} style={[styles.tabButton, activeTab === "Actividad" && styles.activeTab]}>
          <Text style={activeTab === "Actividad" ? styles.activeTabText : styles.tabText}>Actividad</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido basado en el tab activo */}
      {activeTab === "Tokens" ? (
        <FlatList
          data={tokens}
          renderItem={renderToken}
          keyExtractor={item => item.id}
          style={styles.tokenList}
        />
      ) : (
        <View style={styles.container}>
            {transactions.length > 0 ? (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text style={styles.noTransactionsText}>No hay transacciones disponibles.</Text>
            )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  accountAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  accountAddress: {
    fontSize: 14,
    color: '#888',
    marginRight: 10,
  },
  copyIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 10,
    width: 60,
    height: 60,  
    alignItems: 'center',
    justifyContent: 'center', 
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
  },
  tokenList: {
    marginTop: 20,
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  tokenInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentChange: {
    fontSize: 14,
    
    marginTop: 2,
  },
  positiveChange: {
    color: 'green',
  },
  negativeChange: {
    color: 'red',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenInfoRight: {
    alignItems: 'flex-end',
  },
tokenBalance: {
    fontSize: 14,
 
    color: '#666',
  },
  tokenValue: {
    fontSize: 16,
 
    color: '#000',
  },
  scanButton: {
    height: 5, // Ajusta la altura del botón
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40, // Para bordes redondeados (opcional)
    backgroundColor: '#bf9bf1', // Color de fondo del botón (opcional)
    elevation: 50, // Sombra en Android (opcional)
},
qrCodeIcon: {
  width: 30,   // Ajusta el ancho del ícono
  height: 30,  // Ajusta la altura del ícono
  resizeMode: 'contain', // Evita que el ícono se distorsione
},
tabContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
},
tabButton: {
  flex: 1,
  paddingVertical: 10,
  alignItems: 'center',
},
activeTab: {
  borderBottomWidth: 2,
  borderBottomColor: '#6200ea',
},
tabText: {
  color: '#666',
  fontSize: 16,
},
activeTabText: {
  color: '#6200ea',
  fontSize: 16,
  fontWeight: 'bold',
},
activityContainer: {
  marginTop: 20,
  paddingHorizontal: 10,
},
transactionContainer: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0',
},
dateText: {
  fontSize: 12,
  color: '#888',
  marginBottom: 5,
},
transactionContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
icon: {
  width: 32,
  height: 32,
  marginRight: 10,
},
transactionDetails: {
  flex: 1,
},
transactionName: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#333',
},
transactionStatus: {
  fontSize: 12,
  color: 'green',
},
transactionAmounts: {
  alignItems: 'flex-end',
},
usdAmount: {
  fontSize: 14,
  color: '#333',
},
bnbAmount: {
  fontSize: 12,
  color: '#888',
},
usdValue: {
  fontSize: 12,
  color: 'green',
},

noTransactionsText: {
  fontSize: 16,
  color: '#888',
  textAlign: 'center',
  marginTop: 20
},

});


export default HomeScreen;
