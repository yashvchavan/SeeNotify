"use client"

import React, { useRef, useCallback, useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, NativeEventEmitter, NativeModules, EmitterSubscription } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import Animated, { FadeIn, FadeOut, SlideInRight, Layout } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { Search, Bell, Mail, MessageSquare, Calendar, AlertCircle, Tag, Trash2, Sliders, Link, CheckCircle2, ArrowLeft, LucideIcon } from "lucide-react-native"
import { Swipeable } from "react-native-gesture-handler"
import type { NavigationProp, Notification, RealNotification } from "../type"
import type { RootStackParamList } from "../navigation/types.tsx"
import { sendNotificationToBackend, getSpamNotifications, classifyNotification } from '../services/notificationService'

const { width } = Dimensions.get("window")
const { NotificationModule } = NativeModules
const notificationEventEmitter = new NativeEventEmitter(NotificationModule)

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>

const categories = [
  { id: "all", name: "All", icon: Bell },
  { id: "work", name: "Work", icon: Calendar },
  { id: "social", name: "Social", icon: MessageSquare },
  { id: "promo", name: "Promotions", icon: Tag },
  { id: "other", name: "Other", icon: AlertCircle },
  { id: "spam", name: "Spam", icon: AlertCircle },
]

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const DashboardScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<DashboardScreenRouteProp>()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hasPermission, setHasPermission] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
  useEffect(() => {
    // Check permission on mount
    checkPermission();

    // Set up event listeners
    const subscriptions: EmitterSubscription[] = [];

    // Debug logging
    console.log('NotificationModule:', NotificationModule);
    console.log('notificationEventEmitter:', notificationEventEmitter);

    const postSub = notificationEventEmitter.addListener(
      'notificationPosted',
      (notification: RealNotification) => {
        console.log('Received notificationPosted:', notification);
        handleNewNotification(notification);
      }
    );
    subscriptions.push(postSub);

    const removeSub = notificationEventEmitter.addListener(
      'notificationRemoved',
      (notification: RealNotification) => {
        console.log('Received notificationRemoved:', notification);
        handleRemovedNotification(notification);
      }
    );
    subscriptions.push(removeSub);

    const activeSub = notificationEventEmitter.addListener(
      'activeNotifications',
      (data: { notifications: RealNotification[] }) => {
        console.log('Received activeNotifications:', data);
        handleActiveNotifications(data.notifications);
      }
    );
    subscriptions.push(activeSub);

    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
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
      packageName: realNotif.packageName,
      app: getAppName(realNotif.packageName),
      sender: realNotif.title || 'Unknown',
      title: realNotif.subText || 'Notification',
      message: realNotif.text || 'No Mentioned',
      time: formatTime(realNotif.postTime),
      category: getCategory(realNotif.packageName),
      isRead: false,
      icon: getAppIcon(realNotif.packageName)
    };
  
    try {
      // Classify the notification first
      const classification = await classifyNotification(newNotification);
      newNotification.isSpam = classification.is_spam;
      newNotification.confidence = classification.confidence;
  
      // Send to your main backend
      await sendNotificationToBackend(newNotification);
      
      // Add to local state
      addNotification(newNotification);
    } catch (error) {
      console.error('Error handling new notification:', error);
      // Still add to local state even if backend fails
      addNotification(newNotification);
    }
  };
  useEffect(() => {
    const loadSpamNotifications = async () => {
      try {
        const spamNotifications = await getSpamNotifications();
        const mappedNotifications = spamNotifications.map((item: any) => ({
          id: item.id,
          app: item.app || 'Unknown',
          sender: item.sender || 'Unknown',
          title: item.title || 'Notification',
          message: item.message || '',
          time: formatTime(new Date(item.timestamp).getTime()),
          category: item.is_spam ? 'spam' : getCategory(item.app),
          isRead: false,
          icon: getAppIcon(item.app),
          isSpam: item.is_spam,
          confidence: item.confidence
        }));
        
        setNotifications(prev => [...mappedNotifications, ...prev]);
      } catch (error) {
        console.error('Error loading spam notifications:', error);
      }
    };
  
    loadSpamNotifications();
  }, []);

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
      message: realNotif.text || 'No Mentioned',
      time: formatTime(realNotif.postTime),
      category: getCategory(realNotif.packageName),
      isRead: false,
      icon: getAppIcon(realNotif.packageName),
      packageName: realNotif.packageName,
    }))

    setNotifications(prev => {
      // Filter out duplicates from new notifications
      const newItems = mappedNotifications.filter(newNotif => 
        !prev.some(existing => existing.id === newNotif.id)
      )
      return [...newItems, ...prev]
    })
  }

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
    // Communication and Email apps
    if (packageName.includes('gmail') || packageName.includes('mail') || packageName.includes('outlook')) {
      return 'work';
    }
    
    // Social Media and Messaging apps
    if (packageName.includes('whatsapp') || 
        packageName.includes('telegram') || 
        packageName.includes('messaging') ||
        packageName.includes('instagram') ||
        packageName.includes('twitter') ||
        packageName.includes('facebook') ||
        packageName.includes('messenger') ||
        packageName.includes('discord')) {
      return 'social';
    }

    // Work/Professional apps
    if (packageName.includes('slack') || 
        packageName.includes('teams') || 
        packageName.includes('linkedin') ||
        packageName.includes('jira') ||
        packageName.includes('zoom')) {
      return 'work';
    }

    // Shopping and Promotional apps
    if (packageName.includes('shopping') || 
        packageName.includes('amazon') || 
        packageName.includes('aliexpress') ||
        packageName.includes('ebay') ||
        packageName.includes('promo')) {
      return 'promo';
    }

    // Check if notification is marked as spam
    const notification = notifications.find(n => n.packageName === packageName);
    if (notification?.isSpam) {
      return 'spam';
    }

    return 'other';
  }

  useEffect(() => {
    if (route.params?.filter) {
      setSelectedApp(route.params.filter.packageName);
    }
  }, [route.params]);
  const filteredNotifications = React.useMemo(() => {
    let filtered = [...notifications];
  
    // First apply app filter if selected
    if (selectedApp) {
      filtered = filtered.filter((item) => item.packageName === selectedApp);
    }
    // Then apply category filter if no app is selected
    else if (selectedCategory !== "all") {
      if (selectedCategory === "spam") {
        // For spam category, show all items marked as spam
        filtered = filtered.filter((item) => item.isSpam);
      } else if (selectedCategory === "social") {
        // For social category, show all social app notifications
        filtered = filtered.filter((item) => {
          if (!item?.packageName) return false;
          const packageName = item.packageName.toLowerCase();
          return (
            packageName.includes("whatsapp") ||
            packageName.includes("telegram") ||
            packageName.includes("messenger") ||
            packageName.includes("instagram") ||
            packageName.includes("twitter") ||
            packageName.includes("facebook") ||
            packageName.includes("discord")
          );
        });      } else if (selectedCategory === "work") {
        // For work category, show email and work app notifications
        filtered = filtered.filter((item) => {
          if (!item?.packageName) return false;
          const packageName = item.packageName.toLowerCase();
          return (
            packageName.includes("gmail") ||
            packageName.includes("outlook") ||
            packageName.includes("slack") ||
            packageName.includes("teams") ||
            packageName.includes("linkedin") ||
            packageName.includes("jira")
          );
        });
      } else if (selectedCategory === "promo") {
        // For promo category, show shopping and promotional notifications
        filtered = filtered.filter((item) =>{
          if (!item?.packageName) return false;
          const packageName = item.packageName.toLowerCase();
          return (
          packageName.includes("shopping") ||
          packageName.includes("amazon") ||
          packageName.includes("aliexpress") ||
          packageName.includes("ebay") ||
          packageName.includes("promo")
        );
      });
      } else {
        // For other category, show everything not matching other categories
        filtered = filtered.filter((item) => item.category === "other");
      }
    }
  
    // Finally apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.sender.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [notifications, selectedCategory, selectedApp, searchQuery, getCategory]);

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
      const Icon = item.icon;
      const getTextColor = () => (isDark ? "#ffffff" : "#1e293b");
      const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b");
      const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff");
      const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9");
      
      // Additional styling for spam notifications
      const spamStyles = item.isSpam ? {
        backgroundColor: isDark ? "#2a1a1a" : "#ffebee",
        borderColor: isDark ? "#3a2a2a" : "#ffcdd2",
      } : {};
  
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
                  spamStyles,
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
  
                  {/* Add spam classification info */}
                  {item.isSpam !== undefined && (
                    <Text style={[styles.classification, { 
                      color: item.isSpam ? (isDark ? "#f87171" : "#ef4444") : (isDark ? "#86efac" : "#22c55e")
                    }]}>
                      {item.isSpam ? 'SPAM' : 'Legitimate'}{item.confidence ? ` (${Math.round(item.confidence * 100)}%)` : ''}
                    </Text>
                  )}
                </View>
  
                {!item.isRead && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      )
    },
    [isDark, navigation, renderSwipeActions],
  );
  

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

  const clearAppFilter = () => {
    setSelectedApp(null);
    navigation.setParams({ filter: undefined });
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // This will trigger the activeNotifications event through the listener
      await NotificationModule.getActiveNotifications()
      
      // Get spam notifications
      const spamNotifications = await getSpamNotifications()
      const mappedNotifications = spamNotifications.map((item: any) => ({
        id: item.id,
        app: item.app || 'Unknown',
        sender: item.sender || 'Unknown',
        title: item.title || 'Notification',
        message: item.message || '',
        time: formatTime(new Date(item.timestamp).getTime()),
        category: item.is_spam ? 'spam' : getCategory(item.app),
        isRead: false,
        icon: getAppIcon(item.app),
        isSpam: item.is_spam,
        confidence: item.confidence
      }))
      
      // The active notifications will be handled by the event listener
      // We'll only update spam notifications here
      setNotifications(prev => {
        // Filter out spam notifications and add new ones
        const nonSpam = prev.filter(n => !n.isSpam);
        return [...nonSpam, ...mappedNotifications];
      })
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      <View style={styles.header}>
        {selectedApp ? (
          <TouchableOpacity onPress={clearAppFilter} style={styles.backButton}>
            <ArrowLeft size={24} color={getTextColor()} />
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.title, { color: getTextColor() }]}>
          {selectedApp ? route.params?.filter?.appName || 'App Notifications' : 'Notifications'}
        </Text>
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

      {!selectedApp && (
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
      )}

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
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
  classification: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
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
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    zIndex: 1,
  },
})

export default DashboardScreen
