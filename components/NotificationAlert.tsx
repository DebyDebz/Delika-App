import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Notification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

interface NotificationAlertProps {
  notification: Notification;
  onDismiss: () => void;
}

export default function NotificationAlert({ notification, onDismiss }: NotificationAlertProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.sequence([
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }),
      // Wait for 3 seconds
      Animated.delay(3000),
      // Slide out
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => onDismiss());
  }, []);

  const handlePress = () => {
    if (notification.itemId) {
      router.push({
        pathname: '/menu-details',
        params: { id: notification.itemId }
      });
    } else if (notification.link) {
      router.push(notification.link as any);
    }
    onDismiss();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <Ionicons name="notifications-outline" size={24} color="#FFF" />
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    backgroundColor: '#333',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'column',
    padding: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: '#EEE',
    fontSize: 14,
  }
}); 