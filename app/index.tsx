import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Keyboard, 
  Image,
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForgetPassword from '../components/ForgetPassword';
import LoginOTP from '../components/LoginOTP';

export default function Login() {
  const router = useRouter();
  // State management
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Check for existing session
  useEffect(() => {
    if (globalThis.userData) {
      router.replace("/home");
    }
  }, []);

  // Handle login
  const handleLogin = async () => {
    const { email, password } = credentials;

    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Login request
      const loginResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        Alert.alert('Error', loginData.message || 'Login failed');
        return;
      }

      // Fetch user data
      const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginData.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        globalThis.userData = userData;
        setShowOTPModal(true); // Show OTP modal instead of navigation
      } else {
        Alert.alert('Error', 'Failed to get user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Connection failed');
    }
  };

  // Render input field
  const renderInput = (type: 'email' | 'password') => {
    const isEmail = type === 'email';
    const value = credentials[type];
    
    return (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>
          {isEmail ? 'Email ' : 'Password'}
        </Text>
        <View style={[styles.inputContainer, value && styles.inputActive]}>
          <View style={styles.inputContent}>
            <Ionicons 
              name={isEmail ? "mail-outline" : "lock-closed-outline"} 
              size={20} 
              color={value ? "#FE5B18" : "#94A3B8"} 
            />
            <TextInput
              style={styles.input}
              placeholder={isEmail ? "Enter your email" : "Enter your password"}
              placeholderTextColor="#94A3B8"
              value={value}
              onChangeText={(text) => setCredentials(prev => ({
                ...prev,
                [type]: text
              }))}
              secureTextEntry={type === 'password' && !credentials.showPassword}
              autoCapitalize="none"
              keyboardType={isEmail ? "email-address" : "default"}
            />
          </View>
          {!isEmail && (
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setCredentials(prev => ({
                ...prev,
                showPassword: !prev.showPassword
              }))}
            >
              <Ionicons 
                name={credentials.showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          )}
        </View>
        
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#FFF5F1', '#FFFFFF']} style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={['#FE5B18', '#FF8C5F']}
                style={styles.logoBg}
              >
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </LinearGradient>
              
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.subtitleText}>Enter your credentials to continue</Text>

              {renderInput('email')}
              {renderInput('password')}

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.poweredByContainer}>
            <View style={styles.poweredByWrapper}>
              
              <View style={styles.poweredByContent}>
                <Text style={styles.poweredByText}>Powered by</Text>
                <Image 
                  source={require('../assets/images/Krontiva-Black.png')}
                  style={styles.krontivaLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        <ForgetPassword 
          visible={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
        <LoginOTP 
          visible={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          email={credentials.email}
          onVerify={(code) => {
            // Handle OTP verification
            setShowOTPModal(false);
            router.replace('/home');
          }}
        />
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    padding: 32,
    width: '100%',
    maxWidth: 420,
    
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: -20,
    marginTop: -20,
  },
  logoBg: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  logo: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  brandText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  formSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 32,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 52,
    overflow: 'hidden',
  },
  inputActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FE5B18',
    shadowColor: '#FE5B18',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    height: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: '#FE5B18',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FE5B18',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FE5B18',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  poweredByContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 16,
  },
  poweredByWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E5F3EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poweredByContent: {
    alignItems: 'center',
  },
  poweredByText: {
    fontSize: 12,
    color: '#64748B',
  },
  krontivaLogo: {
    width: 80,
    height: 24,
    marginTop: 2,
    tintColor: '#16A34A'
  },
})