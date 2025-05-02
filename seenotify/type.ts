// Central type definitions for the app
import type { LucideIcon } from "lucide-react-native"
import type { RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

// Define the notification type
export type Notification = {
  id: string
  app: string
  sender: string
  title: string
  message: string
  time: string
  category: string
  isRead: boolean
  icon: LucideIcon
  isSpam?: boolean;          // New field
  confidence?: number;
  packageName: string;
  channelId?: string;
  tag?: string;
}

// Define the navigation param list
export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  Auth: undefined
  DashboardMain: undefined
  NotificationDetail: { notification: Notification }
  AISettings: undefined
  Integration: undefined
  InsightsMain: undefined
  SettingsMain: undefined
  Profile: undefined
  CategoriesMain: undefined
  Dashboard: undefined
  Analytics: undefined
  Categories: undefined
  Settings: undefined
  Main: undefined
}

// Navigation prop types
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// Route prop types
export type NotificationDetailRouteProp = RouteProp<RootStackParamList, "NotificationDetail">
