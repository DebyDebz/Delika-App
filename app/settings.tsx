import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch,
  Image,
  Platform,
  Alert
} from 'react-native';
import { 
  MaterialIcons, 
  Ionicons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { Color } from '../constants/GlobalStyles';
import EditProfile from '../components/EditProfile';
import NotificationModal from '../components/NotificationModal';
import PrivacyScreen from './privacy';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface SettingItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress?: () => void;
  showArrow?: boolean;
  value?: string | boolean;
  isSwitch?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const settingsSections: {title: string, items: SettingItem[]}[] = [
    {
      title: 'Account',
      items: [
        {
          icon: <MaterialIcons name="person-outline" size={24} color={Color.otherOrange} />,
          label: 'Edit Profile',
          description: 'Update your personal information',
          onPress: () => {
            console.log('Navigating to profile edit');
            router.push('/profile-edit');
          },
          showArrow: true
        },
        {
          icon: <MaterialIcons name="notifications-none" size={24} color={Color.otherOrange} />,
          label: 'Notifications',
          description: 'Manage your notifications',
          onPress: () => setShowNotifications(true),
          showArrow: true
        },
        {
          icon: <MaterialIcons name="lock-outline" size={24} color={Color.otherOrange} />,
          label: 'Privacy',
          description: 'Control your privacy settings',
          onPress: () => {
            console.log('Navigating to privacy');
            router.push('/privacy');
          },
          showArrow: true
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Ionicons name="language-outline" size={24} color={Color.otherOrange} />,
          label: 'Language',
          description: 'Choose your preferred language',
          value: 'English',
          onPress: () => {},
          showArrow: true
        },
        {
          icon: <MaterialIcons name="dark-mode" size={24} color="#CCCCCC" />,
          label: 'Dark Mode',
          description: 'Coming soon',
          isSwitch: true,
          value: false,
          onValueChange: () => {},
          disabled: true
        }
      ]
    },
    {
      title: 'Support & About',
      items: [
        {
          icon: <MaterialIcons name="help-outline" size={24} color={Color.otherOrange} />,
          label: 'Help & Support',
          description: 'Get help and contact support',
          onPress: () => {
            console.log('Navigating to Help & Support');
            router.push('/help-support');
          },
          showArrow: true
        },
        {
          icon: <MaterialIcons name="info-outline" size={24} color={Color.otherOrange} />,
          label: 'About Us',
          description: 'Learn more about Delika',
          onPress: () => {
            console.log('Navigating to About Us');
            router.push('/about-us');
          },
          showArrow: true
        },
        {
          icon: <MaterialIcons name="policy" size={24} color={Color.otherOrange} />,
          label: 'Terms & Privacy Policy',
          description: 'Read our terms and conditions',
          onPress: () => {
            console.log ('navigating to term & condition');
            router.push ('/terms')
          },
          showArrow: true
        }
      ]
    }
  ];

  const handleDeleteAccount = async () => {
    try {
      const userId = globalThis.userData?.id;
      if (!userId) {
        Alert.alert('Error', 'Unable to find user information');
        return;
      }

      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_user_table/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        // Clear all data
        await AsyncStorage.clear();
        const userData = globalThis.userData; // Store before deleting for logging
        delete globalThis.userData;
        delete globalThis.ordersData;
        delete globalThis.dashboardData;
        delete globalThis.refreshOrders;
        console.log('Deleted user data:', userData); // Log the stored data

        Alert.alert('Success', 'Account deleted successfully', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/');
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem
                  ]}
                  onPress={item.onPress}
                  disabled={item.isSwitch}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={styles.iconContainer}>
                      {item.icon}
                    </View>
                    <View style={styles.labelContainer}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.description && (
                        <Text style={styles.settingDescription}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.settingItemRight}>
                    {item.value && !item.isSwitch && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                    {item.isSwitch && (
                      <Switch
                        value={false}
                        onValueChange={() => {}}
                        trackColor={{ false: '#E0E0E0', true: '#E0E0E0' }}
                        thumbColor={'#CCCCCC'}
                        ios_backgroundColor="#E0E0E0"
                        disabled={true}
                      />
                    )}
                    {item.showArrow && (
                      <MaterialIcons name="chevron-right" size={20} color="#666666" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <MaterialIcons name="warning" size={24} color="#DC2626" />
              <Text style={styles.dangerHeaderText}>Delete Account</Text>
            </View>
            <Text style={styles.dangerDescription}>
              This action cannot be undone. All your data will be permanently removed.
            </Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: handleDeleteAccount
                    }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="delete-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
      <NotificationModal 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  dangerSection: {
    padding: 16,
    marginTop: 10,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dangerHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 13,
    marginBottom: 32,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: 16,
    //backgroundColor: '#FFFFFF',
    //borderBottomWidth: 1,
    //borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginRight: 40,  // To center the title accounting for back button
  },
});
