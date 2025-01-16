import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AddStaff from '../components/AddStaff'; // Ensure the correct path to AddStaff
import { Color } from '../constants/GlobalStyles';

const AddStaffMembers = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  console.log('AddStaffMembers component rendered');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} // Navigate back
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Color.otherOrange} />
        </TouchableOpacity>
        <View style={styles.header}>
          <MaterialIcons name="person-add" size={24} color={Color.otherOrange} />
          <Text style={styles.headerText}>New Staff Member</Text>
        </View>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Color.otherOrange,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 12,
    color: Color.otherOrange,
  },
});

export default AddStaffMembers;
