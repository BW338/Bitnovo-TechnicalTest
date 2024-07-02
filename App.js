import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreatePaymentScreen from './screens/CreatePaymentScreen';
import SharePaymentScreen from './screens/SharePaymentScreen';
import PaymentStatusScreen from './screens/PaymentStatusScreen';
import QRCodeScreen from './screens/QRCodeScreen';
import PaymentCompletedScreen from './screens/PaymentCompletedScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CreatePayment">
        <Stack.Screen
          name="CreatePayment"
          component={CreatePaymentScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="SharePaymentScreen"
          component={SharePaymentScreen}
          options={{ headerShown: false }} />

        <Stack.Screen name="PaymentStatus"
          component={PaymentStatusScreen} />

        <Stack.Screen name="PaymentCompleted"
          component={PaymentCompletedScreen}
          options={{ headerShown: false }} />

        <Stack.Screen name="QRCodeScreen"
          component={QRCodeScreen}
          options={{ headerShown: false }} />

      

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

