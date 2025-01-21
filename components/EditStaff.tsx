import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  Image,
  Animated
} from 'react-native';
import { Color } from '../constants/GlobalStyles';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

interface EditMemberProps {
  visible: boolean;
  onClose: () => void;
  member: {
    id: number;
    name: string;
    photo?: string;
    role?: string;
    email?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    userName?: string;
    fullName?: string;
    country?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  };
}


export default function EditMember({ visible, onClose, member }: EditMemberProps) {
  const [formData, setFormData] = useState({
    userId: member.id,
    userName: member.userName || '',
    fullName: member.fullName || '',
    email: member.email || '',
    phoneNumber: member.phoneNumber || '',
    dateOfBirth: member.dateOfBirth || '',
    postalCode: member.postalCode || '',
    country: member.country || '',
    city: member.city || '',
    address: member.address || '',
    restaurantId: globalThis.userData?.restaurantId|| '',
    branchId: globalThis.userData?.branchId|| '',
    photo: member.photo || '',
    role: member.role || '',
  });
  const [image, setImage] = useState(member.photo || null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  if (image && !image.startsWith('http')) {
    const formDataToSend = new FormData();
    formDataToSend.append('photo', {
      uri: image,
      type: 'image/jpeg',
      name: 'profile-image.jpg'
    } as any);
  }

  const handleUpdate = async () => {
    try {
      const userId = formData.userId; // Ensure this is the correct ID
      console.log('Updating profile for user:', userId);

      const formDataToSend = new FormData();
      
      // Check if the image needs to be uploaded
      if (image && !image.startsWith('http')) {
        formDataToSend.append('photo', {
          uri: image,
          type: 'image/jpeg', // Adjust based on the actual file type
          name: 'profile-image.jpg',
        } as any);
      }

      // Prepare the data for updating the member
      const updateData = {
        ...formData,
        photo: image, // Use the uploaded photo URL
      };

      Object.entries(updateData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      console.log('FormData:', formDataToSend);

      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_user_table/${userId}`, 
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
          },
          body: formDataToSend,
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        globalThis.userData = {
          ...globalThis.userData,
          ...formData,
        };
        onClose(); // Close the modal after successful update
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setFormData(prev => ({ ...prev, image_url: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const fetchRoles = async () => {
    setRoles([
      'Manager',
      'Store Clerk',
      'Dispatcher',
      'Rider'
    ]);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: showRoleDropdown ? roles.length * 60 : 0, // Adjust height based on number of roles
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showRoleDropdown]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onClose}
            >
              <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Edit Staff Profile</Text>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <TouchableOpacity 
                style={styles.imageContainer}
                onPress={pickImage}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={32} color={Color.otherOrange} />
                    <Text style={styles.uploadText}>Upload Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="person" size={20} color={Color.otherOrange} />
                  <Text style={styles.cardTitle}>Basic Information</Text>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.fullName}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                      placeholder="Enter full name"
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.userName}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, userName: text }))}
                      placeholder="Enter username"
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Role</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                    >
                      <View style={styles.roleIconContainer}>
                        <MaterialIcons 
                          name={
                            formData.role === 'Manager' ? 'admin-panel-settings' :
                            formData.role === 'Store Clerk' ? 'store' :
                            formData.role === 'Dispatcher' ? 'local-shipping' :
                            formData.role === 'Rider' ? 'delivery-dining' :
                            'work'
                          } 
                          size={24} 
                          color={formData.role ? Color.otherOrange : '#64748B'} 
                        />
                        <Text style={styles.dropdownButtonText}>
                          {formData.role || 'Select Role'}
                        </Text>
                      </View>
                      <MaterialIcons 
                        name={showRoleDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>
                    
                    <Animated.View style={[styles.dropdownListContainer, { height: dropdownHeight }]}>
                      {roles.map((role, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, role }));
                            setShowRoleDropdown(false);
                          }}
                        >
                          <View style={styles.roleIconContainer}>
                            <MaterialIcons 
                              name={
                                role === 'Manager' ? 'admin-panel-settings' :
                                role === 'Store Clerk' ? 'store' :
                                role === 'Dispatcher' ? 'local-shipping' :
                                'delivery-dining'
                              } 
                              size={24} 
                              color={formData.role === role ? Color.otherOrange : '#64748B'} 
                            />
                            <View style={styles.roleTextContainer}>
                              <Text style={[
                                styles.dropdownItemText,
                                formData.role === role && styles.dropdownItemTextSelected
                              ]}>{role}</Text>
                              <Text style={styles.roleDescription}>
                                {role === 'Manager' ? 'Manages overall operations' :
                                 role === 'Store Clerk' ? 'Handles store inventory' :
                                 role === 'Dispatcher' ? 'Manages deliveries' :
                                 'Delivers orders'}
                              </Text>
                            </View>
                          </View>
                          {formData.role === role && (
                            <MaterialIcons name="check-circle" size={24} color={Color.otherOrange} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="contact-mail" size={20} color={Color.otherOrange} />
                  <Text style={styles.cardTitle}>Contact Details</Text>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                      placeholder="Enter email"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.phoneNumber}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="location-on" size={20} color={Color.otherOrange} />
                  <Text style={styles.cardTitle}>Location</Text>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Country</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.country}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
                      placeholder="Enter country"
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.city}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                      placeholder="Enter city"
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.address}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                      placeholder="Enter address"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleUpdate}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // Compensate for back button width
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: Color.otherOrange,
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Color.otherOrange,
    alignItems: 'center',
    shadowColor: Color.otherOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    maxHeight: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropdownListContainer: {
    position: 'relative',
    zIndex: 1000,
    maxHeight: 300,
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: 300, // Increased height for dropdown
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF8F3',
  },
  roleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  roleTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  dropdownItemTextSelected: {
    color: Color.otherOrange,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 13,
    color: '#64748B',
  },
});