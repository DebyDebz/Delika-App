import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import Stack from 'expo-router/stack';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import OrdersFilter from './OrdersFilter';
import { OrderFilters } from '../types/orders';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface OrderItem {
  id: string;
  orderNumber: string;
  orderStatus: string;
  totalPrice: number;
  customerName: string;
  paymentStatus: string;
  orderDate: string;
  courierName: string;
  courierPhoneNumber: string;
  dropoffName: string;
  deliveryPrice: number;
  orderPrice: number;
  products: any[];
}

interface Order {
  orderStatus: string;
  [key: string]: any; // for other properties
}

interface AllOrdersProps {
  onFilterPress: () => void;
  orders: any[];
  selectedDate: Date;
}

const filterStyles = StyleSheet.create({
  selectedFilter: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  }
});

export default function AllOrders({ onFilterPress, orders, selectedDate }: AllOrdersProps) {
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All');

  useEffect(() => {
    setFilteredOrders(orders);
    setLoading(false);
  }, [orders]);

  const handleFilterChange = (filters: OrderFilters) => {
    const orderStatus = filters.orderStatus || 'All';
    setCurrentFilter(orderStatus);
    
    console.log('Applying filter:', orderStatus);

    if (orderStatus === 'All') {
      setFilteredOrders(orders);
      return;
    }

    // Filter orders based on exact orderStatus match
    const filtered = orders.filter(order => {
      // Log each comparison for debugging
      console.log(`Comparing: Order ${order.orderNumber} status "${order.orderStatus}" with filter "${orderStatus}"`);
      
      // Exact match comparison
      return order.orderStatus === orderStatus;
    });

    console.log(`Filtered results: ${filtered.length} orders`);
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    console.log('Current filtered orders:', filteredOrders);
  }, [filteredOrders]);

  const handleFilterPress = () => {
    setShowFilter(true);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/by/date?restaurantId=${globalThis.userData?.restaurantId}&branchId=${globalThis.userData?.branchId}&date=${selectedDate.toISOString().split('T')[0]}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      const data = await response.json();
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    globalThis.refreshOrders = () => {
      setLoading(true);
      fetchOrders().finally(() => setLoading(false));
    };

    return () => {
      delete globalThis.refreshOrders;
    };
  }, [fetchOrders, selectedDate]);

  const handleOrderPress = (item: OrderItem) => {
    console.log('Full order details:', item); // Debug log
    router.push({
      pathname: '/all-orders-details',
      params: {
        ...item, // Spread all properties from the item
        // Convert numbers to strings for URL params
        totalPrice: item.totalPrice?.toString(),
        deliveryPrice: item.deliveryPrice?.toString(),
        orderPrice: item.orderPrice?.toString(),
        // Ensure optional fields have fallbacks
        courierName: item.courierName || '',
        dropoffName: item.dropoffName || '',
        paymentStatus: item.paymentStatus || 'Pending',
        products: JSON.stringify(item.products),
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {currentFilter === 'All' ? 'All ' : ` ${currentFilter}`}
        </Text>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={handleFilterPress}
        >
          <Ionicons name="filter" size={18} color="#FFFFFF" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderItem}
              activeOpacity={0.7}
              onPress={() => handleOrderPress(item)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <Text style={[
                  styles.orderStatus,
                  { color: item.orderStatus === 'Delivered' ? '#4CAF50' : '#FE5B18' }
                ]}>
                  {item.orderStatus}
                </Text>
              </View>
              
              <View style={styles.orderDetails}>
                <View>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.orderDate}>{item.orderDate}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.totalPrice}>
                    GH₵{typeof item.totalPrice === 'number' ? 
                      item.totalPrice.toFixed(2) : 
                      '0.00'
                    }
                  </Text>
                  <Text style={styles.paymentStatus}>
                    {item.paymentStatus || 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.deliveryInfo}>
                <View style={styles.courierInfo}>
                  <Ionicons name="bicycle-outline" size={16} color="#666666" />
                  <Text style={styles.courierName}>{item.courierName || 'Not Assigned'}</Text>
                </View>
                <View style={styles.dropoffInfo}>
                  <Ionicons name="location-outline" size={16} color="#666666" />
                  <Text style={styles.dropoffName}>{item.dropoffName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="receipt-long" 
            size={48} 
            color="#E5E5E5" 
          />
          <Text style={styles.noOrdersTitle}>
            No {currentFilter === 'all' ? '' : currentFilter} Orders Found
          </Text>
        </View>
      )}

      <OrdersFilter 
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedFilter={currentFilter}
        onApplyFilters={(filters) => {
          if (filters.orderStatus) {
            handleFilterChange({ orderStatus: filters.orderStatus });
          }
          setShowFilter(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -40,
    paddingTop: 5,
    paddingHorizontal: 16,
    width: '110%',
    alignSelf: 'center',
  },
  ordersContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 5,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FE5B18',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  paymentStatus: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courierName: {
    fontSize: 14,
    color: '#666666',
  },
  dropoffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropoffName: {
    fontSize: 14,
    color: '#666666',
  },
  listContainer: {
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666666',
  },
  noOrdersText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOrdersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});