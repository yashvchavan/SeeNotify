"use client"

import React, { useRef, useCallback, useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, NativeEventEmitter, NativeModules, EmitterSubscription } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { FadeIn, FadeOut, SlideInRight, Layout } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { Search, Bell, Mail, MessageSquare, Calendar, AlertCircle, Tag, Trash2, Sliders, Link, CheckCircle2, LucideIcon } from "lucide-react-native"
import { Swipeable } from "react-native-gesture-handler"
import type { NavigationProp, Notification } from "../type"

import { sendNotificationToBackend } from '../services/notificationService';
const { width } = Dimensions.get("window")
const { NotificationModule } = NativeModules
const notificationEventEmitter = new NativeEventEmitter(NotificationModule)

interface RealNotification {
  id: string
  packageName: string
  title: string
  text: string
  postTime: number
  tag?: string
  subText?: string
}

const categories = [
  { id: "all", name: "All", icon: Bell },
  { id: "work", name: "Work", icon: Calendar },
  { id: "social", name: "Social", icon: MessageSquare },
  { id: "promo", name: "Promotions", icon: Tag },
  { id: "other", name: "Other", icon: AlertCircle },
]

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const DashboardScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hasPermission, setHasPermission] = useState(false)

  const swipeableRefs = useRef<Array<Swipeable | null>>([])

  // Improved notification handling with deduplication
  const addNotification = useCallback((newNotif: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(existing => 
        existing.id === newNotif.id || 
        (existing.app === newNotif.app && 
         existing.message === newNotif.message &&
         Math.abs(new Date(existing.time).getTime() - new Date(newNotif.time).getTime()) < 60000)
      );

      if (!exists) {
        return [newNotif, ...prev]
      }
      return prev
    })
  }, [])

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const granted = await NotificationModule.isPermissionGranted();
        setHasPermission(granted);
        if (!granted) {
          const result = await NotificationModule.requestPermission();
          setHasPermission(result);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
      }
    };
  
    checkPermissions();
  }, []);

  // Update your useEffect in DashboardScreen
  useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];

    // Check if emitter is properly connected
    console.log('NotificationModule:', NotificationModule);
    console.log('notificationEventEmitter:', notificationEventEmitter);

    const postSub = notificationEventEmitter.addListener(
      'notificationPosted',
      (notification) => {
        console.log('Received notificationPosted:', notification);
        handleNewNotification(notification);
      }
    );
    subscriptions.push(postSub);

    const removeSub = notificationEventEmitter.addListener(
      'notificationRemoved',
      (notification) => {
        console.log('Received notificationRemoved:', notification);
        handleRemovedNotification(notification);
      }
    );
    subscriptions.push(removeSub);

    const activeSub = notificationEventEmitter.addListener(
      'activeNotifications',
      (data) => {
        console.log('Received activeNotifications:', data);
        handleActiveNotifications(data.notifications);
      }
    );
    subscriptions.push(activeSub);


    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
  }, []);

  useEffect(() => {
    // Check permission on mount
    checkPermission()

    // Set up event listeners
    const subscriptionPost = notificationEventEmitter.addListener(
      'notificationPosted',
      (notification: RealNotification) => {
        handleNewNotification(notification)
      }
    )

    const subscriptionRemove = notificationEventEmitter.addListener(
      'notificationRemoved',
      (notification: RealNotification) => {
        handleRemovedNotification(notification)
      }
    )

    const subscriptionActive = notificationEventEmitter.addListener(
      'activeNotifications',
      (data: { notifications: RealNotification[] }) => {
        handleActiveNotifications(data.notifications)
      }
    )

    return () => {
      subscriptionPost.remove()
      subscriptionRemove.remove()
      subscriptionActive.remove()
    }
  }, [])

  const checkPermission = async () => {
    try {
      const granted = await NotificationModule.isPermissionGranted()
      setHasPermission(granted)
      if (!granted) {
        requestPermission()
      }
    } catch (error) {
      console.error('Error checking notification permission:', error)
    }
  }

  const requestPermission = async () => {
    try {
      await NotificationModule.requestPermission()
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }



  const handleNewNotification = async (realNotif: RealNotification) => {
    const newNotification: Notification = {
      id: `${realNotif.packageName}:${realNotif.id}:${realNotif.tag || ''}:${realNotif.postTime}`,
      app: getAppName(realNotif.packageName),
      sender: realNotif.title || 'Unknown',
      title: realNotif.subText || 'Notification',
      message: realNotif.text || '',
      time: formatTime(realNotif.postTime),
      category: getCategory(realNotif.packageName),
      isRead: false,
      icon: getAppIcon(realNotif.packageName)
    };
  
    try {
      // Send to backend
      await sendNotificationToBackend(newNotification);
      // Add to local state
      addNotification(newNotification);
    } catch (error) {
      console.error('Error handling new notification:', error);
      // Still add to local state even if backend fails
      addNotification(newNotification);
    }
  };

  const handleRemovedNotification = (realNotif: RealNotification) => {
    setNotifications(prev => 
      prev.filter(item => !item.id.startsWith(`${realNotif.packageName}:${realNotif.id}`))
    )
  }

  const handleActiveNotifications = (realNotifs: RealNotification[]) => {
    const mappedNotifications = realNotifs.map(realNotif => ({
      id: `${realNotif.packageName}:${realNotif.id}:${realNotif.tag || ''}:${realNotif.postTime}`, // Consistent ID format
      app: getAppName(realNotif.packageName),
      sender: realNotif.title || 'Unknown',
      title: realNotif.subText || 'Notification',
      message: realNotif.text || '',
      time: formatTime(realNotif.postTime),
      category: getCategory(realNotif.packageName),
      isRead: false,
      icon: getAppIcon(realNotif.packageName)
    }))

    setNotifications(prev => {
      // Filter out duplicates from new notifications
      const newItems = mappedNotifications.filter(newNotif => 
        !prev.some(existing => existing.id === newNotif.id)
      )
      return [...newItems, ...prev]
    })
  }

  // ... rest of your component code remains the same ...

  const getAppName = (packageName: string): string => {
    const appMap: Record<string, string> = {
      'com.whatsapp': 'WhatsApp',
      'com.google.android.gm': 'Gmail',
      'com.google.android.calendar': 'Calendar',
      'com.slack': 'Slack',
      'com.android.messaging': 'Messages'
    }
    return appMap[packageName] || packageName
  }

  const getAppIcon = (packageName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'com.whatsapp': MessageSquare,
      'com.google.android.gm': Mail,
      'com.google.android.calendar': Calendar,
      'com.slack': MessageSquare,
      'com.android.messaging': MessageSquare
    }
    return iconMap[packageName] || Bell
  }

  const getCategory = (packageName: string): string => {
    if (packageName.includes('mail') || packageName.includes('gmail')) return 'work'
    if (packageName.includes('whatsapp') || packageName.includes('messaging')) return 'social'
    if (packageName.includes('slack')) return 'work'
    if (packageName.includes('shopping') || packageName.includes('amazon')) return 'promo'
    return 'other'
  }

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
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={60} color={isDark ? "#2e2e3e" : "#e2e8f0"} />
            <Text style={[styles.emptyText, { color: getSecondaryTextColor() }]}>No notifications found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
})

export default DashboardScreen
