import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import NotificationModal from './NotificationModal';
import { Color } from '../constants/GlobalStyles';

interface NotificationIconProps {
  color?: string;
}

export default function NotificationIcon({ color = '#FFFFFF' }: NotificationIconProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount, notifications } = useNotification();

  useEffect(() => {
    console.log('NotificationIcon - Current unread count:', unreadCount);
    console.log('NotificationIcon - Total notifications:', notifications.length);
  }, [unreadCount, notifications]);

  return (
    <>
      <TouchableOpacity 
        style={styles.notificationContainer}
        onPress={() => {
          console.log('Notification icon pressed, current count:', unreadCount);
          setShowNotifications(true);
        }}
      >
        <Ionicons 
          name="notifications-outline"
          size={24}
          color={color}
        />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: Color.otherOrange }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationModal 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
}); 