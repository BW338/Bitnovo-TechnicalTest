// CreatePaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CurrencySelectionModal from '../components/CurrencySelectionModal'; // Importa el nuevo modal

const CreatePaymentScreen = () => {
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [currency, setCurrency] = useState({ code: 'GBP', symbol: '£' }); // Estado inicial con GBP
  const [modalVisible, setModalVisible] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const deviceId = '5afdb46a-0386-47af-84b5-02b04e1421e4'; 
  const navigation = useNavigation();

  useEffect(() => {
    // Habilitar el botón cuando los campos requeridos están completos
    if (amount && concept && currency) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  }, [amount, concept, currency]);

  useEffect(() => {
    const getCurrencies = async () => {
      try {
        const url = 'https://payments.pre-bnvo.com/api/v1/currencies';
        const headers = {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          'Authorization': 'Basic ' + btoa('guidoamadio88@gmail.com:12233Qwwee')
        };

        const response = await axios.get(url, { headers });
        console.log('Respuesta de getCurrencies:', response.data); 
        setCurrencies(response.data);
      } catch (error) {
        console.error('Error al obtener criptomonedas:', error);
      }
    };

    getCurrencies();
  }, [deviceId]);

  const createPayment = async () => {
    try {
      const url = 'https://payments.pre-bnvo.com/api/v1/orders/';
      const paymentData = {
        expected_output_amount: parseFloat(amount),
        fiat: currency.code, 
        merchant_urlko: 'http://example.com/failure',
        merchant_urlok: 'http://example.com/success',
        merchant_url_standby: 'http://example.com/standby',
        notes: concept,
        reference: 'Test Payment'
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        'Authorization': 'Basic ' + btoa('guidoamadio88@gmail.com:12233Qwwee')
      };
  
      const response = await axios.post(url, paymentData, { headers });
  
      console.log('Respuesta del servidor:', response.data);
      if (response.status === 200) {
        navigation.navigate('SharePaymentScreen', 
            { paymentUrl: response.data.web_url , 
              amount,
              identifier: response.data.identifier, 
            });
      }
  
    } catch (error) {
      if (error.response) {
        console.error('Error en la respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        console.error('Encabezados de respuesta:', error.response.headers);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error en la configuración de la solicitud:', error.message);
      }
    }
  };
  
  // Función para obtener el símbolo de la divisa seleccionada
  const getCurrencySymbol = () => {
    return currency.symbol;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <Text style={styles.title}>Crear Pago</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.currencyButton}>
          <Text style={styles.currencyText}>{currency.code}</Text>
          <Image source={require('../assets/arrow-down.png')} style={{height:20, width:20}}  />
        </TouchableOpacity>
      </View>

      <CurrencySelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCurrency={(currency) => {
          setCurrency(currency);
          setModalVisible(false);
        }}
      />

      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>

        <TextInput
          value={amount}
          onChangeText={(text) => {
            if (text.length <= 7) {
              const formattedText = text.replace(/[^0-9,.]/g, '');
              setAmount(formattedText);
            }
          }}
          placeholder="0.00"
          keyboardType="numeric"
          style={[styles.amountText, { width: amount ? amount.length * 25 : 40 }]} 
          maxLength={7} 
        />
      </View>

      <Text style={styles.label}>Concepto</Text>
      <TextInput
        value={concept}
        onChangeText={setConcept}
        placeholder="Añade descripción de pago"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Continuar"
          onPress={createPayment}
          disabled={!isButtonEnabled}
          color={isButtonEnabled ? '#000' : '#ccc'}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  header: {
    marginTop: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  currencyButton: {
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#dcdcdc',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  currencyText: {
    fontSize: 14,
    marginRight: 8
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  amountText: {
    fontSize: 56,
    color: '#ccc',
    textAlign: 'center',
  },
  currencySymbol: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 0
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 5
  },
  buttonContainer: {
    marginBottom: 30
  }
});

export default CreatePaymentScreen;
