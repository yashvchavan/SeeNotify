"use client"
import React from "react"
import { View, StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useTheme } from "../context/ThemeContext"
import { Bell, BarChart2, Settings, Layers, PlusCircle } from "lucide-react-native"

import DashboardScreen from "../screens/DashboardScreen"
import NotificationDetailScreen from "../screens/NotificationDetailScreen"
import AISettingsScreen from "../screens/AISettingsScreen"
import IntegrationScreen from "../screens/IntegrationScreen"
import InsightsScreen from "../screens/InsightsScreen"
import SettingsScreen from "../screens/SettingsScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// Dashboard Stack
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      <Stack.Screen name="AISettings" component={AISettingsScreen} />
      <Stack.Screen name="Integration" component={IntegrationScreen} />
    </Stack.Navigator>
  )
}

// Analytics Stack
const AnalyticsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InsightsMain" component={InsightsScreen} />
    </Stack.Navigator>
  )
}

// Settings Stack
const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AISettings" component={AISettingsScreen} />
      <Stack.Screen name="Integration" component={IntegrationScreen} />
    </Stack.Navigator>
  )
}

// Categories Stack
const CategoriesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoriesMain" component={CategoriesScreen} />
    </Stack.Navigator>
  )
}

// Placeholder screen
const CategoriesScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Layers size={40} color="#6366f1" />
  </View>
)

// Define props for MainNavigator
type MainNavigatorProps = {
  route?: any // Optional route prop
  navigation?: any // Optional navigation prop
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ route, navigation }) => {
  const { isDark } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
          borderTopColor: isDark ? "#2e2e3e" : "#e2e8f0",
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: isDark ? "#6366f1" : "#4f46e5",
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#94a3b8",
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={View}
        options={{
          tabBarButton: () => (
            <View style={styles.addButton}>
              <View style={[styles.addButtonInner, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}>
                <PlusCircle color="white" size={24} />
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault()
            // Handle custom action here
          },
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesStack}
        options={{
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  addButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default MainNavigator