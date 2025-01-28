import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Filter from '../components/Filter';
import { useState, useEffect } from 'react';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSelectedBranch } from '../context/SelectedBranchContext';

type MenuItems = {
  name: string;
  price: string;
  category: string;
}

export default function MostSelling() {
  const { selectedBranch } = useSelectedBranch();
  const [items, setItems] = useState<MenuItems[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMostSellingItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAdmin = global.userData?.role === 'Admin';
      console.log('User Role:', global.userData?.role);
      console.log('Restaurant ID:', global.userData?.restaurantId);
      
      // Default UUID for branchId when none is selected
      const defaultBranchId = global.userData?.branchId;
      
      const requestData = {
        restaurantId: selectedBranch?.restaurantId || global.userData?.restaurantId,
        branchId: selectedBranch?.id || defaultBranchId,
        date: new Date().toISOString().split("T")[0]
      };

      console.log('Request Data:', requestData);

      const response = await fetch(
        "https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${global.userData?.token}`
          },
          body: JSON.stringify({
            ...requestData,
            branchId: requestData.branchId.toLowerCase() // Ensure UUID is lowercase
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data?.outputNames) {
        const transformedItems = Object.entries(data.outputNames)
          .map(([name, details]: [string, any]) => ({
            name,
            price: Array.isArray(details) ? details[1]?.toString() || "0.00" : "0.00",
            category: Array.isArray(details) ? details[0]?.toString() || "0" : "0"
          }));
        setItems(transformedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelect = async (value: string) => {
    setShowFilter(false);
    setLoading(true);
    
    const apiUrl = value === 'Today' 
      ? 'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items/today'
      : 'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: global.userData?.restaurantId,
          branchId: global.userData?.branchId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();

      if (data?.outputNames) {
        const transformedItems = Object.entries(data.outputNames)
          .map(([name, details]: [string, any]) => {
            return {
              name: name,
              price: Array.isArray(details) ? details[1]?.toString() || '0.00' : '0.00',
              category: Array.isArray(details) ? details[0]?.toString() || '0' : '0'
            };
          });
        setItems(transformedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when selected branch changes
  useEffect(() => {
    console.log('Selected Branch changed:', selectedBranch);
    fetchMostSellingItems();
  }, [selectedBranch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Most Selling Items</Text>
        <TouchableOpacity 
          onPress={() => setShowFilter(true)}
          style={styles.filterButton}
        >
          <Feather name="filter" size={18} color="#FE5B18" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Filter 
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSelect={handleFilterSelect}
      />

      <ScrollView 
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialIcons name="restaurant" size={40} color="#FE5B18" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.details}>
                <View style={styles.itemInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.category}>Qty: {item.category}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>GH₵</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="restaurant-menu" size={60} color="#E5E5E5" />
            <Text style={styles.noItemsTitle}>No Items Available</Text>
            <Text style={styles.noItemsSubtitle}>Check back later for updates</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: width - 32,
    alignSelf: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    color: '#FE5B18',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#FE5B18',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  quantityBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  category: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  price: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666666',
    marginTop: 12,
    fontSize: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  noItemsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
});