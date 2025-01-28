import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Branch {
  id: string;
  branchName: string;
  branchLocation: string;
}

interface BranchFilterProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (branch: Branch) => void;
}

export default function BranchFilter({ visible, onClose, onSelect }: BranchFilterProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBranches = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const restaurantId = globalThis.userData?.restaurantId || '';
      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/get/restaurant/branch?restaurantId=${restaurantId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setBranches(data);
        await AsyncStorage.setItem('branchData', JSON.stringify(data));
      } else {
        setError('Invalid data received');
      }
    } catch (err) {
      setError('Failed to fetch branches');
      try {
        const cachedData = await AsyncStorage.getItem('branchData');
        if (cachedData) {
          setBranches(JSON.parse(cachedData));
          setError('');
        }
      } catch (cacheErr) {
        console.error('Cache retrieval error:', cacheErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBranches(false);
  }, []);

  useEffect(() => {
    if (visible) {
      fetchBranches();
    }
  }, [visible]);

  const handleBranchSelect = async (branch: Branch) => {
    try {
      await AsyncStorage.setItem('selectedBranch', JSON.stringify(branch));
      onSelect(branch);
      onClose();
    } catch (err) {
      console.error('Error saving selected branch:', err);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Select Branch</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FE5B18" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#FE5B18"]}
                />
              }
            >
              {branches.map((branch) => (
                <TouchableOpacity
                  key={branch.id}
                  style={styles.filterOption}
                  onPress={() => handleBranchSelect(branch)}
                >
                  <View>
                    <Text style={styles.branchName}>{branch.branchName}</Text>
                    <Text style={styles.location}>{branch.branchLocation}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 20,
    minHeight: '30%',
    marginBottom: 300,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    fontSize: 24,
    color: '#000000',
    padding: 5,
  },
  filterOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
