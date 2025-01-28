import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../constants/GlobalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import Receipt from './receipts';
import { useSelectedBranch } from '../context/SelectedBranchContext';


interface OrdersByDate {
  id: string;
  orderNumber: number;
  customerName: string;
  orderDate: string;
  orderPrice: number;
  deliveryPrice: number;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  pickupName: string;
  dropoffName: string;
  courierName: string;
  created_at: number;
  branchId: string;
  branch: {
    branchName: string;
  };
}

export default function Payment() {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<OrdersByDate[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'abandoned'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrdersByDate | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [counts, setCounts] = useState({
    paid: 0,
    pending: 0,
    abandoned: 0,
    all: 0
  });
  const { selectedBranch } = useSelectedBranch();

  const fetchOrdersByDate = async (date: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const restaurantId = globalThis.userData?._restaurantTable[0]?.id;
      let currentBranchId;

      if (globalThis.userData?.role === 'Admin') {
        // For Admin, use the selected branch ID if provided
        currentBranchId = selectedBranch?.id || globalThis.userData?.branchesTable?.id;
      } else {
        // For non-Admin, always use their assigned branch
        currentBranchId = globalThis.userData?.branchesTable?.id;
      }

      if (!restaurantId || !currentBranchId) {
        throw new Error('Missing required IDs');
      }

      const url = 'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/by/date';
      const response = await fetch(
        `${url}?restaurantId=${restaurantId}&branchId=${currentBranchId}&date=${formattedDate}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      await AsyncStorage.setItem(`orders_${formattedDate}`, JSON.stringify(data));
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      try {
        const formattedDate = date.toISOString().split('T')[0];
        const cachedData = await AsyncStorage.getItem(`orders_${formattedDate}`);
        if (cachedData) {
          setOrders(JSON.parse(cachedData));
        }
      } catch (cacheError) {
        console.error('Error loading cached orders:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const newCounts = {
      paid: orders.filter(order => order.paymentStatus === 'Paid').length,
      pending: orders.filter(order => order.paymentStatus === 'Pending').length,
      abandoned: orders.filter(order => order.paymentStatus === 'Abandoned').length,
      all: orders.length
    };
    setCounts(newCounts);
  }, [orders]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const filteredOrders = orders.filter(order => {
    switch (statusFilter) {
      case 'paid':
        return order.paymentStatus === 'Paid';
      case 'pending':
        return order.paymentStatus === 'Pending';
      case 'abandoned':
        return order.paymentStatus === 'Abandoned';
      default:
        return true;
    }
  });

  const renderOrderItem = ({ item }: { item: OrdersByDate }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item);
        setShowReceipt(true);
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.paymentStatus === 'Paid' ? '#E3FCF2' : '#FFE5E5' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.paymentStatus === 'Paid' ? '#0C977F' : '#FF4444' }
          ]}>
            {item.paymentStatus || 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{item.customerName || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Delivery to</Text>
          <Text style={styles.infoValue}>{item.dropoffName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>
            {new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branch</Text>
          <Text style={styles.infoValue}>{item.branch.branchName}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>
          GH₵{(Number(item.totalPrice) || 0).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>Selected Date</Text>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <MaterialIcons name="event" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day: DateData) => {
                  setSelectedDate(new Date(day.timestamp));
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [selectedDate.toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: Color.otherOrange,
                  },
                }}
                theme={{
                  selectedDayBackgroundColor: Color.otherOrange,
                  todayTextColor: Color.otherOrange,
                  dayTextColor: '#2D3436',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  arrowColor: Color.otherOrange,
                  dotColor: Color.otherOrange,
                  selectedDotColor: '#FFFFFF',
                  monthTextColor: '#2D3436',
                  backgroundColor: '#FFFFFF',
                  calendarBackground: '#FFFFFF',
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[
            styles.filterTab,
            statusFilter === 'all' && styles.filterTabActive
          ]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            statusFilter === 'all' && styles.filterTabTextActive
          ]}>All</Text>
          {counts.all > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{counts.all}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterTab,
            statusFilter === 'paid' && styles.filterTabActive
          ]}
          onPress={() => setStatusFilter('paid')}
        >
          <Text style={[
            styles.filterTabText,
            statusFilter === 'paid' && styles.filterTabTextActive
          ]}>Paid</Text>
          {counts.paid > 0 && (
            <View style={[styles.badge, { backgroundColor: '#0C977F' }]}>
              <Text style={styles.badgeText}>{counts.paid}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterTab,
            statusFilter === 'pending' && styles.filterTabActive
          ]}
          onPress={() => setStatusFilter('pending')}
        >
          <Text style={[
            styles.filterTabText,
            statusFilter === 'pending' && styles.filterTabTextActive
          ]}>Pending</Text>
          {counts.pending > 0 && (
            <View style={[styles.badge, { backgroundColor: '#FF4444' }]}>
              <Text style={styles.badgeText}>{counts.pending}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterTab,
            statusFilter === 'abandoned' && styles.filterTabActive
          ]}
          onPress={() => setStatusFilter('abandoned')}
        >
          <Text style={[
            styles.filterTabText,
            statusFilter === 'abandoned' && styles.filterTabTextActive
          ]}>Abandoned</Text>
          {counts.abandoned > 0 && (
            <View style={[styles.badge, { backgroundColor: '#666666' }]}>
              <Text style={styles.badgeText}>{counts.abandoned}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.otherOrange} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name="receipt-long" 
                size={48} 
                color="#999999" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No orders found for this date</Text>
            </View>
          }
        />
      )}

      {selectedOrder && (
        <Receipt
          visible={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  iconContainer: {
    backgroundColor: Color.otherOrange,
    padding: 10,
    borderRadius: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    letterSpacing: 0.3,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Color.otherOrange,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ordersList: {
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: Color.otherOrange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: Color.otherOrange,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  branchText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});
