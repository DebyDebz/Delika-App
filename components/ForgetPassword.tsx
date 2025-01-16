import * as React from "react";
import { useState, useEffect } from "react";
import { 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  View, 
  Animated,
  Dimensions
} from "react-native";
import { AntDesign, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color, Border, FontSize, Gap, Padding } from '../constants/GlobalStyles';

interface ForgetPasswordProps {
  visible: boolean;
  onClose: () => void;
}

export default function ForgetPassword({ visible, onClose }: ForgetPasswordProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'email' | 'phone'>('email');
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  const handleOptionSelect = async (option: 'email' | 'phone') => {
    setSelectedOption(option);
    
    try {
      await AsyncStorage.setItem('resetType', option);
      await AsyncStorage.setItem('isResetTypeSelected', 'true');
      
      if (option === 'email') {
        onClose();
        setTimeout(() => {
          router.push('/email');
        }, 100);
      } else {
        onClose();
        setTimeout(() => {
          router.push('/phone');
        }, 100);
      }
    } catch (error) {
      console.error('Error saving reset type:', error);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View 
        style={[
          styles.forgotPassword,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Please select option to send link reset password
          </Text>

          <View style={styles.optionsContainer}>
            {/* Email Option */}
            <TouchableOpacity 
              style={[
                styles.option,
                selectedOption === 'email' && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect('email')}
            >
              <View style={styles.optionContent}>
                <MaterialCommunityIcons 
                  name="email-outline" 
                  size={24} 
                  color={selectedOption === 'email' ? Color.otherOrange : 'black'}
                  style={styles.optionIcon}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === 'email' && { color: Color.otherOrange }
                  ]}>
                    Send to your email
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    Link reset will be sent to your email address registered
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedOption === 'email' && styles.radioButtonSelected
                ]}>
                  {selectedOption === 'email' && (
                    <AntDesign name="check" size={14} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Phone Option */}
            <TouchableOpacity 
              style={[
                styles.option,
                selectedOption === 'phone' && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect('phone')}
            >
              <View style={styles.optionContent}>
                <MaterialIcons 
                  name="phone" 
                  size={24} 
                  color={selectedOption === 'phone' ? Color.otherOrange : 'black'}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === 'phone' && { color: Color.otherOrange }
                  ]}>
                    Send to your phone
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    Link reset will be sent to your phone number registered
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedOption === 'phone' && styles.radioButtonSelected
                ]}>
                  {selectedOption === 'phone' && (
                    <AntDesign name="check" size={14} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => handleOptionSelect(selectedOption)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  forgotPassword: {
    backgroundColor: Color.neutral10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 60,
    minHeight: '65%',
    maxHeight: '90%',
  },
  modalContent: {
    width: '100%',
    paddingVertical: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: -10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 40,
    marginTop: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
  },
  selectedOption: {
    borderColor: Color.otherOrange,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: Color.otherOrange,
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
});