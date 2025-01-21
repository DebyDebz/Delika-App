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
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import type { Food as FoodType, MenuItem } from '../types/menu';

declare global {
  var menuItems: Array<{
    foods: FoodType[];
    [key: string]: any;
  }>;
}

// Separate from global declaration
interface UserDataType {
  menuTableId?: string;
  token?: string;
  [key: string]: any;
}

// Define ExtendedFood without importing Food
interface ExtendedFood {
  id?: string;
  menuId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: string | number;
  quantity?: number;
  foodImage?: {
    url: string;
    [key: string]: any;
  };
}

interface EditFoodModalProps {
  visible: boolean;
  food: ExtendedFood | null;
  onClose: () => void;
  onSave: (food: FoodType) => void;
  categories: MenuItem[];
  itemId?: string;
}

const EditFoodModal: React.FC<EditFoodModalProps> = ({
  visible,
  food,
  onClose,
  onSave,
  categories,
  itemId
}) => {
  const [id, setId] = useState(food?.id || '');
  const [name, setName] = useState(food?.name || '');
  const [price, setPrice] = useState(food?.price?.toString() || '');
  const [description, setDescription] = useState(food?.description || '');
  const [quantity, setQuantity] = useState(food?.quantity?.toString() || '0');

  useEffect(() => {
    if (food) {
      setId(food.id || '');
      setName(food.name || '');
      setPrice(food.price?.toString() || '');
      setDescription(food.description || '');
      setQuantity(food.quantity?.toString() || '0');
    }
  }, [food]);

  const handleSave = async () => {
    try {
      console.log('Saving with itemId:', itemId);
      console.log('Current food object:', food);

      if (!itemId) {
        console.error('Missing itemId in EditFoodModal');
        throw new Error('Menu ID is required');
      }

      // Prepare update data to match Xano's format
      const updateData = {
        menuId: itemId || null,
        newPrice: parseFloat(price || '0'),
        name: name || "",
        description: description || "",
        newQuantity: parseInt(quantity || '0')
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/update/inventory/price/quantity',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${(globalThis.userData as UserDataType)?.token || ''}`
          },
          body: JSON.stringify(updateData)
        }
      );

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update menu item');
      }

      // Update local state and close modal
      const updatedFood: FoodType = {
        id: itemId || '',
        name,
        description: description || '',
        price: parseFloat(price || '0'),
        quantity: parseInt(quantity || '0'),
        newPrice: parseFloat(price || '0'),
        newQuantity: parseInt(quantity || '0'),
        foodImage: food?.foodImage
      };

      onSave(updatedFood);
      onClose();
      Alert.alert('Success', 'Menu item updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update menu item');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={28} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Menu Item</Text>
            <View style={styles.dragIndicator} />
          </View>

          <ScrollView 
            style={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageContainer}>
              {food?.foodImage?.url ? (
                <Image 
                  source={{ uri: food.foodImage.url }}
                  style={styles.foodImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <MaterialIcons name="restaurant-menu" size={40} color="#CCC" />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F0F0F0' }]}
                value={name}
                editable={false}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: '#F0F0F0' }]}
                value={description}
                editable={false}
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
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    minHeight: '65%',
    paddingBottom: 24,
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
    height: 180,
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  editImageButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: Color.otherOrange,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
    marginTop: 10,
    marginBottom: 10,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
});

export default EditFoodModal; 