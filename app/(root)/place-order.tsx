import PlaceOrder from '../../components/PlaceOrder';
import { Stack } from 'expo-router';

export default function PlaceOrderScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <PlaceOrder />
    </>
  );
} 