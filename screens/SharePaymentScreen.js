import React, { useEffect, useState } from 'react';
import { View, Text, Share, StyleSheet, Image, TextInput, TouchableOpacity, ToastAndroid, Modal, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import CountrySelectionModal from '../components/CountrySelectionModal';

const SharePaymentScreen = ({ route }) => {
  const { paymentUrl, identifier, amount, currency,currencySymbol  } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);
  const navigation = useNavigation();

  //const formattedAmount = `${currency.code} ${parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    const completePhoneNumber = selectedCountry ? `${selectedCountry.code}${phoneNumber}` : phoneNumber;

    if (method === 'whatsapp') {
      if (!completePhoneNumber) {
        ToastAndroid.showWithGravity('Por favor, ingrese un número de teléfono', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
      const message = `¡Hola! Aquí está tu enlace de pago: ${paymentUrl}`;
      const url = `https://wa.me/${completePhoneNumber}?text=${encodeURIComponent(message)}`;

      Linking.openURL(url)
        .then(() => console.log('Mensaje de WhatsApp enviado'))
        .catch((error) => console.log('Error al enviar mensaje de WhatsApp', error));
    } else if (method === 'email') {
      Share.share({
        message: `Paga usando este enlace: ${paymentUrl}`,
        url: paymentUrl,
        title: 'Pago por correo electrónico'
      });
    } else if (method === 'other') {
      Share.share({
        message: `Paga usando este enlace: ${paymentUrl}`,
        url: paymentUrl,
        title: 'Pago por correo electrónico'
      });
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(paymentUrl);
    ToastAndroid.showWithGravity('Enlace copiado al portapapeles', ToastAndroid.SHORT, ToastAndroid.CENTER);
  };

  const displayPaymentUrl = () => {
    let displayedUrl = paymentUrl.startsWith('https://') ? paymentUrl.slice(8) : paymentUrl;
    return displayedUrl;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../assets/icono-pago-A.png')} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Solicitud de pago</Text>
            <Text style={styles.amount}>{currencySymbol} {amount}</Text>
            </View>
        </View>
        <Text style={styles.subtitle}>Comparte el enlace de pago con el cliente</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={[styles.card, { width: '80%' }]} onPress={copyToClipboard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/icono-link.png')} style={styles.cardIconLeft} />
            <Text style={styles.cardText}>{displayPaymentUrl()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('QRCodeScreen', { paymentUrl, identifier, amount, currencySymbol })}>
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRCodeScreen', { paymentUrl, identifier, amount, currencySymbol })}>
          <Image source={require('../assets/icono-qr.png')} style={styles.cardIconRightOutside} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => sharePayment('email')}>
        <Image source={require('../assets/icono-flecha.png')} style={styles.cardIconLeft} />
        <Text style={styles.cardText}>Enviar por correo electrónico </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => setShowWhatsappInput(true)}>
        <Image source={require('../assets/icono-wsp.png')} style={styles.cardIconLeft} />
        {!showWhatsappInput ? (
          <Text style={styles.cardText}>Enviar a número de Whatsapp</Text>
        ) : (
          <View style={styles.whatsappContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.countryButton}>
              {selectedCountry ? (
                <View style={styles.selectedCountryContainer}>
                  <Text style={styles.selectedCountryText}>{selectedCountry.code}</Text>
                  <Image source={require('../assets/arrow-down.png')} style={styles.arrowDownIcon} />
                </View>
              ) : (
                <Image source={require('../assets/arrow-down.png')} style={styles.arrowDownIcon} />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={12}
            />
            <TouchableOpacity onPress={() => sharePayment('whatsapp')} style={styles.sendButton}>
              <Image source={require('../assets/enviar.png')} style={{ height: 28, width: 60, borderRadius: 5 }} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => sharePayment('other')}>
        <Image source={require('../assets/icono-export.png')} style={styles.cardIconLeft} />
        <Text style={styles.cardText}>Compartir con otras aplicaciones</Text>
      </TouchableOpacity>

      <View style={styles.newRequestButtonContainer}>
        <TouchableOpacity style={styles.newRequestButton} onPress={() => navigation.navigate('CreatePayment')}>
          <View style={styles.buttonContent}>
            <Image source={require('../assets/nr.png')} style={styles.buttonIcon} />
            <Text style={styles.newRequestButtonText}>Nueva Solicitud</Text>
          </View>
        </TouchableOpacity>
      </View>

      <CountrySelectionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          setModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop:35,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    color: '#778899',

  },
  amount: {
    fontWeight:'bold',
    fontSize: 36,
    color: '#191970',
  },
  subtitle: {
    fontSize: 16,
    color: 'grey',
    marginTop: 10,
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
    flex: 1,
    marginLeft: 10,
  },
  cardIconLeft: {
    width: 25,
    height: 25,
  },
  cardIconRightOutside: {
    width: 60,
    height: 60,

  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    padding: 5,
    marginRight: 10,
    flex: 1,
    fontSize: 20, // Aumenta el tamaño de la fuente en 2 puntos
    borderBottomWidth: 0, // Eliminar el borde
  },
  arrowDownIcon: {
    width: 15,
    height: 15,
  },
  selectedCountryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCountryText: {
    marginRight: 8,
    fontSize: 16,
  },
  newRequestButton: {
    backgroundColor: 'white', // Fondo blanco para sombreado
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Elevación para sombra en Android
  },
  newRequestButtonText: {
    color: '#0000cd', // Color azul para el texto
    fontSize: 18,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  sendButton: {
    width: 100, // Haz el botón de enviar más ancho
    justifyContent: 'center',
    alignItems: 'center',
  },
  newRequestButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});

export default SharePaymentScreen;