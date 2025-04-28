"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, GestureResponderEvent } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Vibrate,
  Clock,
  CloudUpload,
  LucideIcon,
} from "lucide-react-native"

const SettingsScreen = () => {
  const { isDark, theme, setTheme } = useTheme()

  // Settings state
  const [notificationSound, setNotificationSound] = useState(true)
  const [notificationVibration, setNotificationVibration] = useState(true)
  const [quietHours, setQuietHours] = useState(false)
  const [dataBackup, setDataBackup] = useState(false)
  const [dataSharing, setDataSharing] = useState(true)

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

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const renderSettingItem = (icon: LucideIcon, title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, value: boolean | undefined, onToggle: ((value: boolean) => Promise<void> | void) | null | undefined, iconColor = isDark ? "#6366f1" : "#4f46e5") => {
    const Icon = icon

    return (
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <View style={[styles.settingIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
            <Icon size={18} color={iconColor} />
          </View>
          <View>
            <Text style={[styles.settingTitle, { color: getTextColor() }]}>{title}</Text>
            <Text style={[styles.settingDescription, { color: getSecondaryTextColor() }]}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{
            false: isDark ? "#2e2e3e" : "#e2e8f0",
            true: isDark ? "#4f46e5" : "#6366f1",
          }}
          thumbColor={isDark ? "#ffffff" : "#ffffff"}
        />
      </View>
    )
  }

  const renderLinkItem = (icon: LucideIcon, title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, onPress: ((event: GestureResponderEvent) => void) | undefined, iconColor = isDark ? "#6366f1" : "#4f46e5") => {
    const Icon = icon

    return (
      <TouchableOpacity style={styles.linkItem} onPress={onPress}>
        <View style={styles.linkInfo}>
          <View style={[styles.settingIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
            <Icon size={18} color={iconColor} />
          </View>
          <Text style={[styles.linkTitle, { color: getTextColor() }]}>{title}</Text>
        </View>
        <ChevronRight size={18} color={getSecondaryTextColor()} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          <Settings size={24} color={getTextColor()} />
        </View>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Settings</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentStyle}>
          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Notification Preferences</Text>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderSettingItem(
                Bell,
                "Notification Sounds",
                "Play sounds for new notifications",
                notificationSound,
                setNotificationSound,
              )}

              {renderSettingItem(
                Vibrate,
                "Vibration",
                "Vibrate when notifications arrive",
                notificationVibration,
                setNotificationVibration,
              )}

              {renderSettingItem(
                Clock,
                "Quiet Hours",
                "Mute notifications during specific hours",
                quietHours,
                setQuietHours,
              )}
            </View>
          </View>

          {/* Appearance Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Appearance</Text>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              <View style={styles.themeSelector}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                    {isDark ? <Moon size={18} color="#6366f1" /> : <Sun size={18} color="#f59e0b" />}
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: getTextColor() }]}>Dark Mode</Text>
                    <Text style={[styles.settingDescription, { color: getSecondaryTextColor() }]}>
                      {isDark ? "Currently using dark theme" : "Currently using light theme"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: "#e2e8f0",
                    true: "#4f46e5",
                  }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Data & Privacy</Text>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderSettingItem(
                CloudUpload,
                "Backup Notifications",
                "Save notification history to cloud",
                dataBackup,
                setDataBackup,
              )}

              {renderSettingItem(
                Lock,
                "Data Sharing",
                "Share anonymous usage data to improve the app",
                dataSharing,
                setDataSharing,
              )}

              {renderLinkItem(Lock, "Privacy Policy", () => {})}
            </View>
          </View>

          {/* Support & About */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Support & About</Text>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {renderLinkItem(HelpCircle, "Help & Support", () => {})}

              {renderLinkItem(Settings, "About SeeNotify", () => {})}

              {renderLinkItem(LogOut, "Log Out", () => {}, "#ef4444")}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  themeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  linkInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
  },
})

export default SettingsScreen
