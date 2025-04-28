"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, SlideInUp } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Calendar,
  Bell,
  ChevronRight,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native"

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface AppPermissions {
  readEmails?: boolean
  readAttachments?: boolean
  sendReplies?: boolean
  readMessages?: boolean
  readGroups?: boolean
  readEvents?: boolean
  createEvents?: boolean
  sendReminders?: boolean
}

interface ConnectedApp {
  id: string
  name: string
  icon: React.ElementType
  isConnected: boolean
  lastSync: string
  permissions: AppPermissions
}

const IntegrationScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation()

  // Integration state
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
    {
      id: "1",
      name: "Gmail",
      icon: Mail,
      isConnected: true,
      lastSync: "10 minutes ago",
      permissions: {
        readEmails: true,
        readAttachments: false,
        sendReplies: true,
      },
    },
    {
      id: "2",
      name: "WhatsApp",
      icon: MessageSquare,
      isConnected: true,
      lastSync: "25 minutes ago",
      permissions: {
        readMessages: true,
        readGroups: true,
        sendReplies: false,
      },
    },
    {
      id: "3",
      name: "Calendar",
      icon: Calendar,
      isConnected: false,
      lastSync: "Never",
      permissions: {
        readEvents: true,
        createEvents: false,
        sendReminders: true,
      },
    },
  ])

  const availableApps = [
    { id: "4", name: "Slack", icon: MessageSquare },
    { id: "5", name: "Twitter", icon: MessageSquare },
    { id: "6", name: "Facebook", icon: Bell },
  ]

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

  const toggleAppConnection = (id: string) => {
    setConnectedApps(connectedApps.map((app) => (app.id === id ? { ...app, isConnected: !app.isConnected } : app)))
  }

  const togglePermission = (appId: string, permission: keyof AppPermissions) => {
    setConnectedApps(
      connectedApps.map((app) =>
        app.id === appId
          ? {
              ...app,
              permissions: {
                ...app.permissions,
                [permission]: !app.permissions[permission],
              },
            }
          : app,
      ),
    )
  }

  const renderAppIcon = (Icon: React.ElementType) => {
    return (
      <View style={[styles.appIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
        <Icon size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={getTextColor()} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Integrations</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentStyle}>
          {/* Connected Apps Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Connected Apps</Text>
            <Text style={[styles.sectionDescription, { color: getSecondaryTextColor() }]}>
              Manage your connected applications
            </Text>
          </View>

          {connectedApps.map((app, index) => (
            <AnimatedTouchable
              key={app.id}
              style={[
                styles.appCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
              entering={SlideInUp.delay(index * 100)}
              onPress={() => {}}
            >
              <View style={styles.appHeader}>
                <View style={styles.appInfo}>
                  {renderAppIcon(app.icon)}
                  <View>
                    <Text style={[styles.appName, { color: getTextColor() }]}>{app.name}</Text>
                    <Text style={[styles.appStatus, { color: getSecondaryTextColor() }]}>
                      Last sync: {app.lastSync}
                    </Text>
                  </View>
                </View>

                <View style={styles.appActions}>
                  <TouchableOpacity style={styles.syncButton}>
                    <RefreshCw size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                  </TouchableOpacity>
                  <Switch
                    value={app.isConnected}
                    onValueChange={() => toggleAppConnection(app.id)}
                    trackColor={{
                      false: isDark ? "#2e2e3e" : "#e2e8f0",
                      true: isDark ? "#4f46e5" : "#6366f1",
                    }}
                    thumbColor={isDark ? "#ffffff" : "#ffffff"}
                  />
                </View>
              </View>

              {app.isConnected && (
                <View style={styles.permissionsContainer}>
                  <Text style={[styles.permissionsTitle, { color: getTextColor() }]}>Permissions</Text>

                  {Object.entries(app.permissions).map(([key, value]) => (
                    <View key={key} style={styles.permissionItem}>
                      <View style={styles.permissionInfo}>
                        <Lock size={16} color={isDark ? "#a1a1aa" : "#64748b"} />
                        <Text style={[styles.permissionText, { color: getSecondaryTextColor() }]}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={() => togglePermission(app.id, key as keyof AppPermissions)}
                        trackColor={{
                          false: isDark ? "#2e2e3e" : "#e2e8f0",
                          true: isDark ? "#4f46e5" : "#6366f1",
                        }}
                        thumbColor={isDark ? "#ffffff" : "#ffffff"}
                      />
                    </View>
                  ))}
                </View>
              )}
            </AnimatedTouchable>
          ))}

          {/* Available Apps Section */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Available Integrations</Text>
            <Text style={[styles.sectionDescription, { color: getSecondaryTextColor() }]}>
              Connect more apps to enhance your experience
            </Text>
          </View>

          {availableApps.map((app, index) => (
            <AnimatedTouchable
              key={app.id}
              style={[
                styles.availableAppCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
              entering={FadeIn.delay(300 + index * 100)}
            >
              <View style={styles.appInfo}>
                {renderAppIcon(app.icon)}
                <Text style={[styles.appName, { color: getTextColor() }]}>{app.name}</Text>
              </View>

              <TouchableOpacity style={[styles.connectButton, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                <Text style={[styles.connectText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>Connect</Text>
                <ChevronRight size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
              </TouchableOpacity>
            </AnimatedTouchable>
          ))}

          {/* OAuth Info Section */}
          <View
            style={[
              styles.oauthInfoCard,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.oauthHeader}>
              <AlertCircle size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.oauthTitle, { color: getTextColor() }]}>Secure Authentication</Text>
            </View>

            <Text style={[styles.oauthDescription, { color: getSecondaryTextColor() }]}>
              SeeNotify uses OAuth 2.0 to securely connect to your accounts without storing your passwords. You can
              revoke access at any time.
            </Text>

            <View style={[styles.securityBadge, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
              <Lock size={16} color={isDark ? "#10b981" : "#10b981"} />
              <Text style={[styles.securityText, { color: isDark ? "#10b981" : "#10b981" }]}>
                Your data is encrypted and secure
              </Text>
            </View>
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
  backButton: {
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
  },
  appCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appStatus: {
    fontSize: 14,
  },
  appActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncButton: {
    padding: 8,
    marginRight: 8,
  },
  permissionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  permissionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  availableAppCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  connectText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  oauthInfoCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
  },
  oauthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  oauthTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  oauthDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  securityText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
})

export default IntegrationScreen
