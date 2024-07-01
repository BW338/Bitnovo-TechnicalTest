import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

const QRCodeScreen = ({ route }) => {
  const { paymentUrl, amount, currency, identifier, currencySymbol } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const navigation = useNavigation();

  useEffect(() => {
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/merchant/${identifier}`);

    {/*
    socket.onopen = () => {
      console.log('Conexión WebSocket establecida');

      // Simular un mensaje después de 5 segundos
      setTimeout(() => {
        const simulatedMessage = JSON.stringify({
          status: 'approved',
        });
        socket.onmessage({ data: simulatedMessage });
      }, 5000); // 5 segundos
    };
*/ }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);

      // Actualizar el estado del pago en tiempo real
      if (data.status) {
        setPaymentStatus(data.status);

      //  Navegar a la pantalla de pago completado si el estado es aprobado
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

    // Cerrar la conexión WebSocket cuando el componente se desmonte
    return () => {
      socket.close();
    };
  }, [identifier, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/icon-back.png')} style={styles.backArrow} />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Escanea el QR y serás redirigido a la pasarela de pago de Bitnovo Pay.</Text>
      </View>
        <View style={styles.qrContainer}>
        <QRCode 
  value={paymentUrl} 
  size={340}
  logo={require('../assets/bitnovo.png')}
  logoSize={90} // Ajusta el tamaño según sea necesario
  logoBackgroundColor="transparent"
  logoWidth={400} 
  logoHeight={150} 
/>

      </View>
      <Text style={styles.amount}>{`${amount} ${currencySymbol}`}</Text>
      <Text style={styles.autoUpdateText}>Esta pantalla se actualizará automáticamente.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066cc',
    alignItems: 'center',
    paddingTop: 40,
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
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
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
