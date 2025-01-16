import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Color } from '../constants/GlobalStyles';
import PasswordSuccess from './PasswordSuccess';

interface ResetPasswordProps {
  visible: boolean;
  onClose: () => void;
  email: string;
}

export default function ResetPassword({ visible, onClose, email }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(true);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return '#FF0000';
    if (strength <= 50) return '#FFA500';
    if (strength <= 75) return '#90EE90';
    return '#008000';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const checkPasswordMatch = (confirmPass: string) => {
    setConfirmPassword(confirmPass);
    if (confirmPass && password !== confirmPass) {
      setPasswordError("Passwords don't match");
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordChange = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (getPasswordStrength(password) <= 50) {
      Alert.alert('Error', 'Please use a stronger password');
      return;
    }

    try {
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/change/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          router.push('/');
        }, 2000);
      } else {
        Alert.alert('Error', data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to update password');
    }
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.overlay,
        { 
          justifyContent: isKeyboardVisible ? 'flex-start' : 'flex-end',
          paddingTop: isKeyboardVisible ? 100 : 0  // Add padding when keyboard is visible
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            minHeight: isKeyboardVisible ? '55%' : '35%',
            borderRadius: isKeyboardVisible ? 20 : 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }
        ]}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a new password that is safe and easy to remember
          </Text>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="lock-outline" 
              size={20} 
              color="#666" 
            />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.strengthSection}>
            <View style={styles.strengthContainer}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${getPasswordStrength(password)}%`,
                    backgroundColor: getStrengthColor(getPasswordStrength(password)),
                  },
                ]}
              />
            </View>
            <Text style={[
              styles.strengthText,
              { color: getStrengthColor(getPasswordStrength(password)) }
            ]}>
              {getStrengthText(getPasswordStrength(password))}
            </Text>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="lock-outline" 
              size={20} 
              color="#666" 
            />
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={checkPasswordMatch}
              placeholder="Confirm new password"
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcons 
                name={showConfirmPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <TouchableOpacity 
            style={styles.button}
            onPress={handlePasswordChange}
          >
            <Text style={styles.buttonText}>Confirm New Password</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <PasswordSuccess 
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </KeyboardAvoidingView>
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
  container: {
    backgroundColor: Color.neutral10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: '35%',
  },
  content: {
    width: '100%',
    paddingVertical: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 16,
    width: 327,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
    paddingRight: 10,
  },
  strengthSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 25,
    gap: 10,
  },
  strengthContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '500',
    width: 50,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 25,
  },
  button: {
    backgroundColor: Color.otherOrange,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    width: 327,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
