import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CurrencySelectionModal from '../components/CurrencySelectionModal';

const CreatePaymentScreen = () => {
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [currency, setCurrency] = useState({ code: 'EUR', symbol: '€' });
  const [modalVisible, setModalVisible] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [title, setTitle] = useState('Crear Pago'); // Estado para el título
  const deviceId = '5afdb46a-0386-47af-84b5-02b04e1421e4';
  const navigation = useNavigation();

  useEffect(() => {
    setIsButtonEnabled(amount && concept && currency);
  }, [amount, concept, currency]);

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

      if (response.status === 200) {
        navigation.navigate('SharePaymentScreen', {
          paymentUrl: response.data.web_url,
          amount,
          identifier: response.data.identifier,
          currencySymbol: currency.symbol
        });
      }
    } catch (error) {
      if (error.response) {
        console.error('Server response error:', error.response.data);
      } else if (error.request) {
        console.error('No response from server:', error.request);
      } else {
        console.error('Request configuration error:', error.message);
      }
    }
  };
  

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setTitle('Importe a pagar');
            }}
            style={styles.currencyButton}
          >
            <Text style={styles.currencyText}>{currency.code}</Text>
            <Image source={require('../assets/arrow-down.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
        <View style ={{ justifyContent: 'space-between', flex:2, marginBottom:12}}>
   
        <View>
          <CurrencySelectionModal
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
            }}
            onSelectCurrency={(selectedCurrency) => {
              setCurrency(selectedCurrency);
              setModalVisible(false);
            }}
            initialSelectedCurrency={currency}
          />

          <View style={styles.amountContainer}>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                if (text.length <= 7) {
                  setAmount(text.replace(/[^0-9,.]/g, ''));
                }
              }}
              placeholder="0"
              placeholderTextColor={amount ? '#1e90ff' : '#ccc'}
              keyboardType="numeric"
              style={[
                styles.amountText,
                amount ? styles.activeText : styles.inactiveText,
                { width: amount ? (amount.length + 1) * 28 : 60 }
              ]}
              maxLength={7}
            />
            <Text style={[styles.currencySymbol, amount ? styles.activeText : styles.inactiveText]}>
              {currency.symbol}
            </Text>
          </View>

          <View>
            <Text style={styles.label}>Concepto</Text>
            <TextInput
              value={concept}
              onChangeText={setConcept}
              placeholder="Añade descripción de pago"
              style={styles.input}
              multiline
              maxLength={140}
            />
            {concept.length > 0 && <Text style={styles.charCount}>{`${concept.length}/140 caracteres`}</Text>}
          </View>
        </View>
          
        <View style={styles.buttonContainer}>
          <Button
            title="Continuar"
            onPress={createPayment}
            disabled={!isButtonEnabled}
            color={isButtonEnabled ? '#00008B' : '#1e90ff'}
          />
        </View>
        </View>

      </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    marginTop: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    color:"#000060",
    fontSize: 20,
    fontWeight: 'bold',
    position: 'center',
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
    color:'#000060',
    fontSize: 14,
    marginRight: 8
  },
  arrowIcon: {
    height: 20,
    width: 20,
  },
  amountContainer: {
    marginTop:40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 56,
    textAlign: 'center',
    marginLeft: 5,
    paddingHorizontal: 2
  },
  activeText: {
    color: '#00008B',
  },
  inactiveText: {
    color: '#ccc',
  },
  label: {
    color:"#000080",
    fontSize: 18,
    marginBottom: 4
  },
  input: {
    fontSize:16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 4,
    borderRadius: 5
  },
  charCount: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    marginBottom: 30,
  }
});

export default CreatePaymentScreen;
