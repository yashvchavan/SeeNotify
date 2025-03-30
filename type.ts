import { NavigationProp as RNNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
// Define the app's navigation routes
export type RootStackParamList = {
  Dashboard: undefined;
  NotificationDetail: { notification: Notification };
  Settings: undefined;
  AISettings: undefined;
  Integration: undefined;
};

// Navigation prop type
export type NavigationProp = RNNavigationProp<RootStackParamList>;

// Notification type
export interface Notification {
  id: string;
  app: string;
  sender: string;
  message: string;
  time: string;
  title: string;
  category: string;
  isRead: boolean;
  packageName?: string;
  icon: "Bell" | "AlertCircle" | "Calendar" | "MessageSquare" | "Tag";
}

// Navigation prop types

// Route prop types
export type NotificationDetailRouteProp = RouteProp<RootStackParamList, "NotificationDetail">