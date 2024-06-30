import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const PaymentStatusScreen = ({ route }) => {
  const { identifier } = route.params;
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/merchant/${identifier}`);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'completed') {
        setPaymentStatus('completed');
      }
    };

    return () => socket.close();
  }, []);

  return (
    <View>
      {paymentStatus === 'pending' ? (
        <Text>Esperando pago...</Text>
      ) : (
        <Text>Pago completado</Text>
      )}
    </View>
  );
};

export default PaymentStatusScreen;
