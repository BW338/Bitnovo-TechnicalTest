import React, { useEffect, useState } from 'react';
import { View, Text, Button, Share, StyleSheet, Image, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

const SharePaymentScreen = ({ route }) => {
  const { paymentUrl, identifier, amount } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation();

  const formattedAmount = parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/merchant/${identifier}`);

    socket.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

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

    return () => {
      socket.close();
    };
  }, [identifier]);

  const sharePayment = (method) => {
    if (method === 'whatsapp') {
      Share.share({
        message: `Paga usando este enlace: ${paymentUrl}`,
        url: paymentUrl
      });
    } else if (method === 'email') {
      Share.share({
        message: `Paga usando este enlace: ${paymentUrl}`,
        url: paymentUrl,
        title: 'Pago por correo electrónico'
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../assets/icono-pago-A.png')} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Solicitud de pago</Text>
            <Text style={styles.amount}>Monto: ${formattedAmount}</Text>
          </View>
        </View>
        <Text style={styles.amount}>Comparte el enlace de pago con el cliente</Text>
      </View>

      <TouchableOpacity style={styles.card}>
        <Image source={require('../assets/icono-link.png')} style={styles.cardIconLeft} />
        <Text style={styles.cardText}>{paymentUrl}</Text>    
            <TouchableOpacity onPress={() => navigation.navigate('QRCodeScreen', { paymentUrl, identifier })}>
          <Image source={require('../assets/icono-qr.png')} style={styles.cardIconRight} />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Image source={require('../assets/icono-flecha.png')} style={styles.cardIconLeft} />
        <Text style={styles.cardText}>Enviar por correo electrónico </Text>
        <TouchableOpacity onPress={() => sharePayment('email')}>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Image source={require('../assets/icono-wsp.png')} style={styles.cardIconLeft} />
        <View style={styles.whatsappContainer}>
          <TextInput
            style={styles.input}
            placeholder="Envía a número de Whatsapp"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={() => sharePayment('whatsapp')}>
            <Image source={require('../assets/enviar.png')} style={styles.cardIconRight} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Compartir con otras aplicaciones</Text>
        <TouchableOpacity onPress={() => Share.share({ message: `Paga usando este enlace: ${paymentUrl}`, url: paymentUrl })}>
          <Image source={require('../assets/icono-export.png')} style={styles.cardIconRight} />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.newRequestButton} onPress={() => navigation.navigate('CreatePayment')}>
        <Text style={styles.newRequestButtonText}>Nueva Solicitud</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: 'grey',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 5,
  },
  cardText: {
    fontSize: 16,
  },
  cardIconLeft: {
    width: 30,
    height: 30,
  },
  cardIconRight: {
    width: 30,
    height: 30,
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
    flex: 1,
  },
  newRequestButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    alignItems: 'center',
  },
  newRequestButtonText: {
    fontSize: 16,
  },
});

export default SharePaymentScreen;
