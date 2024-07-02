import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

const QRCodeScreen = ({ route }) => {
  const { paymentUrl, amount, currency, identifier, currencySymbol } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const navigation = useNavigation();

  useEffect(() => {
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/merchant/${identifier}`);
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);
  
      if (data.status) {
        setPaymentStatus(data.status);
  
        if (data.status === 'approved' || data.status === 'completed') {
          navigation.navigate('PaymentCompleted');
        }
      }
    };
  
    socket.onerror = (error) => {
      console.error('Error en el WebSocket:', error);
    };
  
    socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };
  
    // Simular estado "aprobado" después de 5 segundos
    const simulateApproved = setTimeout(() => {
      const simulatedData = {
        status: 'approved'
      };
      const simulatedMessage = JSON.stringify(simulatedData);
      socket.onmessage({ data: simulatedMessage });
    }, 5000);
  
    // Cerrar la conexión WebSocket cuando el componente se desmonte
    return () => {
      clearTimeout(simulateApproved); // Limpiar el timeout si el componente se desmonta antes de los 5 segundos
      socket.close();
    };
  }, [identifier, navigation]);
  

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.touchable}>
          <Image
            source={require('../assets/icon-back.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Image
            source={require('../assets/info.png')}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Escanea el QR y serás redirigido a la pasarela de pago de Bitnovo Pay.
          </Text>
        </View>
       <View style={styles.qrContainer}>
  <QRCode 
    value={paymentUrl} 
    size={340}
    logo={require('../assets/bitnovo2.png')}
    logoSize={90} 
    logoBackgroundColor="transparent"
    logoWidth={200}  
    logoHeight={90} 
  />
</View>
        <Text style={styles.amount}>{`${amount} ${currencySymbol}`}</Text>
        <Text style={styles.autoUpdateText}>Esta pantalla se actualizará automáticamente.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  container: {
    flex: 1,
    backgroundColor: '#0066cc', 
    alignItems: 'center',
    paddingTop: 20, // Ajustar para proporcionar espacio si es necesario
  },
  header: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'flex-start',
  },
  backArrow: {
    width: 20,
    height: 20,
  },
  infoBox: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
    backgroundColor:'#f0f8ff'
  },
  infoIcon: {
    width: 24,              
    height: 24,             
    marginRight: 10,        
    alignSelf: 'flex-start' 
  },
  infoText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
    flex: 1,               
    flexWrap: 'wrap'      
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight:"600",
  },
  autoUpdateText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default QRCodeScreen;
