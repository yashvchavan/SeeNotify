"use client"

import React, { useRef, useState, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { Bell, Filter, Layers, Mail } from "lucide-react-native"

const { width } = Dimensions.get("window")

const onboardingData = [
  {
    id: "1",
    title: "Centralized Notification Management",
    description: "See all your notifications from multiple apps in one place.",
    icon: (color: string) => <Bell size={80} color={color} />,
  },
  {
    id: "2",
    title: "AI-Powered Filtering",
    description: "Our AI ensures you never miss important notifications while filtering out spam.",
    icon: (color: string) => <Filter size={80} color={color} />,
  },
  {
    id: "3",
    title: "Customizable Categories",
    description: "Sort notifications into Work, Social, Finance, and more based on your preferences.",
    icon: (color: string) => <Layers size={80} color={color} />,
  },
  {
    id: "4",
    title: "Integration with Gmail & Apps",
    description: "Sync your notifications with Gmail, WhatsApp, and other apps for a unified experience.",
    icon: (color: string) => <Mail size={80} color={color} />,
  },
]

interface OnboardingScreenProps {
  onComplete: () => void
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { isDark } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const scrollX = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  const backgroundColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        scrollX.value / width,
        [0, 1, 2, 3],
        isDark ? ["#1e1e2e", "#1a1a2e", "#162032", "#1e1e2e"] : ["#f8fafc", "#f0f9ff", "#f0fdf4", "#faf5ff"]
      ),
    }
  })

  const handleSkip = () => {
    console.log("Onboarding skipped!");
    onComplete();
  };
  
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Onboarding completed!");
      onComplete();
    }
  };
  

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>{item.icon(isDark ? "#6366f1" : "#4f46e5")}</View>
        <Text style={[styles.title, { color: isDark ? "#ffffff" : "#1e293b" }]}>{item.title}</Text>
        <Text style={[styles.description, { color: isDark ? "#a1a1aa" : "#64748b" }]}>{item.description}</Text>
      </View>
    )
  }

  return (
    <Animated.View style={[styles.container, backgroundColor]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { width, flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  iconContainer: { marginBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  description: { fontSize: 16, textAlign: "center", paddingHorizontal: 20, lineHeight: 24 },
  skipButton: { position: "absolute", top: 50, right: 20, zIndex: 1 },
  skipText: { fontSize: 16, fontWeight: "500", color: "#64748b" },
  nextButton: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, marginBottom: 40, alignSelf: "center", backgroundColor: "#4f46e5" },
  nextButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
})

export default OnboardingScreen
