import PlaceOrderItems from '../../components/PlaceOrderItems';
import { useRouter } from 'expo-router';

export default function PlaceOrderItemsScreen() {
  const router = useRouter();
  
  return (
    <PlaceOrderItems 
      name="Test Item"
      price={100}
      quantity={5}
      imageUrl=""
      inStock="1"
      onSelect={() => router.back()}
    />
  );
} 