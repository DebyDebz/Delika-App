import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { playNotificationSound } from '../utils/sound';
import NotificationAlert from '../components/NotificationAlert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
  read?: boolean;
  link?: '/menu-items' | '/menu-details' | '/orders' | '/profile' | '/settings' | '/transactions';
  itemId?: string;
}

const STORAGE_KEY = '@notifications';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load saved notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedNotifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    console.log('Current unread count:', count); // Debug log
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = useCallback(async (notification: Notification) => {
    console.log('Adding new notification:', notification); // Debug log
    const newNotifications = [{...notification, read: false}, ...notifications];
    setNotifications(newNotifications);
    await saveNotifications(newNotifications);
    setCurrentAlert(notification);
    await playNotificationSound();
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    const newNotifications = notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    );
    setNotifications(newNotifications);
    await saveNotifications(newNotifications);
  }, [notifications]);

  const clearNotification = useCallback(async (id: string) => {
    const newNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(newNotifications);
    await saveNotifications(newNotifications);
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        clearNotification,
        clearAllNotifications,
        unreadCount 
      }}
    >
      {currentAlert && (
        <NotificationAlert 
          notification={currentAlert}
          onDismiss={() => setCurrentAlert(null)}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (undefined === context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 