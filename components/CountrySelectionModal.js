import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal, SafeAreaView } from 'react-native';

const countries = [
  { name: 'España', code: '+34', flag: require('../assets/flags/esp.png'), key: 1 },
  { name: 'Equatorial Guinea', code: '+240', flag: require('../assets/flags/gui.png'), key: 2 },
  { name: 'Grecia', code: '+30', flag: require('../assets/flags/gre.png'), key: 3 },
  { name: 'south georgia and south sandwich islands', code: '+500', flag: require('../assets/flags/uk.png'), key: 4 },
  { name: 'Guatemala', code: '+502', flag: require('../assets/flags/gua.png'), key: 5 },
  { name: 'Guyana', code: '+592', flag: require('../assets/flags/guy.png'), key: 6 },
  { name: 'Hong Kong', code: '+852', flag: require('../assets/flags/hok.png'), key: 7 },
  { name: 'Honduras', code: '+504', flag: require('../assets/flags/hon.png'), key: 8 },
 // { name: 'Argentina', code: '+54', flag: require('../assets/flags/hon.png'), key: 8 },


];

const CountrySelectionModal = ({ visible, onClose, onSelectCountry }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView>
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Image source={require('../assets/icon-back.png')} style={styles.arrowBackIcon} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Seleccionar país</Text>
        </View>
        <View style={styles.searchContainer}>
          <Image source={require('../assets/lupa.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar país"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.countryItem}
              onPress={() => {
                setSelectedCountry(item);
                onSelectCountry(item);
              }}
            >
              <Image source={item.flag} style={styles.countryFlag} />
              <View style={styles.countryTextContainer}>
                <Text style={styles.countryText}>{item.name}</Text>
                <Text style={styles.countryCode}>{item.code}</Text>
              </View>
              <Image
                source={selectedCountry?.code === item.code
                  ? require('../assets/ok.png')
                  : require('../assets/arrow-right.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  </SafeAreaView> 
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
    color:'#000060',
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
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  countryFlag: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  countryTextContainer: {
    flex: 1,
  },
  countryText: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 14,
    color: 'grey',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
});

export default CountrySelectionModal;
