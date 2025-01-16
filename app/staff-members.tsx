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
      <View style={{ backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 } }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', gap: 35 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ padding: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>
              Team Management
            </Text>
          </View>
        </View>
      </View>

      <Staff 
        restaurantId={restaurantId}
        branchId={branchId}
      />
    </View>
  );
};

export default TeamManagement;
