import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification, Notification } from '../context/NotificationContext';
import { Color } from '../constants/GlobalStyles';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { notifications, markAsRead, clearNotification } = useNotification();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(1000);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 200,
      useNativeDriver: true
    }).start(() => onClose());
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    
    // If same day, show only time
    if (now.toDateString() === notifDate.toDateString()) {
      return notifDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If this year, show date without year
    if (now.getFullYear() === notifDate.getFullYear()) {
      return notifDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      }) + ' ' + notifDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If different year, show full date
    return notifDate.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' ' + notifDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {isSearching ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notifications..."
            autoFocus
          />
          <TouchableOpacity onPress={() => {
            setIsSearching(false);
            setSearchQuery('');
          }}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsSearching(true)}
            >
              <Ionicons name="search-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add your refresh logic here
    setRefreshing(false);
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.link) {
      onClose();
      if (notification.itemId) {
        // For menu items, navigate to menu-details with the item ID
        router.push({
          pathname: '/menu-details',
          params: { id: notification.itemId }
        });
      } else {
        router.push(notification.link as any);
      }
    }
  };

  const renderNotificationItem = (notification: Notification) => {
    const renderRightActions = (
      progressAnimatedValue: Animated.AnimatedInterpolation<string | number>,
      dragAnimatedValue: Animated.AnimatedInterpolation<string | number>
    ) => {
      return (
        <TouchableOpacity 
          style={styles.deleteAction}
          onPress={() => clearNotification(notification.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable key={notification.id} renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !notification.read && styles.unreadItem
          ]}
          onPress={() => handleNotificationPress(notification)}
        >
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(notification.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderHeader()}

          <ScrollView 
            style={styles.notificationList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              filteredNotifications.map((notification) => (
                <View key={notification.id}>
                  {renderNotificationItem(notification)}
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '100%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingTop: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  notificationList: {
    padding: 15,
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadItem: {
    backgroundColor: '#FFF5F1',
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    padding: 10,
  },
  deleteAction: {
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
}); 