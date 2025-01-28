import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../constants/GlobalStyles';

interface MenuProps {
  onClose: () => void;
}

export default function Menu({ onClose }: MenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const pathname = usePathname();
  const ANIMATION_DURATION = -300; // Consistent animation duration

  // Open animation
  useEffect(() => {
    const loadActiveIndex = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('activeMenuIndex');
        if (savedIndex !== null) {
          setActiveIndex(parseInt(savedIndex));
        }
      } catch (error) {
        console.error('Error loading active index:', error);
      }
    };
    loadActiveIndex();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load saved active index on mount
  useEffect(() => {
    const loadActiveIndex = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('activeMenuIndex');
        if (savedIndex !== null) {
          setActiveIndex(parseInt(savedIndex));
        }
      } catch (error) {
        console.error('Error loading active index:', error);
      }
    };
    loadActiveIndex();
  }, []);

  // Update active index when route changes
  useEffect(() => {
    const menuIndex = filteredMenuItems.findIndex(item => item.route === pathname);
    if (menuIndex !== -1) {
      setActiveIndex(menuIndex);
      AsyncStorage.setItem('activeMenuIndex', menuIndex.toString());
    }
  }, [pathname]);

  const menuItems = [
    { 
      icon: require('../assets/images/overview.png'),
      label: 'Overview', 
      route: '/home',
      description: 'Dashboard',
      permission: 'canViewOverview'
    },
    { 
      icon: require('../assets/images/my orders.png'),
      label: 'My Orders', 
      route: '/orders',
      description: 'Manage Orders',
      alwaysShow: true
    },
    { 
      icon: require('../assets/images/menu.png'),
      label: 'Menu Items', 
      route: '/menu-items',
      description: 'Food & Categories',
      permission: 'canViewInventory'
    },
    { 
      icon: require('../assets/images/staff.png'),
      label: 'Staff', 
      route: '/staff-members',
      description: 'Team Management',
      alwaysShow: true
    },
    { 
      icon: require('../assets/images/transaction.png'),
      label: 'Transactions', 
      route: '/transactions',
      description: 'Payment History',
      permission: 'canViewTransactions'
    },
    { 
      icon: require('../assets/images/report.png'),
      label: 'Reports', 
      route: '/menu_report',
      description: 'Analytics & Stats',
      permission: 'canViewReports'
    },
    { 
      icon: require('../assets/images/setting.png'),
      label: 'Settings', 
      route: '/settings',
      description: 'App Configuration',
      alwaysShow: true
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    try {
      // If no permissions object exists or item is marked as alwaysShow, show the item
      if (!globalThis.userData?.permissions || item.alwaysShow) {
        return true;
      }
      
      // If item requires permission and it's restricted (false), hide it
      if (item.permission) {
        return globalThis.userData.permissions[item.permission as keyof typeof globalThis.userData.permissions];
      }
      
      return true;
    } catch (error) {
      console.error('Error filtering menu item:', error);
      return true; // Show item on error
    }
  });

  // Handle close with synchronized animation
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => onClose(), ANIMATION_DURATION / 2);
    });
  };

  const handlePress = async (route: string, index: number) => {
    try {
      // ... permission checks ...

      setActiveIndex(index);
      await AsyncStorage.setItem('activeMenuIndex', index.toString());
      
      if (pathname !== route) {
        router.push(route as any);
      }
      handleClose();
      
    } catch (error) {
      console.error('Error handling menu press:', error);
    }
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
        {filteredMenuItems.map((item, index) => (
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
    flex: 1,
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