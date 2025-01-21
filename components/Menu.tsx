import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../constants/GlobalStyles';

interface MenuProps {
  onClose: () => void;
}

export default function Menu({ onClose }: MenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 15,
      bounciness: 5
    }).start();

    const loadActiveIndex = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('activeMenuIndex');
        if (savedIndex !== null) {
          setActiveIndex(Number(savedIndex));
        }
      } catch (error) {
        console.error('Error loading active index:', error);
      }
    };
    loadActiveIndex();
  }, []);

  const menuItems = [
    { 
      icon: require('../assets/images/overview.png'),
      label: 'Overview', 
      route: '/home',
      description: 'Dashboard & Analytics'
    },
    { 
      icon: require('../assets/images/my orders.png'),
      label: 'My Orders', 
      route: '/orders',
      description: 'Manage Orders'
    },
    { 
      icon: require('../assets/images/menu.png'),
      label: 'Menu Items', 
      route: '/menu-items',
      description: 'Food & Categories'
    },
    { 
      icon: require('../assets/images/staff.png'),
      label: 'Staff', 
      route: '/staff-members',
      description: 'Team Management'
    },
    { 
      icon: require('../assets/images/transaction.png'),
      label: 'Transactions', 
      route: '/transactions',
      description: 'Payment History'
    },
    { 
      icon: require('../assets/images/report.png'),
      label: 'Reports', 
      route: '/menu_report',
      description: 'Business Analytics'
    },
    { 
      icon: require('../assets/images/setting.png'),
      label: 'Settings', 
      route: '/settings',
      description: 'App Configuration'
    },
  ];

  const handlePress = async (route: string, index: number) => {
    setActiveIndex(index);
    try {
      await AsyncStorage.setItem('activeMenuIndex', index.toString());
    } catch (error) {
      console.error('Error saving active index:', error);
    }
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.clear();
      
      // Reset any global variables if they exist
      if (globalThis.userData) {
        globalThis.userData = null;
      }

      // Close the menu
      onClose();

      // Navigate to login screen
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
          />
        </View>
        
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.menuItem,
              activeIndex === index && styles.activeItem
            ]}
            onPress={() => handlePress(item.route, index)}
          >
            <View style={[
              styles.iconWrapper,
              activeIndex === index && styles.activeIconWrapper
            ]}>
              <Image 
                source={item.icon}
                style={[
                  styles.menuIcon,
                  activeIndex === index && styles.activeIcon
                ]}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.menuText,
                activeIndex === index && styles.activeText
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.menuDescription,
                activeIndex === index && styles.activeDescription
              ]}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Image 
          source={require('../assets/images/setting.png')} 
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    paddingTop: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    //backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 4,
    //elevation: 3,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 5,
    borderRadius: 12,
  },
  activeItem: {
    backgroundColor: Color.otherOrange + '10',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: Color.otherOrange,
  },
  menuIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#666666',
  },
  activeIcon: {
    tintColor: '#FFFFFF',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  activeText: {
    color: Color.otherOrange,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666666',
  },
  activeDescription: {
    color: Color.otherOrange + '99',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FF3B30',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
}); 