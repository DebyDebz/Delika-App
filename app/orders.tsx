import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import Payment from '../components/AllOrders';
import NotificationIcon from '../components/NotificationIcon';
import Menu from '../components/Menu';
import { Calendar } from 'react-native-calendars';
import AllOrders from '../components/AllOrders';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';

interface CalendarDay {
  timestamp: number;
  dateString: string;
  day: number;
  month: number;
  year: number;
}

export default function Orders() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const formatDate = (date: Date) => {
    return `Today, ${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!globalThis.userData?.restaurantId || !globalThis.userData?.branchId) return;

        const formattedDate = selectedDate.toISOString().split('T')[0];
        const url = `https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/by/date?restaurantId=${globalThis.userData.restaurantId}&branchId=${globalThis.userData.branchId}&date=${formattedDate}`;
        
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

    fetchOrders();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
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
            <NotificationIcon color={Color.otherOrange} />
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

        <View style={styles.bottomSection}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Choose Date</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
              <Ionicons name="calendar-outline" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
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
            <Text style={styles.todayText}>{formatDate(selectedDate)}</Text>
          </View>
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
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
            <Calendar
              onDayPress={(day: CalendarDay) => {
                setSelectedDate(new Date(day.timestamp));
                setShowCalendar(false);
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingRight: 35,
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
  notificationIcon: {
    marginLeft: 10,
  },
  menuButton: {
    backgroundColor: '#FE5B18',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
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
  calendarButton: {
    marginLeft: 10,
  },
});
