import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Color } from '../constants/GlobalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditFoodModal from './EditFoodModal';
import AddItemModal from './AddItemModal';
import { Food, MenuItem } from '../types/menu';
import { useRouter } from 'expo-router';
import { useNotification } from '../context/NotificationContext';
import { sendNotification } from '../utils/notifications';

interface CategoryListProps {
  categories: MenuItem[];
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

export default function MenuItems() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [menuCategories, setMenuCategories] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchMenuItems = useCallback(async (showLoader = true) => {
    try {
      if (!globalThis.userData?.restaurantId || !globalThis.userData?.branchId) {
        throw new Error('Missing required IDs');
      }

      if (showLoader) setIsLoading(true);
      setError(null);

      const cachedData = await AsyncStorage.getItem('menuItems');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setMenuCategories(parsedData);
        if (parsedData.length > 0 && !selectedCategory) {
          setSelectedCategory(parsedData[0].id);
        }
      }

      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/get/all/menu',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          },
          body: JSON.stringify({
            restaurantId: String(globalThis.userData.restaurantId),
            branchId: String(globalThis.userData.branchId),
            
          })
        }
      );

      const responseText = await response.text();
      console.log('API Response:', responseText);

      if (!response.ok) {
        throw new Error(`API Error: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Menu Items Data:', JSON.stringify(data, null, 2));
      await AsyncStorage.setItem('menuItems', JSON.stringify(data));
      setMenuCategories(data);

      // Find and set Pastries category after loading data
      const pastriesCategory = data.find((cat: MenuItem) => 
        cat.foodType.toLowerCase().includes('pastry') || 
        cat.foodType.toLowerCase().includes('pastries')
      );
      
      if (pastriesCategory) {
        setSelectedCategory(pastriesCategory.id);
      } else if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }

    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Unable to load menu. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMenuItems(false);
  }, [fetchMenuItems]);

  const CategoryList = useCallback(({ categories, selectedCategory, onSelectCategory }: CategoryListProps) => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive
            ]}
            onPress={() => onSelectCategory(item.id)}
          >
            <Image 
              source={{ uri: item.foodTypeImage.url }}
              style={styles.categoryButtonImage}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === item.id && styles.categoryButtonTextActive
            ]}>
              {item.foodType}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  ), []);

  const renderFoodItem = useCallback(({ item }: { item: Food }) => {
    console.log('Food Item Image:', {
      foodImage: item.foodImage,
      url: item.foodImage?.url,
      fullItem: item
    });

    return (
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => {
          const imageUrl = item.foodImage?.url;
          router.push({
            pathname: '/menu-details',
            params: {
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              quantity: item.quantity,
              imageUrl: imageUrl || null,
            }
          });
        }}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={
              item.foodImage?.url 
                ? { 
                    uri: item.foodImage.url,
                    headers: {
                      Authorization: `Bearer ${globalThis.userData?.token || ''}`
                    }
                  }
                : require('../assets/images/logo.png')
            }
            style={styles.menuImage}
            onError={(e) => console.log('Image Error:', e.nativeEvent.error)}
          />
          <View style={[
            styles.stockBadge,
            { backgroundColor: item.quantity > 0 ? 'rgba(46, 213, 115, 0.9)' : 'rgba(255, 71, 87, 0.9)' }
          ]}>
            <Text style={styles.stockText}>
              {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.menuPrice}>
            GH₵{(Number(item.price) || 0).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const handleEdit = useCallback((food: Food) => {
    setSelectedFood(food);
    setIsEditModalVisible(true);
  }, []);

  const handleSaveEdit = useCallback(async (updatedFood: Food) => {
    try {
      // Add your API call here to update the food item
      await fetchMenuItems(false);
      Alert.alert('Success', 'Item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  }, [fetchMenuItems]);

  const handleAddItem = useCallback(async (newFood: Food) => {
    try {
      // First refresh the menu items
      await fetchMenuItems(false);
      
      // Small delay to ensure menu is updated before showing notification
      setTimeout(() => {
        // Show success notification
        const notificationData = {
          title: 'New Item Added',
          message: `${newFood.name} has been added to the menu`,
          type: 'success' as const,
          timestamp: new Date(),
          id: String(Date.now())
        };
        
        addNotification(notificationData);
        sendNotification(notificationData).catch(console.error);
      }, 500); // 500ms delay

    } catch (error) {
      console.error('Error refreshing menu:', error);
      Alert.alert('Error', 'Failed to refresh menu after adding item');
    }
  }, [fetchMenuItems, addNotification]);

  const handleAddCategory = useCallback(async (categoryName: string) => {
    try {
      // Refresh menu items to get the new category
      await fetchMenuItems(false);
      
      // Find the newly created category
      const newCategory = menuCategories.find(cat => cat.foodType === categoryName);
      if (newCategory) {
        return newCategory.id;
      }
      throw new Error('Category not found after creation');
    } catch (error) {
      console.error('Error handling new category:', error);
      throw error;
    }
  }, [fetchMenuItems, menuCategories]);

  const handleSelectItem = (item: any) => {
    router.push({
      pathname: '/(root)/place-order',
      params: {
        menuId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        inStock: item.quantity > 0 ? '1' : '0'
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Color.otherOrange} />
      </View>
    );
  }

  const filteredFoods = selectedCategory 
    ? menuCategories.find(cat => cat.id === selectedCategory)?.foods || []
    : [];

  return (
    <View style={styles.container}>
      <CategoryList
        categories={menuCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <View style={styles.menuSection}>
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => item.id || `${item.name}-${item.price}`}
          renderItem={renderFoodItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.foodList}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Color.otherOrange]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error || 'No items found in this category'}
              </Text>
            </View>
          }
        />
      </View>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <EditFoodModal
        visible={isEditModalVisible}
        food={selectedFood}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveEdit}
        categories={menuCategories}
        itemId={selectedCategory || undefined}
      />
      
      <AddItemModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddItem}
        categories={menuCategories}
        onAddCategory={handleAddCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    paddingTop: 16,
  },
  menuSection: {
    flex: 1,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: Color.otherOrange,
  },
  categoryButtonImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  foodList: {
    padding: 8,
  },
  menuItem: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  menuImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  menuContent: {
    padding: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 15,
    color: Color.otherOrange,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  editButton: {
    position: 'absolute',
    right: 8,
    top: 170,
    backgroundColor: Color.otherOrange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: Color.otherOrange,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.9)',
  },
  inStockBadge: {
    backgroundColor: 'rgba(46, 213, 115, 0.9)',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outOfStockText: {
    color: '#FFFFFF',
  },
  inStockText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
