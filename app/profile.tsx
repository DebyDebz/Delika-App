import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Color } from '../constants/GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface UserData {
  id: string;
  email: string;
  role: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  dateOfBirth: string;
  image: { url: string } | null;
  _restaurantTable: Array<{ restaurantName: string }>;
  branchesTable: {
    branchName: string;
    branchLocation: string;
  };
}

// Component
export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Color.otherOrange} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Unable to load profile data</Text>
      </View>
    );
  }

  // Render sections
  const renderInfoRow = (icon: keyof typeof MaterialIcons.glyphMap, label: string, value: string) => (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#818783" />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const renderSection = (title: string, icon: keyof typeof MaterialIcons.glyphMap, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={22} color={Color.otherOrange} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={28} color={'#2D3436'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.spacer} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={userData.image?.url ? { uri: userData.image.url } : require('../assets/images/logo.png')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{userData.fullName}</Text>
            <View style={styles.roleContainer}>
              <MaterialCommunityIcons name="shield-account" size={16} color={Color.otherOrange} />
              <Text style={styles.role}>{userData.role}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        {renderSection('Restaurant Details', 'restaurant', <>
          {renderInfoRow('business', 'Restaurant', userData._restaurantTable[0]?.restaurantName)}
          {renderInfoRow('store', 'Branch', userData.branchesTable?.branchName)}
          {renderInfoRow('place', 'Location', userData.branchesTable?.branchLocation)}
        </>)}

        {/* Contact Info */}
        {renderSection('Contact Information', 'contacts', <>
          {renderInfoRow('email', 'Email', userData.email)}
          {renderInfoRow('phone', 'Phone', userData.phoneNumber)}
        </>)}

        {/* Address Info */}
        {renderSection('Address', 'location-on', <>
          {renderInfoRow('home', 'Street', userData.address)}
          {renderInfoRow('location-city', 'City', userData.city)}
          {renderInfoRow('local-post-office', 'Postal Code', userData.postalCode)}
        </>)}
      </ScrollView>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 25,
    borderWidth: 2,
    borderColor: Color.otherOrange,
    backgroundColor: '#F5F5F5',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#2D3436',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  role: {
    color: Color.otherOrange,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: '#2D3436',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F7',
  },
  label: {
    color: '#818783',
    fontSize: 15,
    marginLeft: 15,
    flex: 1,
    fontWeight: '500',
  },
  value: {
    color: '#2D3436',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
    paddingLeft: 10,
    fontWeight: '500',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    color: '#2D3436',
    fontSize: 20,
    fontWeight: '700',
  },
  spacer: {
    width: 28,
  },
});
