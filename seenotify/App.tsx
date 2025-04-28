"use client"

import "react-native-gesture-handler"
import React, { useEffect, useState } from "react"
import { StatusBar } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import SplashScreen from "./screens/SplashScreen"
import OnboardingScreen from "./screens/OnboardingScreen"
import AuthScreen from "./screens/AuthScreen"
import MainNavigator from "./navigation/MainNavigator"
import { ThemeProvider } from "./context/ThemeContext"
import type { RootStackParamList } from "./type"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar barStyle="default" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!isAppReady ? (
                <Stack.Screen name="Splash" component={SplashScreen} />
              ) : !hasSeenOnboarding ? (
                <Stack.Screen name="Onboarding">
                  {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
                </Stack.Screen>
              ) : !isAuthenticated ? (
                <Stack.Screen name="Auth">
                  {(props) => <AuthScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Main" component={MainNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}