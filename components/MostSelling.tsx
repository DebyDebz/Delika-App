import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Filter from '../components/Filter';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface MenuItems {
  name: string;
  price: string;
  category: string;
  imageUrl: any;
}

export default function MostSelling() {
  const [items, setItems] = useState<MenuItems[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchMostSellingItems();
  }, []);

  const fetchMostSellingItems = async () => {
    try {
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: global.userData?.restaurantId,
          branchId: global.userData?.branchId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      console.log('Most selling items response:', data);

      if (data.outputNames) {
        const transformedItems = Object.entries(data.outputNames)
          .map(([name, details]) => ({
            name,
            price: (details as [number, string, { url: string }])[1],
            category: (details as [number, string, { url: string }])[0].toString(),
            imageUrl: (details as [number, string, { url: string }])[2]?.url || require('../assets/images/pie.png')
          }))
          .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        
        console.log('Transformed items:', transformedItems);
        setItems(transformedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching most selling items:', error);
      setItems([]);
    }
  };

  const handleFilterSelect = async (value: string) => {
    console.log('Selected:', value);
    setShowFilter(false);
    
    const apiUrl = value === 'Today' 
      ? 'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items/today'
      : 'https://api-server.krontiva.africa/api:uEBBwbSs/filter/orders/revenue/by/date/most/selling/items';

    try {
      console.log(`Fetching ${value.toLowerCase()} data...`);
      console.log('Request params:', {
        restaurantId: global.userData?.restaurantId,
        branchId: global.userData?.branchId,
        date: new Date().toISOString().split('T')[0]
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: global.userData?.restaurantId,
          branchId: global.userData?.branchId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      console.log(`${value} API Response:`, data);

      if (data.outputNames) {
        const transformedItems = Object.entries(data.outputNames)
          .map(([name, details]) => ({
            name,
            price: (details as [number, string, { url: string }])[1],
            category: (details as [number, string, { url: string }])[0].toString(),
            imageUrl: (details as [number, string, { url: string }])[2]?.url || require('../assets/images/pie.png')
          }))
          .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

        console.log('Transformed items:', transformedItems);
        setItems(transformedItems);
      } else {
        console.log('No data in response');
        setItems([]);
      }
    } catch (error) {
      console.error(`Error fetching ${value.toLowerCase()} items:`, error);
      setItems([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Most Selling Items</Text>
      <TouchableOpacity 
        onPress={() => setShowFilter(true)}
        style={styles.filterButton}
      >
        <Text style={styles.filter}>Filter</Text>
      </TouchableOpacity>
      

      <Filter 
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSelect={handleFilterSelect}
      />

      <ScrollView style={styles.itemsContainer}>
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item: MenuItems, index) => (
            <View key={index} style={styles.itemContainer}>
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.image} 
              />
              <View style={styles.details}>
                <View>
                  <Text style={styles.name}>{item.name || 'Item Name'}</Text>
                  <Text style={styles.category}>Quantity: {item.category || '0'}</Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.price}>GH₵{item.price || '0.00'}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="restaurant" size={48} color="#E5E5E5" />
            <Text style={styles.noItemsTitle}>No Items Available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 0,
    width: '110%',
    alignSelf: 'flex-start',
    marginLeft: 10,
    maxHeight: 500,
  },
  itemsContainer: {
    flexGrow: 1,
    overflow: 'scroll',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  filterButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    marginRight: 50,
  },
  filter: {
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#FE5B18',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    //backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  category: {
    color: '#FE5B18',
    fontSize: 12,
    marginBottom: 4,
  },
  servings: {
    color: '#999999',
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    marginRight: 45,
  },
  time: {
    color: '#999999',
    fontSize: 12,
    marginRight: 50,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    //backgroundColor: '#FFFFFF',
   // borderRadius: 16,
   // marginVertical: 10,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.05,
    //shadowRadius: 8,
    //elevation: 2,
  },
  noItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  
});
