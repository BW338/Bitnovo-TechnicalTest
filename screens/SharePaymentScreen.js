import React, { useEffect, useState } from 'react';
import { View, Text, Share, StyleSheet, Image, TextInput, TouchableOpacity, ToastAndroid, Modal, Linking, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import CountrySelectionModal from '../components/CountrySelectionModal';

const SharePaymentScreen = ({ route }) => {
  const { paymentUrl, identifier, amount, currency, currencySymbol } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('Pendiente');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const navigation = useNavigation();

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

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d+$/; // Puedes ajustar este regex según el formato de los números de teléfono válidos en tu país
    return phoneRegex.test(phoneNumber);
  };

  const sharePayment = (method) => {
    const completePhoneNumber = selectedCountry ? `${selectedCountry.code}${phoneNumber}` : phoneNumber;

    if (method === 'whatsapp') {
      if (!completePhoneNumber || !isValidPhoneNumber(phoneNumber)) {
        showToast('Por favor, ingrese un número de teléfono válido');
        return;
      }

      const message = `¡Hola! Aquí está tu enlace de pago: ${paymentUrl}`;
      const url = `https://wa.me/${completePhoneNumber}?text=${encodeURIComponent(message)}`;

      Linking.openURL(url)
        .then(() => {
          console.log('Mensaje de WhatsApp enviado');
          setIsMessageSent(true);

          // Demorar la muestra del modal 1 segundo
          setTimeout(() => {
            setConfirmationModalVisible(true);
          }, 1000);
        })
        .catch((error) => {
          console.log('Error al enviar mensaje de WhatsApp', error);
        });
    } else if (method === 'email' || method === 'other') {
      Share.share({
        message: `Paga usando este enlace: ${paymentUrl}`,
        url: paymentUrl,
        title: 'Pago por correo electrónico'
      })
      .then(() => {
        setIsMessageSent(true);
        // Aquí no se muestra el modal de confirmación
      })
      .catch((error) => console.log('Error al compartir', error));
    }
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
    } else {
      Alert.alert('Notificación', message);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(paymentUrl);
    showToast('Enlace copiado al portapapeles');
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

  <View style={{ justifyContent:'space-between', flex:2}}>
   
     <View >
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
        <Text style={styles.cardText}>Enviar por correo electrónico</Text>
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
    </View>
   
      <View style={styles.newRequestButtonContainer}>
        <TouchableOpacity style={styles.newRequestButton} onPress={() => navigation.navigate('CreatePayment')}>
          <View style={styles.buttonContent}>
            <Image source={require('../assets/nr.png')} style={styles.buttonIcon} />
            <Text style={styles.newRequestButtonText}>Nueva Solicitud</Text>
          </View>
        </TouchableOpacity>
      </View>
   
    </View> 
    

      <CountrySelectionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          setModalVisible(false);
        }}
      />

      <Modal
        visible={confirmationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={require('../assets/confirmacion.png')} style={styles.modalIcon} />
            {/* <Text style={styles.modalTitle}>Solicitud enviada</Text>
            <Text style={styles.modalMessage}>Tu solicitud de pago enviada ha sido enviado con éxito por WhatsApp.</Text> */}
            <TouchableOpacity onPress={() => setConfirmationModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 35,
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
    fontWeight: 'bold',
    fontSize: 36,
    color: '#191970',
  },
  subtitle: {
    fontSize: 16,
    color: '#778899',
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIconLeft: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  cardIconRightOutside: {
    width: 50,
    height: 50,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 5,
    marginRight: 5,
  },
  selectedCountryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCountryText: {
    fontSize: 16,
    marginRight: 5,
  },
  arrowDownIcon: {
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  newRequestButtonContainer: {
    flexDirection: 'row',
  //  borderWidth:2,
    justifyContent: 'center',
    marginTop: 20,
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  newRequestButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalIcon: {
    width: 250,
    height: 150,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default SharePaymentScreen;