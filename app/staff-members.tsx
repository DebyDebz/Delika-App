import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import Staff from '@/components/staff';

const TeamManagement = () => {
  const navigation = useNavigation();

  const restaurantId = "your-restaurant-id";
  const branchId = "your-branch-id";

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Staff 
        restaurantId={restaurantId}
        branchId={branchId}
      />
    </View>
  );
};

export default TeamManagement;
