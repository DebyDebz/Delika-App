import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EditProfile from '../components/EditProfile';

export default function ProfileEditScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                console.log('Back pressed from profile edit');
                router.navigate('/settings');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            color: '#1A1A1A',
            fontSize: 18,
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      />
      <EditProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginLeft: 10,
    padding: 8,
    zIndex: 1,
  },
});
