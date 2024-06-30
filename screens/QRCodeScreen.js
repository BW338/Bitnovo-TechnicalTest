import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

const QRCodeScreen = ({ route }) => {
  const { paymentUrl, identifier } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const navigation = useNavigation();

  useEffect(() => {
    console.log('IDENTTIFIER: '+ identifier)

    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/merchant/${identifier}`);

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

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);

      // Actualizar el estado del pago en tiempo real
      if (data.status) {
        setPaymentStatus(data.status);

        // Navegar a la pantalla de pago completado si el estado es aprobado
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
      <Text style={styles.title}>Escanea el código QR para pagar</Text>
      <View style={styles.qrContainer}>
        <QRCode value={paymentUrl} size={200} />
      </View>
      <Text style={styles.status}>Estado del pago: {paymentStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  status: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default QRCodeScreen;
