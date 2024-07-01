// CurrencySelectionModal.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal } from 'react-native';

const currencies = [
  { name: 'Euro', code: 'EUR', symbol: '€', flag: require('../assets/flags/eur.png'), key: 1 },
  { name: 'Dólar Estadounidense', code: 'USD', symbol: '$', flag: require('../assets/flags/usd.png'), key: 2 },
  { name: 'Libra Esterlina', code: 'GBP', symbol: '£', flag: require('../assets/flags/uk.png'), key: 3 },
];

const CurrencySelectionModal = ({ visible, onClose, onSelectCurrency }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Image source={require('../assets/icon-back.png')} style={styles.arrowBackIcon} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Seleccionar divisa</Text>
        </View>
        <View style={styles.searchContainer}>
          <Image source={require('../assets/lupa.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar divisa"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.currencyItem}
              onPress={() => {
                setSelectedCurrency(item);
                onSelectCurrency(item);
              }}
            >
              <Image source={item.flag} style={styles.currencyFlag} />
              <View style={styles.currencyTextContainer}>
                <Text style={styles.currencyText}>{item.name}</Text>
                <Text style={styles.currencyCode}>{item.code}</Text>
              </View>
              <Image
                source={selectedCurrency?.code === item.code
                  ? require('../assets/ok.png')
                  : require('../assets/arrow-right.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBackIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  currencyFlag: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  currencyTextContainer: {
    flex: 1,
  },
  currencyText: {
    fontSize: 16,
  },
  currencyCode: {
    fontSize: 14,
    color: 'grey',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
});

export default CurrencySelectionModal;
