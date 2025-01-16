import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../constants/GlobalStyles';
import ResetPassword from './ResetPassword';
import { BlurView } from 'expo-blur';


interface OTPProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  phoneNumber?: string;
  email: string;
}

export default function OTP({ visible, onClose, onVerify, phoneNumber, email }: OTPProps) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(32);
  const [maskedValue, setMaskedValue] = useState<string>('');
  const inputs = useRef<Array<TextInput | null>>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      const lastFour = phoneNumber.slice(-4);
      const masked = `****-****-${lastFour}`;
      setMaskedValue(masked);
    } else if (email) {
      const [username, domain] = email.split('@');
      const visibleCount = Math.min(2, username.length);
      const asteriskCount = Math.max(0, username.length - visibleCount);
      const maskedUsername = username.slice(0, visibleCount) + '*'.repeat(asteriskCount);
      setMaskedValue(`${maskedUsername}@${domain}`);
    }
  }, [phoneNumber, email]);

  useEffect(() => {
    if (visible) {
      sendOTPEmail();
    }
  }, [visible]);

  const sendOTPEmail = async () => {
    try {
      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/reset/user/password/email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      );

      if (!response.ok) {
        Alert.alert('Error', 'Failed to send OTP');
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
      onClose();
    }
  };

  const verifyOTP = async (code: string) => {
    try {
      const response = await fetch(
        'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otp: code,
            type: true,
            contact: email
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        onClose();
        router.replace('/home');
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleButtonPress = () => {
    if (timer === 0) {
      setTimer(60);
    } else {
      handleVerify();
    }
  };

  const handleVerify = () => {
    if (otp.join('').length === 4) {
      verifyOTP(otp.join(''));
    } else {
      Alert.alert('Error', 'Please enter a valid 4-digit code');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={50} style={styles.backdrop} />
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
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

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Please enter the 4-digit code sent to{'\n'}
            <Text style={styles.maskedValue}>{maskedValue || 'your contact'}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={index}
                ref={(input) => (inputs.current[index] = input)}
                style={[
                  styles.otpInput,
                  otp[index] ? styles.otpInputFilled : null
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index]}
                onChangeText={(value) => handleOtpChange(value, index)}
              />
            ))}
          </View>

          <Text style={styles.timer}>
            Resend code in {timer}s
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleButtonPress}
          >
            <Text style={styles.buttonText}>
              {timer === 0 ? 'Send Code Again' : 'Verify Code'}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Color.neutral10,
    borderRadius: 20,
    padding: 10,
    width: '90%',
    maxWidth: 400,
    marginHorizontal: 20,
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
    marginBottom: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  maskedValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: '#F5F5F5',
    marginVertical: -15,
  },
  otpInputFilled: {
    borderColor: Color.otherOrange,
    backgroundColor: '#FFF',
  },
  timer: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: Color.otherOrange,
    borderRadius: 25,
    height: 50,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
