import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Requests notification permissions from the user
 * @returns A boolean indicating if permission was granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for notification listener!');
      return false;
    }
    
    return true;
  } else {
    console.log('Must use physical device for notification listener');
    return false;
  }
}

/**
 * Checks if notification listener permissions are available on this device/platform
 */
export function canAccessNotifications(): boolean {
  // iOS doesn't allow access to other apps' notifications due to sandboxing
  if (Platform.OS === 'ios') {
    return false;
  }
  
  // Only physical Android devices can access notifications
  return Platform.OS === 'android' && Device.isDevice;
} 