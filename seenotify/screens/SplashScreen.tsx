"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { Bell } from "lucide-react-native"

const SplashScreen = () => {
  const { isDark } = useTheme()
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const progressWidth = useSharedValue(0)

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    }
  })

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    }
  })

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
    }
  })

  useEffect(() => {
    // Animate logo
    logoOpacity.value = withTiming(1, { duration: 800 })
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 400 }),
    )

    // Animate text
    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }))

    // Animate progress bar
    progressWidth.value = withDelay(800, withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) }))
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#ffffff" }]}>
      <Animated.View style={logoStyle}>
        <Bell size={80} color={isDark ? "#6366f1" : "#4f46e5"} strokeWidth={1.5} />
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text style={[styles.title, { color: isDark ? "#ffffff" : "#1e293b" }]}>SeeNotify</Text>
        <Text style={[styles.slogan, { color: isDark ? "#a1a1aa" : "#64748b" }]}>
          All Your Notifications, One Place
        </Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressBar, progressStyle, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  slogan: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  progressContainer: {
    height: 4,
    width: "60%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 40,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
})

export default SplashScreen
