import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Text, 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../constants/GlobalStyles';
import OTP from './Otp';


interface EnterEmailProps {
  visible: boolean;
  onClose: () => void;
}

export default function EnterEmail({ visible, onClose }: EnterEmailProps) {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  React.useEffect(() => {
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

  const handleSendLink = async () => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/reset/user/password/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowOTP(true);
      } else {
        alert(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send reset link');
    }
  };

  const handleOTPVerify = (code: string) => {
    console.log('OTP verified:', code);
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.overlay,
        { justifyContent: isKeyboardVisible ? 'flex-start' : 'flex-end' }
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
            minHeight: isKeyboardVisible ? '45%' : '55%',
            marginTop: isKeyboardVisible ? 170 : 0,
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

          <Text style={styles.title}>Enter your Email</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you{'\n'}
            confirmation code to reset your password
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons 
                name="mail-outline"
                size={20} 
                color="#666" 
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleSendLink}
          >
            <Text style={styles.buttonText}>Send </Text>
          </TouchableOpacity>
        </View>

        <OTP 
          visible={showOTP}
          onClose={() => setShowOTP(false)}
          onVerify={handleOTPVerify}
          email={email}
          phoneNumber=""
        />
      </Animated.View>
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
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: '55%',
  },
  content: {
    width: '100%',
    paddingVertical: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
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
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingHorizontal: 10,
    height: 50,
    width: 327,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
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