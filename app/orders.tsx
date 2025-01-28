import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Calendar, DateData } from 'react-native-calendars';
import { Color } from '../constants/GlobalStyles';
import AllOrders from '../components/AllOrders';
import Menu from '../components/Menu';
import BranchFilter from '../components/branchFilter';
import NotificationIcon from '../components/NotificationIcon';
import NotificationModal from '../components/NotificationModal';
import { useSelectedBranch } from '../context/SelectedBranchContext';
import Profile from './profile';
import { Stack, router } from 'expo-router';

declare global {
  var userData: any;
  var dashboardData: any;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function Home() {
  const { selectedBranch } = useSelectedBranch();
  const [showMenu, setShowMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userRole] = useState('Admin');
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalMenu: 0
  });
  const [revenueData, setRevenueData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [orders, setOrders] = useState<any[]>([]);
  
  // Updated global data references
  const restaurantName = globalThis.userData?._restaurantTable[0]?.restaurantName || 'Restaurant Name';
  const location = globalThis.userData?.branchesTable?.branchLocation || 'Location Name';
  const profileImage = globalThis.userData?.image?.url || require('../assets/images/logo.png');

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const fetchOrders = async (date: string, branchId?: string) => {
    try {
      const restaurantId = globalThis.userData?._restaurantTable[0]?.id;
      let currentBranchId;

      if (globalThis.userData?.role === 'Admin') {
        // For Admin, use the selected branch ID if provided
        currentBranchId = branchId || globalThis.userData?.branchesTable?.id;
      } else {
        // For non-Admin, always use their assigned branch
        currentBranchId = globalThis.userData?.branchesTable?.id;
      }

      const url = `https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/by/date?restaurantId=${restaurantId}&branchId=${currentBranchId}&date=${date}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDayPress = async (day: DateData) => {
    const newDate = new Date(day.timestamp);
    setSelectedDate(newDate);
    setShowCalendar(false);

    const formattedDate = newDate.toISOString().split('T')[0];
    await fetchOrders(formattedDate);
  };

  const handleBranchSelect = async (branch: any) => {
    setShowBranchFilter(false);
    if (globalThis.userData?.role === 'Admin') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      await fetchOrders(formattedDate, branch.id);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    fetchOrders(formattedDate);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.topSection}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
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

          <View style={styles.rightContainer}>
            <NotificationIcon color={Color.otherOrange} />
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/profile',
                params: { userData: JSON.stringify(globalThis.userData) }
              })}
            >
              <Image 
                source={globalThis.userData?.image?.url 
                  ? { uri: globalThis.userData.image.url } 
                  : require('../assets/images/logo.png')} 
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.restaurantName}>
            {globalThis.userData?._restaurantTable[0].restaurantName}
          </Text>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color={Color.otherOrange} />
            <Text style={styles.location}>
              {globalThis.userData?.branchesTable.branchLocation}
            </Text>
          </View>
        </View>

        <View style={styles.dateSection}>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowCalendar(true)}
          >
            <View style={styles.dateContent}>
            <Feather name="calendar" size={20} color={Color.otherOrange} />
          <Text style={styles.dateText}>{formatSelectedDate(selectedDate)}</Text>
        </View>
        <Feather name="chevron-down" size={20} color={Color.otherOrange} />
      </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <TouchableOpacity 
            style={styles.newOrderButton}
            onPress={() => router.push('/place-order')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.newOrderText}>New Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showBranchFilter && (
        <BranchFilter
          visible={showBranchFilter}
          onClose={() => setShowBranchFilter(false)}
          onSelect={handleBranchSelect}
        />
      )}

      {showMenu && (
        <>
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <BlurView intensity={10} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
          <View style={styles.menuContainer}>
            <Menu onClose={() => setShowMenu(false)} />
          </View>
        </>
      )}

      {showMenu && (
        <Animated.View style={styles.menuContainer}>
          <Menu onClose={() => setShowMenu(false)} />
        </Animated.View>
      )}

      {showCalendar && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
            <Calendar
              onDayPress={(day: DateData) => {
                handleDayPress(day);
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: Color.otherOrange,
                selectedDayTextColor: '#ffffff',
                todayTextColor: Color.otherOrange,
                dayTextColor: '#2d4150',
              }}
            />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.paymentContainer}>
        <AllOrders 
          onFilterPress={() => setShowMenu(!showMenu)}
          orders={orders}
          selectedDate={selectedDate}
        />
      </View>
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
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileSection: {
    marginBottom: 5,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
    marginTop: 10,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    color: '#666666',
    fontSize: 14,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationContainer: {
    marginTop: 15,
    marginRight: -15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Color.otherOrange,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  dateSection: {
    marginTop: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  notificationIcon: {
    marginLeft: 10,
  },
  menuButton: {
    backgroundColor: Color.otherOrange,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  ordersContainer: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 0,
    paddingHorizontal: 20,
    
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: -13,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FE5B18',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: -20,
  },
  newOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  paymentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
});
