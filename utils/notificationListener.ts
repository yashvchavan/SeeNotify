import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addNotification, initNotificationStore } from './notificationStore';
import { requestNotificationPermissions, canAccessNotifications } from './notificationPermissions';
import * as NativeNotificationListener from './nativeNotificationListener';

let isListenerInitialized = false;

/**
 * Set up notification handling for the app
 */
export async function setupNotificationListener(): Promise<boolean> {
  // Don't set up the listener multiple times
  if (isListenerInitialized) {
    return true;
  }
  
  // Initialize the notification store
  await initNotificationStore();
  
  // For Android, attempt to use the native notification listener
  if (Platform.OS === 'android') {
    const isEnabled = await NativeNotificationListener.isPermissionEnabled();
    if (isEnabled) {
      console.log('Native notification listener permission is enabled, starting listener');
      NativeNotificationListener.startListening();
      isListenerInitialized = true;
      return true;
    } else {
      console.log('Native notification listener permission is not enabled');
    }
  }
  
  // For iOS or if Android native listener is not enabled, fall back to standard Expo notifications
  // Check if we can access notifications on this device
  if (!canAccessNotifications()) {
    console.log('This device cannot access notifications from other apps');
    if (Platform.OS === 'ios') {
      // For iOS, we can still listen to notifications sent directly to our app
      await setupExpoNotificationListener();
      return true;
    }
    return false;
  }
  
  // Request notification permissions
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return false;
  }
  
  // Set up Expo notification listener
  await setupExpoNotificationListener();
  return true;
}

/**
 * Set up the Expo notification listener
 */
async function setupExpoNotificationListener(): Promise<void> {
  // Configure how notifications are handled when the app is in the foreground
  try{
    Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  
  // Listen for notifications
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received through Expo:', notification);
    addNotification(notification);
  });
}catch(error){
  console.error('Error setting up notification listener:', error);
}
  isListenerInitialized = true;
}

/**
 * Request to listen to system notifications - this is only for Android
 */
export async function requestSystemNotificationListener(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.log('System notification listener is only available on Android');
    return false;
  }
  if (!NativeNotificationListener) {
    console.error('NotificationListener module is not available');
    return false;
  }
  try {
    console.log('Requesting notification listener permission');
    // Use the native module to request permission
    const result = await NativeNotificationListener.requestPermission();
    console.log('Permission request result:', result);
    // If permission was successfully requested (user was taken to settings)
    if (result) {
      // Check if the permission is now granted after the user returns
      const isEnabled = await NativeNotificationListener.isPermissionEnabled();
      console.log('Permission enabled:', isEnabled);
      if (isEnabled) {
        // Start listening now that we have permission
        NativeNotificationListener.startListening();
        isListenerInitialized = true;
      }
      return isEnabled;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting system notification listener:', error);
    return false;
  }
} 