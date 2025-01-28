import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AddStaff from '../components/AddStaff'; // Ensure the correct path to AddStaff
import { Color } from '../constants/GlobalStyles';

const AddStaffMembers = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  const handleBack = () => {
    router.back();
  };

  console.log('AddStaffMembers component rendered');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Member</Text>
        <View style={styles.placeholder} />
      </View>
      <AddStaff 
        visible={modalVisible} // Pass the modal visibility state
        onClose={() => setModalVisible(false)} // Close the modal
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight,
    marginTop: -20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
});

export default AddStaffMembers;
