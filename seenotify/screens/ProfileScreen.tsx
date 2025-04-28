"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, GestureResponderEvent } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import {
  User,
  Camera,
  Bell,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
  Trash2,
  LucideIcon,
} from "lucide-react-native"

const ProfileScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation()

  // Profile state
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    subscription: "Premium",
    subscriptionRenewal: "Oct 15, 2023",
    notificationPreferences: {
      email: true,
      push: true,
      weekly: false,
    },
  })

  // Animation values
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    }
  })

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    }
  })

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 })
    contentOpacity.value = withTiming(1, { duration: 800 })
  }, [])

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
  const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
  const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // Handle logout logic here
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // Handle account deletion logic here
        },
      },
    ])
  }

  const renderProfileOption = (icon: LucideIcon, title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, onPress: ((event: GestureResponderEvent) => void) | undefined, iconColor = isDark ? "#6366f1" : "#4f46e5") => {
    const Icon = icon

    return (
      <TouchableOpacity style={[styles.profileOption, { borderBottomColor: getCardBorderColor() }]} onPress={onPress}>
        <View style={styles.optionInfo}>
          <View style={[styles.optionIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
            <Icon size={18} color={iconColor} />
          </View>
          <Text style={[styles.optionTitle, { color: getTextColor() }]}>{title}</Text>
        </View>
        <ChevronRight size={18} color={getSecondaryTextColor()} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Profile</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentStyle}>
          {/* Profile Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <View style={[styles.profileImage, { backgroundColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}>
                  <Text style={[styles.profileInitials, { color: isDark ? "#6366f1" : "#4f46e5" }]}>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>
                <TouchableOpacity style={styles.cameraButton}>
                  <View style={[styles.cameraIconContainer, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}>
                    <Camera size={14} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: getTextColor() }]}>{user.name}</Text>
                <Text style={[styles.profileEmail, { color: getSecondaryTextColor() }]}>{user.email}</Text>
              </View>

              <TouchableOpacity style={[styles.editButton, { borderColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}>
                <Text style={[styles.editButtonText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.subscriptionContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
              <View>
                <Text style={[styles.subscriptionLabel, { color: getSecondaryTextColor() }]}>Subscription Plan</Text>
                <Text style={[styles.subscriptionPlan, { color: getTextColor() }]}>{user.subscription}</Text>
              </View>
              <Text style={[styles.subscriptionRenewal, { color: getSecondaryTextColor() }]}>
                Renews on {user.subscriptionRenewal}
              </Text>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Account Settings</Text>

            <View
              style={[
                styles.optionsCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderProfileOption(Bell, "Notification Preferences", () => navigation.navigate("Settings" as never))}

              {renderProfileOption(CreditCard, "Subscription & Billing", () => {})}

              {renderProfileOption(Shield, "Privacy & Security", () => {})}

              {renderProfileOption(Settings, "App Settings", () => navigation.navigate("Settings" as never))}
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Support</Text>

            <View
              style={[
                styles.optionsCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderProfileOption(HelpCircle, "Help & Support", () => {})}

              {renderProfileOption(User, "About Us", () => {})}
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <View
              style={[
                styles.optionsCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderProfileOption(LogOut, "Log Out", handleLogout, "#f59e0b")}

              {renderProfileOption(Trash2, "Delete Account", handleDeleteAccount, "#ef4444")}
            </View>
          </View>

          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: getSecondaryTextColor() }]}>SeeNotify v1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: "600",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  cameraIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  subscriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  subscriptionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: "600",
  },
  subscriptionRenewal: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  optionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  profileOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
  },
})

export default ProfileScreen
