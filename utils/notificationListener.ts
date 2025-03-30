import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { saveNotification } from './notificationStore';
import type { Notification } from '../type';

const { NotificationModule } = NativeModules;
const notificationEmitter = new NativeEventEmitter(NotificationModule);

let listenerSubscription: any = null;

export const setupNotificationListener = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.log('Notification listener is only available on Android');
    return false;
  }

  try {
    // Check if permission is already granted
    const hasPermission = await NotificationModule.setupNotificationListener();
    
    if (hasPermission) {
      // Set up the event listener
      if (!listenerSubscription) {
        listenerSubscription = notificationEmitter.addListener(
          'onNotificationReceived',
          (notification: Notification) => {
            console.log('Notification received:', notification);
            saveNotification(notification);
          }
        );
        
        // Add the module's addListener method (required for newer RN versions)
        NotificationModule.addListener('onNotificationReceived');
      }
      
      return true;
    } else {
      console.log('Notification listener permission not granted');
      return false;
    }
  } catch (error) {
    console.error('Error setting up notification listener:', error);
    return false;
  }
};

export const requestSystemNotificationListener = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.log('Notification listener is only available on Android');
    return false;
  }

  try {
    return await NotificationModule.requestNotificationPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const checkNotificationListenerStatus = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    return await NotificationModule.isNotificationListenerEnabled();
  } catch (error) {
    console.error('Error checking notification listener status:', error);
    return false;
  }
};

export const cleanupNotificationListener = (): void => {
  if (listenerSubscription) {
    listenerSubscription.remove();
    listenerSubscription = null;
    
    // Remove the listener from the module
    if (NotificationModule.removeListeners) {
      NotificationModule.removeListeners(1);
    }
  }
};