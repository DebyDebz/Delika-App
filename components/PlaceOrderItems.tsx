import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  ScrollView
} from 'react-native';
import { Color } from '../constants/GlobalStyles';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface PlaceOrderItemsProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: MenuItem) => void;
  name?: string;
  price?: number;
  quantity?: number;
  imageUrl?: string;
  inStock?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: string;
  quantity: number;
  category: string;
}

export default function PlaceOrderItems({ 
  visible,
  onClose,
  onSelect,
  name,
  price,
  quantity,
  imageUrl,
  inStock
}: PlaceOrderItemsProps) {

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'https://api-server.krontiva.africa/api:uEBBwbSs/get/all/menu',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${globalThis.userData?.token || ''}`
            },
            body: JSON.stringify({
              restaurantId: globalThis.userData.restaurantId,
              branchId: globalThis.userData.branchId,
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }

        const data = await response.json();
        const allItems = data.reduce((acc: MenuItem[], category: any) => {
          if (category.foods && Array.isArray(category.foods)) {
            const categoryItems = category.foods.map((food: any) => ({
              id: food.id || String(Math.random()),
              name: food.name || 'Unnamed Item',
              price: parseFloat(food.price) || 0,
              imageUrl: food.foodImage?.url || '',
              inStock: food.quantity > 0 ? '1' : '0',
              quantity: parseInt(food.quantity) || 0,
              category: category.foodType || 'Uncategorized'
            }));
            return [...acc, ...categoryItems];
          }
          return acc;
        }, []);

        setMenuItems(allItems);
        const uniqueCategories = [...new Set(data.map((category: any) => category.foodType))] as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      fetchMenuItems();
    }
  }, [visible]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Items</Text>
          </View>

          <View style={styles.categoriesSection}>
            <FlatList
              horizontal
              data={categories}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === item && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === item && styles.selectedCategoryText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={Color.otherOrange} />
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.gridItem}
                  onPress={() => onSelect(item)}
                >
                  <View style={styles.gridImageContainer}>
                    <Image 
                      source={
                        item.imageUrl 
                          ? { 
                              uri: item.imageUrl,
                              headers: {
                                Authorization: `Bearer ${globalThis.userData?.token || ''}`
                              }
                            }
                          : require('../assets/images/logo.png')
                      }
                      style={styles.gridImage}
                    />
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>GH₵{item.price}</Text>
                    </View>
                  </View>
                  <View style={styles.gridDetails}>
                    <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.gridFooter}>
                      <View style={[
                        styles.gridStockBadge,
                        { backgroundColor: item.inStock === '1' ? '#E8F5E9' : '#FFEBEE' }
                      ]}>
                        <MaterialIcons 
                          name={item.inStock === '1' ? "check-circle" : "remove-circle"} 
                          size={14} 
                          color={item.inStock === '1' ? '#2E7D32' : '#C62828'} 
                        />
                        <Text style={[
                          styles.gridStockText,
                          { color: item.inStock === '1' ? '#2E7D32' : '#C62828' }
                        ]}>
                          {item.inStock === '1' ? 'Available' : 'Out of Stock'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.addButton}>
                        <MaterialIcons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '65%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginRight: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Color.otherOrange,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1A1A1A',
  },
  categoriesSection: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    padding: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gridDetails: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  gridName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    height: 40,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridStockText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: Color.otherOrange,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.otherOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: Color.otherOrange,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
});
