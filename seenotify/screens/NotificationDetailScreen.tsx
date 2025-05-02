"use client"

import React, { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, TextInput } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, SlideInUp } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Calendar,
  Bell,
  CheckCircle2,
  VolumeX,
  Trash2,
  Copy,
  Share2,
  Clock,
  BarChart2,
  Undo2,
} from "lucide-react-native"
import type { NavigationProp, NotificationDetailRouteProp } from "../type"
import { NativeModules } from 'react-native';
const { NotificationModule } = NativeModules;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const NotificationDetailScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<NotificationDetailRouteProp>()
  const { notification } = route.params || {}
  const [isMuted, setIsMuted] = React.useState(false);
  const [showReplyInput, setShowReplyInput] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');

  const [showDeletedMessage, setShowDeletedMessage] = React.useState(false)
  const [isDeleted, setIsDeleted] = React.useState(false)

  const contentOpacity = useSharedValue(0)
  const contentTranslateY = useSharedValue(20)

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    }
  })

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500 })
    contentTranslateY.value = withTiming(0, { duration: 500 })
  }, [])

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
  const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
  const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")

  const handleDelete = () => {
    setIsDeleted(true)
    setShowDeletedMessage(true)

    // Hide the deleted message after 5 seconds
    setTimeout(() => {
      setShowDeletedMessage(false)

      // Navigate back after the message disappears
      setTimeout(() => {
        navigation.goBack()
      }, 300)
    }, 5000)
  }

  const handleMute = async () => {
    try {
      if (notification.channelId) {
        await NotificationModule.muteNotification(
          notification.packageName,
          notification.channelId
        );
        setIsMuted(true);
        Alert.alert('Success', 'Notifications from this app have been muted');
      } else {
        Alert.alert('Error', 'This notification cannot be muted');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mute notifications');
      console.error('Mute error:', error);
    }
  };

  const handleReply = async () => {
    if (!showReplyInput) {
      setShowReplyInput(true);
      return;
    }
  
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }
  
    try {
      await NotificationModule.sendReply(
        notification.packageName,
        notification.tag || '',
        notification.id,
        replyText
      );
      Alert.alert('Success', 'Reply sent successfully');
      setShowReplyInput(false);
      setReplyText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reply');
      console.error('Reply error:', error);
    }
  };

  const handleUndo = () => {
    setIsDeleted(false)
    setShowDeletedMessage(false)
  }

  const handleCopy = () => {
    const content = `${notification.title}\n${notification.message}`
    // In a real app, you would use Clipboard.setString(content)
    Alert.alert("Copied to clipboard", content)
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${notification.title}\n${notification.message}`,
      })
    } catch (error) {
      Alert.alert("Error sharing notification")
    }
  }

  // Get the appropriate icon based on the notification category
  const getNotificationIcon = () => {
    switch (notification.app) {
      case "Gmail":
        return <Mail size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
      case "WhatsApp":
      case "Slack":
        return <MessageSquare size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
      case "Calendar":
        return <Calendar size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
      default:
        return <Bell size={24} color={isDark ? "#6366f1" : "#4f46e5"} />
    }
  }

  // Mock data for similar notifications
  const similarNotifications = [
    {
      id: "s1",
      title: "Weekly Report",
      time: "2 days ago",
    },
    {
      id: "s2",
      title: "Project Timeline Update",
      time: "1 week ago",
    },
    {
      id: "s3",
      title: "Design Review Meeting",
      time: "2 weeks ago",
    },
  ]

  if (isDeleted && !showDeletedMessage) {
    return null
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={getTextColor()} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Notification Details</Text>
        <View style={styles.headerRight} />
      </View>

      {showDeletedMessage ? (
        <Animated.View
          style={[styles.deletedMessage, { backgroundColor: isDark ? "#1e1e2e" : "#ffffff" }]}
          entering={FadeIn}
        >
          <Text style={[styles.deletedText, { color: getTextColor() }]}>Notification deleted</Text>
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            <Undo2 size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
            <Text style={[styles.undoText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={contentStyle}>
            {/* Notification Card */}
            <View
              style={[
                styles.notificationCard,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.senderContainer}>
                  <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                    {getNotificationIcon()}
                  </View>
                  <View>
                    <Text style={[styles.appName, { color: isDark ? "#6366f1" : "#4f46e5" }]}>{notification.app}</Text>
                    <Text style={[styles.sender, { color: getTextColor() }]}>{notification.sender}</Text>
                  </View>
                </View>
                <Text style={[styles.time, { color: getSecondaryTextColor() }]}>{notification.time}</Text>
              </View>

              <View style={styles.contentDivider} />

              <Text style={[styles.title, { color: getTextColor() }]}>{notification.title}</Text>

              <Text style={[styles.message, { color: getSecondaryTextColor() }]}>{notification.message}</Text>

              {/* AI Summary (if enabled) */}
              <View style={[styles.aiSummary, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                <Text style={[styles.aiSummaryTitle, { color: getTextColor() }]}>AI Summary</Text>
                <Text style={[styles.aiSummaryText, { color: getSecondaryTextColor() }]}>
                  This appears to be a {notification.category} notification from {notification.sender} regarding{" "}
                  {notification.title.toLowerCase()}.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
              <AnimatedTouchable
                style={[styles.actionButton, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                entering={SlideInUp.delay(100)}
                onPress={handleReply}
              >
                <MessageSquare size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.actionText, { color: getTextColor() }]}>Reply</Text>
              </AnimatedTouchable>

                <AnimatedTouchable
                  style={[styles.actionButton, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                  entering={SlideInUp.delay(200)}
                >
                  <CheckCircle2 size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
                  <Text style={[styles.actionText, { color: getTextColor() }]}>Mark Read</Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  style={[styles.actionButton, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                  entering={SlideInUp.delay(300)}
                  onPress={handleMute}
                >
                  <VolumeX size={20} color={isMuted ? "#ef4444" : (isDark ? "#6366f1" : "#4f46e5")} />
                  <Text style={[styles.actionText, { color: isMuted ? "#ef4444" : getTextColor() }]}>
                    {isMuted ? 'Muted' : 'Mute'}
                  </Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  style={[styles.actionButton, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                  entering={SlideInUp.delay(400)}
                  onPress={handleDelete}
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
                </AnimatedTouchable>
              </View>
              {showReplyInput && (
                <View style={[styles.replyContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                  <TextInput
                    style={[styles.replyInput, { color: getTextColor(), borderColor: getCardBorderColor() }]}
                    placeholder="Type your reply..."
                    placeholderTextColor={getSecondaryTextColor()}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleReply}
                  >
                    <Text style={[styles.sendButtonText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>Send</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryAction} onPress={handleCopy}>
                  <Copy size={16} color={getSecondaryTextColor()} />
                  <Text style={[styles.secondaryActionText, { color: getSecondaryTextColor() }]}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryAction} onPress={handleShare}>
                  <Share2 size={16} color={getSecondaryTextColor()} />
                  <Text style={[styles.secondaryActionText, { color: getSecondaryTextColor() }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Insights Panel */}
            <View
              style={[
                styles.insightsPanel,
                {
                  backgroundColor: getCardBgColor(),
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              <Text style={[styles.insightsTitle, { color: getTextColor() }]}>Insights</Text>

              <View style={styles.insightItem}>
                <Clock size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.insightText, { color: getSecondaryTextColor() }]}>
                  You receive ~3 notifications from {notification.sender} per week
                </Text>
              </View>

              <View style={styles.insightItem}>
                <BarChart2 size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.insightText, { color: getSecondaryTextColor() }]}>
                  This sender is in your top 5 notification sources
                </Text>
              </View>

              <Text style={[styles.similarTitle, { color: getTextColor() }]}>Similar Notifications</Text>

              {similarNotifications.map((item) => (
                <View key={item.id} style={[styles.similarItem, { borderBottomColor: getCardBorderColor() }]}>
                  <Text style={[styles.similarItemTitle, { color: getTextColor() }]}>{item.title}</Text>
                  <Text style={[styles.similarItemTime, { color: getSecondaryTextColor() }]}>{item.time}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      )}
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
    alignItems: "center",
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
  notificationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  sender: {
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    fontSize: 14,
  },
  contentDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  aiSummary: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  aiSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  aiSummaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  secondaryActionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  insightsPanel: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 8,
  },
  similarTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  similarItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  similarItemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  similarItemTime: {
    fontSize: 12,
  },
  deletedMessage: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deletedText: {
    fontSize: 16,
    fontWeight: "500",
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  undoText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  replyContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    fontWeight: '600',
  },
})

export default NotificationDetailScreen
