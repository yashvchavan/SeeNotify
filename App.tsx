import "react-native-gesture-handler"
import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { Platform, Text, View, ActivityIndicator } from "react-native"
import { NavigationContainer, RouteProp } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ClerkProvider, useAuth } from "@clerk/clerk-expo"
import * as SecureStore from "expo-secure-store"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY } from "@env"

import SplashScreen from "./screens/SplashScreen"
import OnboardingScreen from "./screens/OnboardingScreen"
import AuthScreen from "./screens/AuthScreen"
import MainNavigator from "./navigation/MainNavigator"
import { ThemeProvider } from "./context/ThemeContext"
import type { RootStackParamList } from "./type"
import React from "react"
import { setupNotificationListener } from "./utils/notificationListener"

const Stack = createNativeStackNavigator<RootStackParamList>()

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

// Navigation Root component that handles auth state
const NavigationRoot = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Initialize app and check if user has seen onboarding
  useEffect(() => {
    const initializeApp = async () => {
      console.log("Initializing App...")
      
      try {
        // Check if user has seen onboarding
        const onboardingCompleted = await AsyncStorage.getItem('hasSeenOnboarding');
        if (onboardingCompleted === 'true') {
          setHasSeenOnboarding(true);
        }
        
        // Initialize notification system in the background
        setupNotificationListener().then(success => {
          console.log('Notification system initialized:', success ? 'success' : 'failed');
        });
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
      
      // Simulate splash screen for 3 seconds
      setTimeout(() => {
        console.log("App is ready!")
        setIsAppReady(true)
      }, 3000);
    };
    
    initializeApp();
  }, []);

  const handleOnboardingComplete = async () => {
    console.log("Setting onboarding complete...")
    setHasSeenOnboarding(true);
    
    // Save onboarding complete status
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  console.log("Auth State:", { isLoaded, isSignedIn, isAppReady, hasSeenOnboarding });

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10 }}>Loading authentication...</Text>
      </View>
    );
  }

  // Show splash screen
  if (!isAppReady) {
    return <SplashScreen />;
  }

  // Show onboarding
  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Determine which screen to show based on auth state
  return isSignedIn ? (
    <MainNavigator />
  ) : (
    <AuthScreen onLogin={() => console.log("Login successful")} />
  );
};

export default function App() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey="pk_test_ZGl2aW5lLWN1Yi02OC5jbGVyay5hY2NvdW50cy5kZXYk"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ThemeProvider>
              <StatusBar style="auto" />
              <NavigationRoot />
            </ThemeProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}