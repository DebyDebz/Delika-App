import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text, Image, Modal, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import Menu from '../components/Menu';
import TotalRevenue from '../components/TotalRevenue';
import TotalOrders from '../components/TotalOrders';
import TotalMenu from '../components/TotalMenu';
import { router } from 'expo-router';
import MostSelling from '../components/MostSelling';
import { useNotification } from '../context/NotificationContext';
import Broadcast from '../components/broadcast';
import { BlurView } from 'expo-blur';
import NotificationModal from '../components/NotificationModal';
import NotificationIcon from '../components/NotificationIcon';
import { Color } from '@/constants/GlobalStyles';

declare global {
  var userData: any;
  var dashboardData: any;
}

export default function HomeScreen() {
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: '',
    branchLocation: '',
    image: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const toggleMenu = () => {
    const toValue = showMenu ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const checkUserData = async () => {
      if (!globalThis.userData) {
        router.replace('/');
        return;
      }

      setRestaurantData({
        restaurantName: globalThis.userData._restaurantTable[0].restaurantName || 'No Name',
        branchLocation: globalThis.userData.branchesTable.branchLocation || 'No Location',
        image: globalThis.userData.image?.url || ''
      });

      // Immediately fetch dashboard data if userData exists
      fetchDashboardData(selectedDate);
    };

    checkUserData();
  }, []);

  const formatSelectedDate = (date: Date) => {
    return `Today, ${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.timestamp)); // Update selected date
    setShowCalendar(false); // Close calendar
    fetchDashboardData(new Date(day.timestamp)); // Fetch data for the selected date immediately
  };

  const fetchDashboardData = async (date: Date) => {
    try {
      console.log('Inside fetchDashboardData'); // Log function entry
      console.log('Current selectedDate:', date); // Log current selected date

      if (!globalThis.userData?.restaurantId || !globalThis.userData?.branchId) {
        console.error('Missing required IDs:', {
          restaurantId: globalThis.userData?.restaurantId,
          branchId: globalThis.userData?.branchId
        });
        return;
      }

      const restaurantId = globalThis.userData.restaurantId;
      const branchId = globalThis.userData.branchId;

      const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
      console.log('Fetching with date:', formattedDate); // Debug log

      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          branchId,
          date: formattedDate // Include the formatted date in the request body
        })
      });

      const data = await response.json();
      console.log('Dashboard data:', data);

      if (data) {
        setDashboardData(data); // Update state with fetched data
        globalThis.dashboardData = data; // Keep this if you need global access
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchMostSellingItems = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      console.log('Fetching most selling items for date:', formattedDate);

      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: globalThis.userData.restaurantId,
          branchId: globalThis.userData.branchId,
          date: formattedDate
        })
      });

      const data = await response.json();
      console.log('Most selling items data:', data);
      return data;
    } catch (error) {
      console.error('Most selling items fetch error:', error);
      return null;
    }
  };

  const handleNotificationPress = () => {
    if (showNotificationModal) {
      // Close the modal
      Animated.timing(slideAnim, {
        toValue: 0, // Move to original position
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowNotificationModal(false));
    } else {
      // Open the modal
      setShowNotificationModal(true);
      slideAnim.setValue(-100); // Start off-screen
      Animated.timing(slideAnim, {
        toValue: 0, // Move to visible position
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.textContainer}>
            <Text style={styles.restaurantName}>
              {globalThis.userData?._restaurantTable[0].restaurantName}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#666666" />
              <Text style={styles.location}>
                {globalThis.userData?.branchesTable.branchLocation}
              </Text>
            </View>
          </View>
          <View style={styles.rightContainer}>
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity onPress={handleNotificationPress} style={{ marginLeft: 5 }}>
                <NotificationIcon color={Color.otherOrange} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              {globalThis.userData?.image?.url && (
                <Image 
                  source={{ uri: globalThis.userData.image.url }} 
                  style={styles.profileImage}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Broadcast />

        <View style={styles.bottomSection}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Choose Date</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
              <Ionicons name="calendar-outline" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={[styles.menuButton, { marginLeft: 10 }]}>
            <View style={styles.menuGrid}>
              <View style={styles.menuRow}>
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
              </View>
              <View style={styles.menuRow}>
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSection}>
          <View style={styles.todayContainer}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={16} color="#000000" />
            </View>
            <Text style={styles.todayText}>{formatSelectedDate(selectedDate)}</Text>
          </View>
        </View>
      </View>

      {/* Horizontal ScrollView for Total Revenue, Total Orders, and Total Menu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
        <TotalRevenue />
        <TotalOrders />
        <TotalMenu /> 
      </ScrollView>

      {showMenu && (
        <TouchableOpacity 
          style={styles.blurOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <BlurView
            intensity={20}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
        </TouchableOpacity>
      )}

      {showMenu && (
        <Animated.View style={styles.menuContainer}>
          <Menu onClose={() => setShowMenu(false)} />
        </Animated.View>
      )}

      {showCalendar && (
        <Modal transparent={true} animationType="slide" visible={showCalendar}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDayPress}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#FE5B18',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#FE5B18',
                  dayTextColor: '#2d4150',
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <View style={styles.paymentContainer}>
        <MostSelling />
      </View>

      {showNotificationModal && (
        <Animated.View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          elevation: 5,
          zIndex: 1000,
        }}>
          {/* Your notification content goes here */}
          <Text>Your notifications</Text>
          <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    marginTop: 10,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
  },
  restaurantName: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    color: '#666666',
    fontSize: 16,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    color: '#1A1A1A',
    fontSize: 16,
  },
  menuButton: {
    backgroundColor: '#FE5B18',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  menuGrid: {
    gap: 4,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 4,
  },
  menuDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  dateSection: {
    marginTop: 3,
    paddingLeft: 5,
  },
  todayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  todayText: {
    color: '#1A1A1A',
    fontSize: 16,
  },
  checkmarkContainer: {
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  paymentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    marginTop: -400,
  },
  cardsContainer: {
    paddingVertical: 10,
  },
  cardContainer: {
    marginRight: 10,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
