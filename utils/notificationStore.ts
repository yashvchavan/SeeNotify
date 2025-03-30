import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from '../type';

const NOTIFICATIONS_STORAGE_KEY = '@notifications';
let cachedNotifications: Notification[] = [];

// Load notifications from storage
export const loadNotifications = async (): Promise<void> => {
  try {
    const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (storedNotifications !== null) {
      cachedNotifications = JSON.parse(storedNotifications);
    }
  } catch (error) {
    console.error('Error loading notifications from storage:', error);
  }
};

// Initialize the store
(async () => {
  await loadNotifications();
})();

// Get all notifications (no need to wait for AsyncStorage)
export const getNotifications = (): Notification[] => {
  return [...cachedNotifications].sort((a, b) => {
    // Convert time strings to Date objects for comparison
    const getTimeValue = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let value = hours * 60 + minutes;
      if (period === 'PM' && hours !== 12) value += 12 * 60;
      if (period === 'AM' && hours === 12) value -= 12 * 60;
      return value;
    };
    
    const timeA = getTimeValue(a.time);
    const timeB = getTimeValue(b.time);
    
    // Sort by time descending (newest first)
    return timeB - timeA;
  });
};

// Define a partial notification type for input
type PartialNotification = Partial<Notification> & { packageName?: string };

// Save a new notification
export const saveNotification = async (notification: PartialNotification): Promise<Notification | null> => {
  try {
    // Create a notification object with all required fields
    const newNotification: Notification = {
      id: notification.id || String(Date.now()),
      app: notification.app || 'Unknown',
      sender: notification.sender || 'Unknown',
      message: notification.message || '',
      time: notification.time || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      title: notification.title || '',
      category: notification.category || 'all',
      isRead: notification.isRead || false,
      icon: notification.icon || 'Bell'
    };
    
    // Add to cached notifications
    cachedNotifications = [newNotification, ...cachedNotifications];
    
    // Limit the number of stored notifications (optional)
    if (cachedNotifications.length > 100) {
      cachedNotifications = cachedNotifications.slice(0, 100);
    }
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cachedNotifications));
    
    return newNotification;
  } catch (error) {
    console.error('Error saving notification:', error);
    return null;
  }
};

// Mark a notification as read
export const markAsRead = async (id: string): Promise<boolean> => {
  try {
    const index = cachedNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      cachedNotifications[index].isRead = true;
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cachedNotifications));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    cachedNotifications = cachedNotifications.filter(n => n.id !== id);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cachedNotifications));
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

// Clear all notifications
export const clearAllNotifications = async (): Promise<boolean> => {
  try {
    cachedNotifications = [];
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cachedNotifications));
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};