"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, type FlatList } from "react-native"
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
  
  // Create animations for each item at the top level
  const itemAnimations = onboardingData.map((_, index) => {
    const opacity = useSharedValue(index === 0 ? 1 : 0)
    const translateY = useSharedValue(index === 0 ? 0 : 50)
    return { opacity, translateY }
  })

  // Create dot animations at the top level
  const dotWidths = onboardingData.map((_, index) => 
    useSharedValue(index === 0 ? 20 : 8))
  const dotOpacities = onboardingData.map((_, index) => 
    useSharedValue(index === 0 ? 1 : 0.5))

  // Animation effect when currentIndex changes
  useEffect(() => {
    dotWidths.forEach((width, index) => {
      const isActive = index === currentIndex
      width.value = withTiming(isActive ? 20 : 8, { duration: 500 })
    })
    
    dotOpacities.forEach((opacity, index) => {
      const isActive = index === currentIndex
      opacity.value = withTiming(isActive ? 1 : 0.5, { duration: 500 })
    })
    
    // Animate current slide content
    if (itemAnimations[currentIndex]) {
      itemAnimations[currentIndex].opacity.value = withTiming(1, { duration: 500 })
      itemAnimations[currentIndex].translateY.value = withTiming(0, { duration: 500 })
    }
  }, [currentIndex])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  const backgroundColor = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      scrollX.value / width,
      [0, 1, 2, 3],
      isDark ? ["#1e1e2e", "#1a1a2e", "#162032", "#1e1e2e"] : ["#f8fafc", "#f0f9ff", "#f0fdf4", "#faf5ff"],
    )

    return {
      backgroundColor: bgColor,
    }
  })

  // Create animated styles for each item at the top level
  const itemAnimatedStyles = onboardingData.map((_, index) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    return useAnimatedStyle(() => {
      const currentOpacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP)
      const currentTranslateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolate.CLAMP)

      return {
        opacity: currentOpacity,
        transform: [{ translateY: currentTranslateY }],
      }
    })
  })

  // Create animated styles for dots at the top level
  const dotAnimatedStyles = onboardingData.map((_, index) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    return useAnimatedStyle(() => {
      const widthInterpolated = interpolate(scrollX.value, inputRange, [8, 20, 8], Extrapolate.CLAMP)
      const opacityInterpolated = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP)

      return {
        width: widthInterpolated,
        opacity: opacityInterpolated,
      }
    })
  })

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const renderItem = ({ item, index }: { item: (typeof onboardingData)[0]; index: number }) => {
    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, itemAnimatedStyles[index]]}>
          {item.icon(isDark ? "#6366f1" : "#4f46e5")}
        </Animated.View>
        <Animated.View style={itemAnimatedStyles[index]}>
          <Text style={[styles.title, { color: isDark ? "#ffffff" : "#1e293b" }]}>{item.title}</Text>
          <Text style={[styles.description, { color: isDark ? "#a1a1aa" : "#64748b" }]}>{item.description}</Text>
        </Animated.View>
      </View>
    )
  }

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, dotAnimatedStyles[index], { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
          />
        ))}
      </View>
    )
  }

  return (
    <Animated.View style={[styles.container, backgroundColor]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: isDark ? "#a1a1aa" : "#64748b" }]}>Skip</Text>
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
          const index = Math.round(event.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>{currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 40,
    alignSelf: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default OnboardingScreen