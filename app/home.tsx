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
import { Calendar } from 'react-native-calendars';
import { Color } from '../constants/GlobalStyles';
import TotalRevenue from '../components/TotalRevenue';
import TotalOrders from '../components/TotalOrders';
import TotalMenu from '../components/TotalMenu';
import MostSelling from '../components/MostSelling';
import Menu from '../components/Menu';
import BranchFilter from '../components/branchFilter';
import Broadcast from '../components/broadcast';
import NotificationIcon from '../components/NotificationIcon';
import NotificationModal from '../components/NotificationModal';
import { useSelectedBranch } from '../context/SelectedBranchContext';
import Profile from './profile';
import { router } from 'expo-router';

declare global {
  var userData: any;
  var dashboardData: any;
}

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

  const handleDayPress = async (day: any) => {
    setSelectedDate(new Date(day.timestamp));
    setShowCalendar(false);

    try {
      const formattedDate = new Date(day.timestamp).toISOString().split('T')[0];
      const restaurantId = globalThis.userData?._restaurantTable[0]?.id;
      const branchId = globalThis.userData?.branchesTable?.id;

      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantId,
            branchId,
            date: formattedDate,
          }),
        }
      );

      const data = await response.json();
      // Update both global and local state
      globalThis.dashboardData = {
        ...globalThis.dashboardData,
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalMenu: data.totalMenu || 0,
      };
      
      // Update local state to trigger re-render
      setDashboardStats({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalMenu: data.totalMenu || 0
      });
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  // Add this function to handle branch selection
  const handleBranchSelect = async (branch: any) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const restaurantId = globalThis.userData?._restaurantTable[0]?.id;
      
      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantId,
            branchId: branch.id,
            date: formattedDate,
          }),
        }
      );

      const data = await response.json();
      // Update both global and local state
      globalThis.dashboardData = {
        ...globalThis.dashboardData,
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalMenu: data.totalMenu || 0,
      };
      
      // Update local state to trigger re-render
      setDashboardStats({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalMenu: data.totalMenu || 0
      });

      // Update global userData with new branch
      globalThis.userData = {
        ...globalThis.userData,
        branchesTable: branch
      };

    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  // Function to fetch revenue data
  const fetchRevenueData = async (restaurantId: string, date: string) => {
    try {
      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date`
      );
      const data = await response.json();
      if (response.ok) {
        setRevenueData(data);
      } else {
        console.error('Failed to fetch revenue data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  // Use effect to fetch data when branch changes or date changes
  useEffect(() => {
    if (selectedBranch?.restaurantId) {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      fetchRevenueData(selectedBranch.restaurantId, currentDate);
    }
  }, [selectedBranch]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}
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
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotification(true)}
          >
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={Color.otherOrange} 
            />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => router.push({
              pathname: '/profile',
              params: { userData: JSON.stringify(globalThis.userData) }
            })}
          >
            <Image 
              source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color={Color.otherOrange} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
        {globalThis.userData?.role === 'Admin' && (
          <TouchableOpacity 
            onPress={() => setShowBranchFilter(true)}
            style={styles.branchButton}
          >
            <Feather name="git-branch" size={20} color="#FE5B18" />
            <Text style={styles.branchText}>Branch</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Broadcast moved here */}
      <View style={styles.broadcastSection}>
        <Broadcast />
      </View>

      {/* Date Selector */}
      <TouchableOpacity 
        onPress={() => setShowCalendar(true)}
        style={[
          styles.dateSelector,
          !globalThis.userData?.broadcast && { marginTop: -10 }  // Add negative margin when no broadcast
        ]}
      >
        <View style={styles.dateContent}>
          <Feather name="calendar" size={20} color={Color.otherOrange} />
          <Text style={styles.dateText}>{formatSelectedDate(selectedDate)}</Text>
        </View>
        <Feather name="chevron-down" size={20} color={Color.otherOrange} />
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <View style={styles.statsCard}>
              <TotalRevenue value={dashboardStats.totalRevenue} />
            </View>
            <View style={styles.statsCard}>
              <TotalOrders value={dashboardStats.totalOrders} />
            </View>
            <View style={styles.statsCard}>
              <TotalMenu value={dashboardStats.totalMenu} />
            </View>
          </ScrollView>
        </View>

        {/* Most Selling Section */}
        <View style={styles.section}>
          <MostSelling />
        </View>
      </ScrollView>

      {/* Add Notification Modal */}
      {showNotification && (
        <NotificationModal 
          visible={showNotification}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Modals */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
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
                textSectionTitleColor: '#666666',
                selectedDayBackgroundColor: Color.otherOrange,
                selectedDayTextColor: '#ffffff',
                todayTextColor: Color.otherOrange,
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: Color.otherOrange,
                selectedDotColor: '#ffffff',
                arrowColor: Color.otherOrange,
                monthTextColor: '#2d4150',
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

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

      {showBranchFilter && (
        <BranchFilter
          visible={showBranchFilter}
          onClose={() => setShowBranchFilter(false)}
          onSelect={handleBranchSelect}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    backgroundColor: Color.otherOrange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  menuGrid: {
    gap: 4,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 4,
  },
  menuDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 15,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: Color.otherOrange,
    borderRadius: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
    marginLeft: 10,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    
  },
  branchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  branchText: {
    color: '#FE5B18',
    fontSize: 14,
    fontWeight: '500',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
  content: {
    flex: 1,
  },
  statsSection: {
    paddingVertical: 8,
    marginTop: -10,
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
    marginBottom: -20,
  },
  statsCard: {
    width: 170,
    borderRadius: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  section: {
    padding: 16,
    marginTop: -15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  broadcastSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateSelectorNoBroadcast: {
    marginTop: 0,
  },
});