import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import { SelectList } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import { Food, MenuItem } from '../types/menu';
import { useNotification } from '../context/NotificationContext';
import { sendNotification } from '../utils/notifications';
import CategoryModal from './CategoryModal';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (newFood: Food) => void;
  categories: MenuItem[];
  onAddCategory?: (categoryName: string) => Promise<string>;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export default function AddItemModal({ visible, onClose, onAdd, categories, onAddCategory }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const { addNotification } = useNotification();
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0]
  });

  const handleAdd = async () => {
    try {
      if (!imageUri || !name.trim() || !price.trim() || !selectedCategory) {
        Alert.alert('Required Fields', 'Please fill in all required fields');
        return;
      }

      const formData = new FormData();

      formData.append('foodPhoto', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: `food_${Date.now()}.jpg`
      } as any);

      formData.append('categoryId', selectedCategory);
      formData.append('restaurantId', globalThis.userData.restaurantId);
      formData.append('branchId', globalThis.userData.branchId);

      const foods = {
        name: name.trim(),
        price: Number(price.trim()),
        description: description.trim(),
        quantity: String(parseInt(quantity) || 0),
        restaurantId: globalThis.userData.restaurantId,
        branchId: globalThis.userData.branchId
      };

      formData.append('foods', JSON.stringify(foods));

      const apiResponse = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/add/item/to/category',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          },
          body: formData
        }
      );

      if (!apiResponse.ok) {
        throw new Error('Failed to add item');
      }

      const newFood: Food = {
        id: String(Date.now()),
        name: name.trim(),
        price: Number(price.trim()),
        description: description.trim(),
        quantity: parseInt(quantity) || 0,
        foodImage: { url: imageUri },
        newPrice: Number(price.trim()),
        newQuantity: parseInt(quantity) || 0
      };

      resetForm();
      onClose();
      onAdd(newFood);
      Alert.alert('Success', 'Item added successfully');

    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setQuantity('0');
    setSelectedCategory('');
    setImageUri(null);
    setCustomCategory('');
    setIsAddingCategory(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleNewCategory = async (text: string) => {
    if (!text.trim() || !onAddCategory) return;
    
    try {
      const newCategoryId = await onAddCategory(text.trim());
      if (newCategoryId) {
        setSelectedCategory(newCategoryId);
        setIsAddingCategory(false);
        setCustomCategory('');
        Alert.alert('Success', 'New category added successfully');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      Alert.alert(
        'Error',
        'Failed to create category. Please try again.'
      );
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      if (!categoryData.image || !categoryData.itemImage) {
        throw new Error('Both category and item images are required');
      }

      const formData = new FormData();

      formData.append('foodTypePhoto', {
        uri: Platform.OS === 'ios' ? categoryData.image.replace('file://', '') : categoryData.image,
        type: 'image/jpeg',
        name: 'foodtype.jpg'
      } as any);

      formData.append('foodsPhoto', {
        uri: Platform.OS === 'ios' ? categoryData.itemImage.replace('file://', '') : categoryData.itemImage,
        type: 'image/jpeg',
        name: 'food.jpg'
      } as any);

      formData.append('restaurantName', globalThis.userData.restaurantId);
      formData.append('branchName', globalThis.userData.branchId);
      formData.append('foodType', categoryData.name);

      const foods = [{
        name: categoryData.itemName,
        price: categoryData.price,
        description: categoryData.description || '',
        quantity: parseInt(categoryData.quantity) || 0,
        restaurantName: globalThis.userData.restaurantId,
        branchName: globalThis.userData.branchId
      }];

      formData.append('foods', JSON.stringify(foods));

      console.log('Category Creation Payload:', {
        restaurantName: globalThis.userData.restaurantId,
        branchName: globalThis.userData.branchId,
        foodType: categoryData.name,
        foods: foods
      });

      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/create/new/category',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response:', errorData);
        throw new Error(errorData.message || 'Failed to create category');
      }

      const result = await response.json();
      console.log('Success Response:', result);

      setIsCategoryModalVisible(false);
      Alert.alert('Success', 'Category and item added successfully');

    } catch (error: any) {
      console.error('Detailed error:', error);
      Alert.alert('Error', error?.message || 'Failed to add category');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY }] }
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={28} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Item</Text>
            <View style={styles.dragIndicator} />
          </View>

          <ScrollView 
            style={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }}
                  style={styles.foodImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <MaterialIcons name="add-photo-alternate" size={40} color={Color.otherOrange} />
                  <Text style={styles.placeholderText}>Add Image</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              {isAddingCategory ? (
                <View style={styles.selectBox}>
                  <TextInput
                    style={[styles.selectInput, { paddingVertical: 0 }]}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Enter new category name"
                    placeholderTextColor="#999"
                    autoFocus
                    onSubmitEditing={() => handleNewCategory(customCategory)}
                    returnKeyType="done"
                  />
                  <TouchableOpacity 
                    onPress={() => setIsAddingCategory(false)}
                    style={styles.arrowContainer}
                  >
                    <MaterialIcons name="close" size={20} color={Color.otherOrange} />
                  </TouchableOpacity>
                </View>
              ) : (
                <SelectList
                  setSelected={(val: string) => {
                    if (val === 'add_new') {
                      setIsCategoryModalVisible(true);
                    } else {
                      setSelectedCategory(val);
                    }
                  }}
                  data={[
                    ...categories.map(cat => ({
                      key: cat.id,
                      value: cat.foodType
                    })),
                    { 
                      key: 'add_new', 
                      value: <Text style={{ color: Color.otherOrange }}>Add New Category</Text>
                    }
                  ]}
                  save="key"
                  placeholder="Select a category"
                  boxStyles={styles.selectBox}
                  inputStyles={styles.selectInput}
                  dropdownStyles={styles.dropdown}
                  dropdownItemStyles={styles.dropdownItem}
                  dropdownTextStyles={styles.dropdownText}
                  search={false}
                  arrowicon={
                    <View style={styles.arrowContainer}>
                      <MaterialIcons name="expand-more" size={24} color={Color.otherOrange} />
                    </View>
                  }
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter item description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>GH₵</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAdd}
            >
              <Text style={styles.saveButtonText}>Add Item</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>

      <CategoryModal
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        onSubmit={handleAddCategory}
      />
    </Modal>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '88%',
    paddingBottom:24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
  },
  form: {
    padding: 24,
  },
  imageContainer: {
    position: 'relative',
    width: SCREEN_WIDTH - 48,
    height:150,
    borderRadius: 24,
    marginBottom: 10,
    overflow: 'hidden',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    minHeight: 52,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: Color.otherOrange,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
    shadowColor: Color.otherOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  selectBox: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInput: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  arrowContainer: {
    backgroundColor: '#FFF5F1',
    borderRadius: 8,
    padding: 4,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addCategoryItem: {
    padding: 14,
    backgroundColor: '#FFF5F1',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  addCategoryText: {
    fontSize: 15,
    color: Color.otherOrange,
    fontWeight: '600',
  },
  addNewText: {
    fontSize: 15,
    color: Color.otherOrange,
    fontWeight: '600',
  },
}); 