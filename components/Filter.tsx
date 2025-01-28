import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface FilterProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export default function Filter({ visible, onClose, onSelect }: FilterProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Today', value: 'Today' },
    { label: 'Last Week', value: 'Last Week' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
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
                setSelectedFilter(option.value);
                onSelect(option.value);
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    minHeight: '30%',
    marginBottom: 200,
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 16,
    color: '#000000',
  },
});