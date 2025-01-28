import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import axios from 'axios';
import { Calendar, DateData } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';

interface AddStaffProps {
  visible: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  image: string;
  role: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  dateOfBirth: Date;
}

const AddStaff = ({ visible, onClose }: AddStaffProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    image: '',
    role: '',
    userName: '',
    fullName: '',
    phoneNumber: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: new Date(),
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownHeight = useSharedValue(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const roles = [
    { label: "Manager", icon: "admin-panel-settings", description: "Manages overall operations" },
    { label: "Store Clerk", icon: "store", description: "Handles store inventory" },
    { label: "Dispatcher", icon: "local-shipping", description: "Manages deliveries" },
    { label: "Rider", icon: "delivery-dining", description: "Delivers orders" }
  ];

  const renderInput = (
    label: string, 
    value: string, 
    key: keyof typeof formData,
    icon: keyof typeof MaterialIcons.glyphMap
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons name={icon} size={20} color={Color.otherOrange} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  const contactSectionStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(showRoleDropdown ? 200 : 0, {
            damping: 12,
            stiffness: 90
          })
        }
      ]
    };
  });

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.email || !formData.role || !formData.fullName || !formData.phoneNumber) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const requestData = new FormData();
      requestData.append('OTP', '0');
      requestData.append('city', formData.city || '');
      requestData.append('role', formData.role);
      requestData.append('email', formData.email);
      requestData.append('image', 'null');
      requestData.append('Status', 'false');
      requestData.append('address', formData.address || '');
      requestData.append('country', formData.country || '');
      requestData.append('Location', JSON.stringify({ lat: 0, long: 0 }));
      requestData.append('branchId', globalThis.userData?.branchId || '');
      requestData.append('fullName', formData.fullName);
      requestData.append('userName', formData.userName || '');
      requestData.append('created_at', Date.now().toString());
      requestData.append('postalCode', formData.postalCode || '');
      requestData.append('dateOfBirth', formData.dateOfBirth.toISOString().split('T')[0]);
      requestData.append('phoneNumber', formData.phoneNumber);
      requestData.append('restaurantId', globalThis.userData?.restaurantId || '');

      const response = await axios.post(
        'https://api-server.krontiva.africa/api:uEBBwbSs/add/member/to/restaurant',
        requestData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          }
        }
      );

      if (response.data) {
        Alert.alert('Success', 'Staff member added successfully', [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              router.push('/staff-members');
            }
          }
        ]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          message: error.message
        });
      }
      Alert.alert('Error', 'Failed to add staff member');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderInput('Full Name', formData.fullName, 'fullName', 'person')}
          {renderInput('Username', formData.userName, 'userName', 'account-circle')}
          {renderInput('Email', formData.email, 'email', 'email')}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              <MaterialIcons name="work" size={20} color={Color.otherOrange} style={styles.inputIcon} />
              <Text style={[styles.input, !formData.role && styles.placeholderText]}>
                {formData.role || "Select Role"}
              </Text>
              <MaterialIcons 
                name={showRoleDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
            {showRoleDropdown && (
              <View style={styles.dropdownListContainer}>
                {roles.map((role, index) => (
                  <React.Fragment key={role.label}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, role: role.label });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <MaterialIcons 
                        name={role.icon as keyof typeof MaterialIcons.glyphMap}
                        size={20} 
                        color={formData.role === role.label ? Color.otherOrange : '#6B7280'} 
                      />
                      <View style={styles.dropdownTextContainer}>
                        <Text style={[styles.dropdownText, formData.role === role.label && styles.selectedDropdownText]}>
                          {role.label}
                        </Text>
                        <Text style={styles.roleDescription}>{role.description}</Text>
                      </View>
                      {formData.role === role.label && (
                        <MaterialIcons 
                          name="check" 
                          size={20} 
                          color={Color.otherOrange} 
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                    {index < roles.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color={Color.otherOrange} style={styles.inputIcon} />
              <Text style={styles.input}>
                {formData.dateOfBirth.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <Modal
              isVisible={showDatePicker}
              onBackdropPress={() => setShowDatePicker(false)}
              style={styles.modalView}
            >
              <View style={styles.datePickerContainer}>
                <Calendar
                  current={formatDate(formData.dateOfBirth)}
                  onDayPress={(day: DateData) => {
                    setFormData({ ...formData, dateOfBirth: new Date(day.timestamp) });
                    setShowDatePicker(false);
                  }}
                  markedDates={{
                    [formatDate(formData.dateOfBirth)]: {
                      selected: true,
                      selectedColor: Color.otherOrange,
                    }
                  }}
                  theme={{
                    selectedDayBackgroundColor: Color.otherOrange,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: Color.otherOrange,
                    arrowColor: Color.otherOrange,
                    monthTextColor: Color.otherOrange,
                    textMonthFontWeight: 'bold',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14
                  }}
                />
              </View>
            </Modal>
          </View>
        </View>

        <Animated.View style={[styles.section, contactSectionStyle]}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          {renderInput('Phone Number', formData.phoneNumber, 'phoneNumber', 'phone')}
          {renderInput('Address', formData.address, 'address', 'location-on')}
          {renderInput('City', formData.city, 'city', 'location-city')}
          {renderInput('Postal Code', formData.postalCode, 'postalCode', 'markunread-mailbox')}
          {renderInput('Country', formData.country, 'country', 'public')}
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <MaterialIcons name="check" size={24} color="#FFF" />
            <Text style={styles.submitButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4B5563',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownListContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  selectedDropdownText: {
    color: Color.otherOrange,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: Color.otherOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: Color.otherOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  roleDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
  modalView: {
    justifyContent: 'center',
    margin: 20,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
});

export default AddStaff;
