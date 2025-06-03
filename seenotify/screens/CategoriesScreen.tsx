// Define CategoriesScreen as a proper React component 
import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/types.tsx"
import {
  MessageSquare,
  Mail,
  Send,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
  Users2,
  MessageCircleMore,
  MessagesSquare,
} from "lucide-react-native"

interface AppCategory {
  name: string;
  packageName: string;
  icon: React.ElementType;
}

const CATEGORIES: AppCategory[] = [
  {
    name: "WhatsApp",
    packageName: "com.whatsapp",
    icon: MessageSquare,
  },
  {
    name: "Gmail",
    packageName: "com.google.android.gm",
    icon: Mail,
  },
  {
    name: "Messages",
    packageName: "com.google.android.apps.messaging",
    icon: MessageCircle,
  },
  {
    name: "Instagram",
    packageName: "com.instagram.android",
    icon: Instagram,
  },
  {
    name: "Telegram",
    packageName: "org.telegram.messenger",
    icon: Send,
  },
  {
    name: "LinkedIn",
    packageName: "com.linkedin.android",
    icon: Linkedin,
  },
  {
    name: "Messenger",
    packageName: "com.facebook.orca",
    icon: MessageCircleMore,
  },
  {
    name: "Twitter",
    packageName: "com.twitter.android",
    icon: Twitter,
  },
  {
    name: "Teams",
    packageName: "com.microsoft.teams",
    icon: Users2,
  },
  {
    name: "Slack",
    packageName: "com.slack",
    icon: MessagesSquare,
  },
  {
    name: "Discord",
    packageName: "com.discord",
    icon: MessageCircleMore,
  },
]

type CategoriesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Categories'
>;

const CategoriesScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<CategoriesScreenNavigationProp>()
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  const handleAppPress = (app: AppCategory) => {
    setSelectedApp(app.packageName)
    navigation.navigate("Dashboard", {
      filter: {
        packageName: app.packageName,
        appName: app.name
      }
    })
  }

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
  const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
  const getCardBorderColor = () => (isDark ? "#374151" : "#e2e8f0")

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? "#121212" : "#ffffff" }
      ]}
    >
      <Text style={[
        styles.title,
        { color: isDark ? "#ffffff" : "#1e293b" }
      ]}>
        App Categories
      </Text>
      <View style={styles.grid}>
        {CATEGORIES.map((app) => {
          const Icon = app.icon;
          return (
            <TouchableOpacity
              key={app.packageName}
              style={[
                styles.appItem,
                {
                  backgroundColor: isDark ? "#1e1e2e" : "#f8fafc",
                  borderColor: isDark ? "#374151" : "#e2e8f0",
                  borderWidth: 1,
                },
                selectedApp === app.packageName && {
                  borderColor: isDark ? "#6366f1" : "#4f46e5",
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleAppPress(app)}
            >
              <View style={[styles.iconContainer, {
                backgroundColor: isDark ? "#2e2e3e" : "#f1f5f9"
              }]}
              >
                <Icon size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
              </View>
              <Text
                style={[
                  styles.appName,
                  { color: isDark ? "#ffffff" : "#1e293b" },
                ]}
                numberOfLines={1}
              >
                {app.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  appItem: {
    width: 80,
    height: 100,
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    textAlign: "center",
  },
})

export default CategoriesScreen