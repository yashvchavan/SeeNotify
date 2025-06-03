"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, SlideInUp } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  BarChart2,
  PieChart,
  Clock,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  AlertCircle,
  Tag,
  VolumeX,
} from "lucide-react-native"

const { width } = Dimensions.get("window")
const chartWidth = width - 40

const InsightsScreen = () => {
  const { isDark } = useTheme()
  const [timeRange, setTimeRange] = useState("week")
  const [showTimeRangeOptions, setShowTimeRangeOptions] = useState(false)

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

  const timeRangeOptions = [
    { id: "day", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ]

  // Mock data for charts
  const notificationTrends = [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 19 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 22 },
    { day: "Fri", count: 30 },
    { day: "Sat", count: 8 },
    { day: "Sun", count: 5 },
  ]

  const notificationTypes = [
    { type: "Work", percentage: 40, color: "#6366f1" },
    { type: "Social", percentage: 25, color: "#10b981" },
    { type: "Promo", percentage: 20, color: "#f59e0b" },
    { type: "Other", percentage: 15, color: "#ef4444" },
  ]

  const topSenders = [
    { id: "1", name: "Gmail", icon: Mail, count: 45 },
    { id: "2", name: "WhatsApp", icon: MessageSquare, count: 32 },
    { id: "3", name: "Slack", icon: MessageSquare, count: 28 },
    { id: "4", name: "Calendar", icon: Calendar, count: 15 },
  ]

  const renderBarChart = () => {
    const maxCount = Math.max(...notificationTrends.map((item) => item.count))
    const barWidth = (chartWidth - 40) / notificationTrends.length

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barChart}>
          {notificationTrends.map((item, index) => {
            const barHeight = (item.count / maxCount) * 150

            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth - 10,
                      backgroundColor: isDark ? "#6366f1" : "#4f46e5",
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: getSecondaryTextColor() }]}>{item.day}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.chartYAxis}>
          <Text style={[styles.axisLabel, { color: getSecondaryTextColor() }]}>{maxCount}</Text>
          <Text style={[styles.axisLabel, { color: getSecondaryTextColor() }]}>{Math.round(maxCount / 2)}</Text>
          <Text style={[styles.axisLabel, { color: getSecondaryTextColor() }]}>0</Text>
        </View>
      </View>
    )
  }

  const renderPieChart = () => {
    const total = notificationTypes.reduce((sum, item) => sum + item.percentage, 0)
    let startAngle = 0

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {notificationTypes.map((item, index) => {
            const angle = (item.percentage / total) * 360
            const endAngle = startAngle + angle

            // This is a simplified representation - in a real app you'd use a proper SVG or Canvas
            const pieSegment = (
              <View
                key={index}
                style={[
                  styles.pieSegment,
                  {
                    backgroundColor: item.color,
                    width: 30,
                    height: 30,
                    marginRight: 10,
                  },
                ]}
              />
            )

            startAngle = endAngle

            return (
              <View key={index} style={styles.legendItem}>
                {pieSegment}
                <Text style={[styles.legendLabel, { color: getTextColor() }]}>
                  {item.type} ({item.percentage}%)
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Insights & Analytics</Text>

        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeRangeButton, { backgroundColor: isDark ? "#1e1e2e" : "#ffffff" }]}
            onPress={() => setShowTimeRangeOptions(!showTimeRangeOptions)}
          >
            <Text style={[styles.timeRangeText, { color: getTextColor() }]}>
              {timeRangeOptions.find((option) => option.id === timeRange)?.label}
            </Text>
            {showTimeRangeOptions ? (
              <ChevronUp size={16} color={getSecondaryTextColor()} />
            ) : (
              <ChevronDown size={16} color={getSecondaryTextColor()} />
            )}
          </TouchableOpacity>

          {showTimeRangeOptions && (
            <View
              style={[
                styles.timeRangeOptions,
                {
                  backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
                  borderColor: getCardBorderColor(),
                },
              ]}
            >
              {timeRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.timeRangeOption,
                    timeRange === option.id && {
                      backgroundColor: isDark ? "#2e2e3e" : "#f8fafc",
                    },
                  ]}
                  onPress={() => {
                    setTimeRange(option.id)
                    setShowTimeRangeOptions(false)
                  }}
                >
                  <Text style={[styles.timeRangeOptionText, { color: getTextColor() }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentStyle}>
          {/* Notification Trends */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <BarChart2 size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.cardTitle, { color: getTextColor() }]}>Notification Trends</Text>
            </View>

            <Text style={[styles.cardDescription, { color: getSecondaryTextColor() }]}>
              Number of notifications received per day
            </Text>

            {renderBarChart()}
          </View>

          {/* Notification Types */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <PieChart size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.cardTitle, { color: getTextColor() }]}>Notification Categories</Text>
            </View>

            <Text style={[styles.cardDescription, { color: getSecondaryTextColor() }]}>
              Distribution of notifications by category
            </Text>

            {renderPieChart()}
          </View>

          {/* Top Senders */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Users size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.cardTitle, { color: getTextColor() }]}>Top Notification Sources</Text>
            </View>

            <Text style={[styles.cardDescription, { color: getSecondaryTextColor() }]}>
              Apps that send you the most notifications
            </Text>

            <View style={styles.topSendersList}>
              {topSenders.map((sender, index) => {
                const Icon = sender.icon

                return (
                  <Animated.View
                    key={sender.id}
                    style={[
                      styles.topSenderItem,
                      { borderBottomColor: getCardBorderColor() },
                      index === topSenders.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    entering={SlideInUp.delay(index * 100)}
                  >
                    <View style={styles.senderInfo}>
                      <View style={[styles.senderIconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                        <Icon size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                      </View>
                      <Text style={[styles.senderName, { color: getTextColor() }]}>{sender.name}</Text>
                    </View>
                    <View style={styles.senderCount}>
                      <Text style={[styles.countText, { color: getTextColor() }]}>{sender.count}</Text>
                      <Text style={[styles.countLabel, { color: getSecondaryTextColor() }]}>notifications</Text>
                    </View>
                  </Animated.View>
                )
              })}
            </View>
          </View>

          {/* AI Recommendations */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <AlertCircle size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.cardTitle, { color: getTextColor() }]}>AI Recommendations</Text>
            </View>

            <Text style={[styles.cardDescription, { color: getSecondaryTextColor() }]}>
              Personalized suggestions based on your notification patterns
            </Text>

            <View style={styles.recommendationsList}>
              <Animated.View
                style={[styles.recommendationItem, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                entering={FadeIn.delay(200)}
              >
                <Tag size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.recommendationText, { color: getTextColor() }]}>
                  Consider creating a "Shopping" category for your e-commerce notifications
                </Text>
              </Animated.View>

              <Animated.View
                style={[styles.recommendationItem, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                entering={FadeIn.delay(300)}
              >
                <VolumeX size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.recommendationText, { color: getTextColor() }]}>
                  You could mute promotional emails to reduce notification volume by 20%
                </Text>
              </Animated.View>

              <Animated.View
                style={[styles.recommendationItem, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                entering={FadeIn.delay(400)}
              >
                <Clock size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.recommendationText, { color: getTextColor() }]}>
                  Most of your important notifications arrive between 9 AM and 11 AM
                </Text>
              </Animated.View>
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
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  timeRangeContainer: {
    position: "relative",
    zIndex: 10,
  },
  timeRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeRangeOptions: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeRangeOptionText: {
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    height: 180,
    alignItems: "flex-end",
  },
  barChart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
  },
  chartYAxis: {
    width: 30,
    height: 150,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 12,
  },
  barContainer: {
    alignItems: "center",
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  pieChartContainer: {
    alignItems: "center",
  },
  pieChart: {
    marginTop: 20,
  },
  pieSegment: {
    borderRadius: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendLabel: {
    fontSize: 14,
  },
  topSendersList: {
    marginTop: 10,
  },
  topSenderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  senderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "500",
  },
  senderCount: {
    alignItems: "flex-end",
  },
  countText: {
    fontSize: 18,
    fontWeight: "700",
  },
  countLabel: {
    fontSize: 12,
  },
  recommendationsList: {
    marginTop: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
})

export default InsightsScreen
