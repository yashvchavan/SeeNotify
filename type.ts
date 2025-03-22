// Central type definitions for the app
import type { LucideIcon } from "lucide-react-native"
import type { RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ComponentType } from "react"

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
  icon: ComponentType<any>
  receivedAt?: Date
}

// Define the navigation param list
export type RootStackParamList = {
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
    SplashScreen: undefined;
    OnboardingScreen: undefined;
    AuthScreen: undefined;
    MainNavigator: undefined;
}

// Navigation prop types
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// Route prop types
export type NotificationDetailRouteProp = RouteProp<RootStackParamList, "NotificationDetail">

