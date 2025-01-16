import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { OrderFilters } from '../types/orders';

interface FilterProps {
  visible?: boolean;
  onClose: () => void;
  selectedFilter: string;
  onApplyFilters: (filters: OrderFilters) => void;
}

export default function OrdersFilter({ visible, onClose, selectedFilter, onApplyFilters }: FilterProps) {
  const [localFilter, setLocalFilter] = useState(selectedFilter);
  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Pick Up', value: 'Pickup' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'On The Way', value: 'OnTheWay' },
    { label: 'Ready For Pickup', value: 'ReadyForPickup' },
  ];

  useEffect(() => {
    setLocalFilter(selectedFilter);
  }, [selectedFilter]);

  const handleFilterSelect = (option: { label: string; value: string }) => {
    setLocalFilter(option.value);
    onApplyFilters({ orderStatus: option.value });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.filterSubtitle}>Choose categories you want to show</Text>
            
            {filterOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.filterOption,
                  index === filterOptions.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  setLocalFilter(option.value);
                  onApplyFilters({ orderStatus: option.value });
                }}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioOuter,
                    selectedFilter === option.value && styles.radioOuterSelected
                  ]}>
                    {selectedFilter === option.value && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 310,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    width: '95%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 20,
    minHeight: '60%',
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
  filterSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 20,
  },
  filterOption: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    width: '100%',
    marginVertical: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 30,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  radioOuterSelected: {
    borderColor: '#FE5B18',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FE5B18',
  },
  optionLabel: {
    fontSize: 18,
    color: '#000000',
    flex: 1,
  },
});
