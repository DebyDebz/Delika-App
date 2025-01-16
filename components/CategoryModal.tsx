import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNotification } from '../context/NotificationContext';
import { Color } from '../constants/GlobalStyles';

// Define types
type UserDataType = {
  _restaurantTable: Array<{ restaurantName: string }>;
  branchesTable: { branchLocation: string };
  restaurantId: string;
  branchId: string;
  token?: string;
  [key: string]: any;
};

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (categoryData: any) => void;
}

export default function CategoryModal({ visible, onClose, onSubmit }: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [itemName, setItemName] = useState('');
  const [itemImage, setItemImage] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const pickImage = async (type: 'category' | 'item') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        addNotification({
          id: Date.now().toString(),
          title: 'Permission Required',
          message: 'Please grant camera roll permissions to upload images.',
          type: 'error',
          timestamp: new Date()
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        if (type === 'category') {
          setCategoryImage(result.assets[0].uri);
        } else {
          setItemImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!categoryName.trim()) {
        Alert.alert('Error', 'Category name is required');
        return;
      }

      setIsLoading(true);
      const userInfo = globalThis.userData as UserDataType;
      const formData = new FormData();

      // Create image objects
      const categoryImageObj = categoryImage ? {
        uri: categoryImage,
        type: 'image/jpeg',
        name: 'category.jpg'
      } : null;

      const itemImageObj = itemImage ? {
        uri: itemImage,
        type: 'image/jpeg',
        name: 'item.jpg'
      } : null;

      // Add form data
      formData.append('foodType', categoryName.trim());
      formData.append('restaurantName', userInfo.restaurantId);
      formData.append('branchName', userInfo.branchId);

      if (categoryImageObj) {
        formData.append('foodTypePhoto', categoryImageObj as any);
      }

      if (itemImageObj) {
        formData.append('foodsPhoto', itemImageObj as any);
      }

      formData.append('foods', JSON.stringify({
        name: itemName.trim(),
        price: parseFloat(price.trim()),
        description: description.trim(),
        quantity: parseInt(quantity) || 0
      }));

      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/create/new/category',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userInfo.token || ''}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      // Success case
      resetForm();
      onSubmit(data);
      onClose();
      Alert.alert('Success', 'Category created successfully');

    } catch (error: any) {
      // Only log the error to console
      console.error('Error:', error);
      
      // Check if error message includes the specific text
      if (!error.message?.includes('Both category and item images are required')) {
        Alert.alert('Error', 'Failed to create category');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setItemName('');
    setDescription('');
    setPrice('');
    setQuantity('0');
    setCategoryImage(null);
    setItemImage(null);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={28} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Category</Text>
            <View style={styles.dragIndicator} />
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="category" size={24} color={Color.otherOrange} />
                <Text style={styles.cardTitle}>Category Information</Text>
              </View>
              
              <View style={styles.cardBody}>
                <TouchableOpacity 
                  style={styles.imageUpload}
                  onPress={() => pickImage('category')}
                >
                  {categoryImage ? (
                    <>
                      <Image source={{ uri: categoryImage }} style={styles.uploadedImage} />
                      <View style={styles.imageOverlay}>
                        <MaterialIcons name="edit" size={24} color="#FFF" />
                      </View>
                    </>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <MaterialIcons name="add-photo-alternate" size={32} color={Color.otherOrange} />
                      <Text style={styles.uploadText}>Upload Category Image</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.inputField}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Category name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="restaurant-menu" size={24} color={Color.otherOrange} />
                <Text style={styles.cardTitle}>Item Details</Text>
              </View>
              
              <View style={styles.cardBody}>
                <TouchableOpacity 
                  style={styles.imageUpload}
                  onPress={() => pickImage('item')}
                >
                  {itemImage ? (
                    <>
                      <Image source={{ uri: itemImage }} style={styles.uploadedImage} />
                      <View style={styles.imageOverlay}>
                        <MaterialIcons name="edit" size={24} color="#FFF" />
                      </View>
                    </>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <MaterialIcons name="add-photo-alternate" size={32} color={Color.otherOrange} />
                      <Text style={styles.uploadText}>Upload Item Image</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.inputField}
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder="Item name"
                  placeholderTextColor="#999"
                />

                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Item description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.inputRow}>
                  <View style={[styles.inputWrapper, { flex: 1.5 }]}>
                    <Text style={styles.inputLabel}>Price</Text>
                    <View style={styles.priceInput}>
                      <Text style={styles.currency}>GH₵</Text>
                      <TextInput
                        style={styles.priceField}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.inputField}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="add-circle-outline" size={24} color="#FFF" />
                  <Text style={styles.submitButtonText}>Add Category</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: 16,
    gap: 16,
  },
  imageUpload: {
    aspectRatio: 16/9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    position: 'relative',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FFF',
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  currency: {
    paddingLeft: 14,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  priceField: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },
  submitButton: {
    backgroundColor: Color.otherOrange,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: Color.otherOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}); 