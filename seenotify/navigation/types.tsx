import type { Notification } from '../type'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  Auth: undefined
  Dashboard: { 
    filter?: { 
      packageName: string
      appName: string 
    } 
  }
  NotificationDetail: { 
    notification: Notification 
  }
  Settings: undefined
  AISettings: undefined
  Integration: undefined
  Categories: undefined
  Profile: undefined
  Insights: undefined
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>
  route: RouteProp<RootStackParamList, T>
}
