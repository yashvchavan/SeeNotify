import { Platform, NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';
import { addNotification } from './notificationStore';
import * as Notifications from 'expo-notifications';

const { NotificationListener } = NativeModules;

let notificationSubscription: EmitterSubscription | null = null;

/**
 * Check if the notification listener permission is enabled
 */
export async function isPermissionEnabled(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  try {
    return await NotificationListener.isPermissionEnabled();
  } catch (error) {
    console.error('Error checking notification listener permission:', error);
    return false;
  }
}

/**
 * Request notification listener permission by opening system settings
 */
export async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  try {
    return await NotificationListener.requestPermission();
  } catch (error) {
    console.error('Error requesting notification listener permission:', error);
    return false;
  }
}

/**
 * Start listening for notifications from the native module
 */
export function startListening(): void {
  if (Platform.OS !== 'android') {
    console.log('Native notification listener is only available on Android');
    return;
  }
  
  try {
    // Create event emitter
    const eventEmitter = new NativeEventEmitter(NotificationListener);
    
    // Remove previous subscription if exists
    if (notificationSubscription) {
      notificationSubscription.remove();
    }
    
    // Listen for notifications
    notificationSubscription = eventEmitter.addListener('notificationReceived', (event) => {
      console.log('Notification received from native module:', event);
      
      // Convert to the format expected by the notification store
      const notification = {
        date: event.postTime, // Use the timestamp directly as a number
        request: {
          identifier: event.id,
          content: {
            title: event.title || null,
            body: event.body || null,
            subtitle: event.subText || null,
            data: {
              appName: event.appName,
              packageName: event.packageName
            },
            sound: 'default', // Add required sound property
          } as Notifications.NotificationContent, // Add type assertion
          trigger: { type: 'push' } as any
        }
      } as Notifications.Notification; // Add type assertion
      
      // Add to the notification store
      addNotification(notification);
    });
  } catch (error) {
    console.error('Error setting up notification listener:', error);
  }
}

/**
 * Stop listening for notifications
 */
export function stopListening(): void {
  if (notificationSubscription) {
    notificationSubscription.remove();
    notificationSubscription = null;
  }
} 