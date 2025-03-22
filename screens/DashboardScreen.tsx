"use client"

import React, { useRef, useCallback, useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, Platform, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { FadeIn, FadeOut, SlideInRight, Layout } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  Search,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
  Sliders,
  Link,
  CheckCircle2,
} from "lucide-react-native"
import { Swipeable } from "react-native-gesture-handler"
import type { NavigationProp, Notification } from "../type"
import { setupNotificationListener, requestSystemNotificationListener } from "../utils/notificationListener"
import { getNotifications, markAsRead as markNotificationAsRead, deleteNotification as deleteStoredNotification } from "../utils/notificationStore"

const { width } = Dimensions.get("window")

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const categories = [
  { id: "all", name: "All", icon: Bell },
  { id: "important", name: "Important", icon: AlertCircle },
  { id: "work", name: "Work", icon: Calendar },
  { id: "social", name: "Social", icon: MessageSquare },
  { id: "promo", name: "Promotions", icon: Tag },
]

const DashboardScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = useState(true)

  const swipeableRefs = useRef<Array<Swipeable | null>>([])

  useEffect(() => {
    const initNotifications = async () => {
      setIsLoading(true);
      try {
        const listenerSetup = await setupNotificationListener();
        
        if (listenerSetup) {
          console.log('Notification listener set up successfully');
        } else {
          console.log('Failed to set up notification listener');
          
          if (Platform.OS === 'android') {
            Alert.alert(
              'Notification Access Required',
              'To see notifications from other apps, please allow SeeNotify to access your notifications.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Enable', 
                  onPress: async () => await requestSystemNotificationListener() 
                }
              ]
            );
          }
        }
        
        refreshNotifications();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initNotifications();
    
    const refreshInterval = setInterval(refreshNotifications, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  const refreshNotifications = () => {
    try {
      const savedNotifications = getNotifications();
      setNotifications(savedNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.sender.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [notifications, selectedCategory, searchQuery])

  const markAsRead = useCallback((id: string) => {
    markNotificationAsRead(id);
    refreshNotifications();
  }, [])

  const deleteNotification = useCallback((id: string) => {
    deleteStoredNotification(id);
    refreshNotifications();
  }, [])

  const renderSwipeActions = useCallback(
    (id: string) => {
      const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
      const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
      const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
      const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")
      return (
        <View style={styles.swipeActions}>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#10b981" }]}
            onPress={() => {
              markAsRead(id)
              const index = Number.parseInt(id) - 1
              if (index >= 0 && index < swipeableRefs.current.length) {
                swipeableRefs.current[index]?.close()
              }
            }}
          >
            <CheckCircle2 color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#ef4444" }]}
            onPress={() => deleteNotification(id)}
          >
            <Trash2 color="white" size={24} />
          </TouchableOpacity>
        </View>
      )
    },
    [markAsRead, deleteNotification, isDark],
  )

  const renderNotificationItem = useCallback(
    ({ item, index }: { item: Notification; index: number }) => {
      const Icon = item.icon
      const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
      const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
      const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
      const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")
      return (
        <Animated.View entering={FadeIn.delay(index * 100)} exiting={FadeOut} layout={Layout.springify()}>
          <Swipeable
            ref={(ref) => (swipeableRefs.current[index] = ref)}
            renderRightActions={() => renderSwipeActions(item.id)}
            overshootRight={false}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate("NotificationDetail", { notification: item })
              }}
            >
              <View
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: getCardBgColor(),
                    borderColor: getCardBorderColor(),
                    opacity: item.isRead ? 0.8 : 1,
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                  <Icon size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.appName, { color: isDark ? "#6366f1" : "#4f46e5" }]}>{item.app}</Text>
                    <Text style={[styles.time, { color: getSecondaryTextColor() }]}>{item.time}</Text>
                  </View>

                  <Text style={[styles.sender, { color: getTextColor() }, item.isRead ? {} : { fontWeight: "700" }]}>
                    {item.sender}
                  </Text>

                  <Text style={[styles.message, { color: getSecondaryTextColor() }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>

                {!item.isRead && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      )
    },
    [isDark, navigation, renderSwipeActions],
  )

  const renderCategoryItem = useCallback(
    ({ item }: { item: (typeof categories)[0] }) => {
      const isSelected = selectedCategory === item.id
      const Icon = item.icon

      return (
        <AnimatedTouchable
          style={[
            styles.categoryItem,
            {
              backgroundColor: isSelected ? (isDark ? "#6366f1" : "#4f46e5") : isDark ? "#2e2e3e" : "#f8fafc",
            },
          ]}
          onPress={() => setSelectedCategory(item.id)}
          entering={SlideInRight}
        >
          <Icon size={16} color={isSelected ? "white" : isDark ? "#a1a1aa" : "#64748b"} />
          <Text
            style={[
              styles.categoryText,
              {
                color: isSelected ? "white" : isDark ? "#a1a1aa" : "#64748b",
              },
            ]}
          >
            {item.name}
          </Text>
        </AnimatedTouchable>
      )
    },
    [selectedCategory, isDark],
  )

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: getTextColor() }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("AISettings")}>
            <Sliders size={20} color={getTextColor()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Integration")}>
            <Link size={20} color={getTextColor()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Settings")}>
            <View style={[styles.profileAvatar, { backgroundColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}>
              <Text style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>JD</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={isDark ? "#6b7280" : "#94a3b8"} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: getTextColor(),
              backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
              borderColor: isDark ? "#2e2e3e" : "#e2e8f0",
            },
          ]}
          placeholder="Search notifications..."
          placeholderTextColor={isDark ? "#6b7280" : "#94a3b8"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refreshNotifications}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={60} color={isDark ? "#2e2e3e" : "#e2e8f0"} />
            <Text style={[styles.emptyText, { color: getSecondaryTextColor() }]}>
              {isLoading 
                ? "Loading notifications..." 
                : "No notifications found"}
            </Text>
            {Platform.OS === 'android' && !isLoading && notifications.length === 0 && (
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
                onPress={async () => await requestSystemNotificationListener()}
              >
                <Text style={{ color: 'white' }}>Enable Notification Access</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 32,
    top: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  appName: {
    fontSize: 12,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  sender: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginLeft: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginLeft: 10,
  },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderRadius: 16,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
})

export default DashboardScreen

