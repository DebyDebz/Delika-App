import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Color } from '../constants/GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ViewProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const getProfileImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem('userProfileImage');
        setProfileImage(storedImage);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    getProfileImage();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileImageSection}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../assets/images/logo.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <MaterialIcons name="photo-camera" size={24} color="#FFF" />
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Add more profile details here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.otherOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  changePhotoText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
  },
}); 