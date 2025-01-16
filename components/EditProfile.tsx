import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { Color } from '../constants/GlobalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const [profileData, setProfileData] = useState({
    userName: globalThis.userData?.userName || '',
    fullName: globalThis.userData?.fullName || '',
    email: globalThis.userData?.email || '',
    phoneNumber: globalThis.userData?.phoneNumber || '',
    userId: globalThis.userData?.id || '',
    restaurantId: globalThis.userData?.restaurantId || '',
    branchId: globalThis.userData?.branchId || '',
    address: globalThis.userData?.address || '',
    city: globalThis.userData?.city || '',
    country: globalThis.userData?.country || 'Ghana',
    dateOfBirth: globalThis.userData?.dateOfBirth || '',
    postalCode: globalThis.userData?.postalCode || '',
    restaurantName: globalThis.userData?._restaurantTable[0]?.restaurantName || '',
    branchLocation: globalThis.userData?.branchesTable?.branchLocation || '',
    role: globalThis.userData?.role || ''
  });
  const [profileImage, setProfileImage] = useState(globalThis.userData?.image?.url || null);

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
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpdate = async () => {
    try {
      const userId = globalThis.userData?.id;
      console.log('Updating profile for user:', userId);

      const formData = new FormData();
      
      if (profileImage && !profileImage.startsWith('http')) {
        formData.append('photo', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile-image.jpg'
        } as any);
      }

      const requestBody = {
        userId: userId,
        userName: profileData.userName,
        fullName: profileData.fullName,
        email: profileData.email,
        role: profileData.role,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        dateOfBirth: profileData.dateOfBirth,
        postalCode: profileData.postalCode,
        restaurantId: globalThis.userData?.restaurantId,
        branchId: globalThis.userData?.branchId,
        restaurantName: profileData.restaurantName,
        branchLocation: profileData.branchLocation,
        photo: profileImage
      };

      Object.entries(requestBody).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      console.log('FormData:', formData);

      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_user_table/${userId}`, 
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        globalThis.userData = {
          ...globalThis.userData,
          ...profileData
        };
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const renderInput = (
    label: string, 
    value: string, 
    key: keyof typeof profileData, 
    icon: keyof typeof MaterialIconsType.glyphMap, 
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons name={icon} size={20} color={Color.otherOrange} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, [key]: text }))}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const renderReadOnlyField = (
    label: string,
    value: string,
    icon: keyof typeof MaterialIconsType.glyphMap
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
        <MaterialIcons name={icon} size={20} color={Color.otherOrange} style={styles.inputIcon} />
        <Text style={styles.readOnlyText}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imageWithIconContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialIcons name="person" size={40} color="#666666" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
            <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderInput('Username', profileData.userName, 'userName', 'person')}
        {renderReadOnlyField('Role', profileData.role, 'badge')}
        {renderInput('Full Name', profileData.fullName, 'fullName', 'person')}
        {renderInput('Date of Birth', profileData.dateOfBirth, 'dateOfBirth', 'event')}
        {renderInput('Email', profileData.email, 'email', 'mail')}
        {renderInput('Phone Number', profileData.phoneNumber, 'phoneNumber', 'phone')}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        {renderInput('Address', profileData.address, 'address', 'place')}
        {renderInput('City', profileData.city, 'city', 'location-city')}
        {renderInput('Country', profileData.country, 'country', 'public')}
        {renderInput('Postal Code', profileData.postalCode, 'postalCode', 'local-post-office')}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restaurant Information</Text>
        {renderInput('Restaurant Name', profileData.restaurantName, 'restaurantName', 'storefront')}
        {renderInput('Branch Location', profileData.branchLocation, 'branchLocation', 'store')}
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <MaterialIcons name="check" size={24} color="#FFF" />
        <Text style={styles.updateButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  updateButton: {
    backgroundColor: Color.otherOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: Color.otherOrange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWithIconContainer: {
    position: 'relative',
    width: 140,
    height: 120,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    backgroundColor: Color.otherOrange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  readOnlyWrapper: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  readOnlyText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 12,
  },
});
