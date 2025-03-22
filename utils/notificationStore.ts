import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../type';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react-native';

// Storage key for persisting notifications
const STORAGE_KEY = 'seenotify_notifications';

// Keep track of notifications in memory
let notifications: Notification[] = [];

/**
 * Convert an Expo notification to our app's notification format
 */
function convertNotification(notification: Notifications.Notification): Notification | null {
  try {
    const { request, date } = notification;
    const { content } = request;
    
    // Skip notifications without content
    if (!content.title && !content.body) {
      return null;
    }

    // Get app name from the notification or default to Unknown
    const appName = content.data?.appName || content.data?.app || 'Unknown App';
    
    // Determine an appropriate icon based on app name or content
    let icon = Bell;
    const appLower = appName.toLowerCase();
    
    if (appLower.includes('mail') || appLower.includes('gmail') || appLower.includes('outlook')) {
      icon = Mail;
    } else if (appLower.includes('chat') || appLower.includes('message') || 
               appLower.includes('whatsapp') || appLower.includes('telegram')) {
      icon = MessageSquare;
    }
    
    // Format the time
    const timeDate = new Date(date);
    const now = new Date();
    
    let timeString: string;
    if (timeDate.toDateString() === now.toDateString()) {
      // Today, show time
      timeString = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeDate.getTime() > now.getTime() - 86400000) {
      // Yesterday
      timeString = 'Yesterday';
    } else {
      // Earlier
      timeString = timeDate.toLocaleDateString();
    }

    return {
      id: request.identifier,
      app: appName,
      title: content.title || '',
      sender: content.subtitle || appName,
      message: content.body || '',
      time: timeString,
      category: content.data?.category || 'all',
      isRead: false,
      icon: icon,
      // Store the original date for sorting
      receivedAt: new Date(date)
    };
  } catch (error) {
    console.error('Error converting notification:', error);
    return null;
  }
}

/**
 * Initialize the notification store and load saved notifications
 */
export async function initNotificationStore(): Promise<void> {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedData) {
      notifications = JSON.parse(savedData);
      
      // Convert string dates back to Date objects
      notifications.forEach(notification => {
        if (notification.receivedAt) {
          notification.receivedAt = new Date(notification.receivedAt);
        }
      });
      
      console.log(`Loaded ${notifications.length} saved notifications`);
    }
  } catch (error) {
    console.error('Error loading saved notifications:', error);
  }
}

/**
 * Save the current notifications to persistent storage
 */
async function saveNotifications(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

/**
 * Add a new notification to the store
 */
export function addNotification(notification: Notifications.Notification): void {
  const converted = convertNotification(notification);
  
  if (converted) {
    // Add to the beginning of the array (newest first)
    notifications = [converted, ...notifications];
    
    // Keep only the most recent 100 notifications
    if (notifications.length > 100) {
      notifications = notifications.slice(0, 100);
    }
    
    // Save to persistent storage
    saveNotifications();
  }
}

/**
 * Get all stored notifications
 */
export function getNotifications(): Notification[] {
  return [...notifications];
}

/**
 * Mark a notification as read
 */
export function markAsRead(id: string): void {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    saveNotifications();
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(id: string): void {
  notifications = notifications.filter(n => n.id === id);
  saveNotifications();
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  notifications = [];
  saveNotifications();
} 