"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { Bell, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react-native"
import { useSignIn, useSignUp, useOAuth, useAuth } from "@clerk/clerk-expo"
import { EXPO_PUBLIC_CLERK_OAUTH_CALLBACK_URL } from "@env"

interface AuthScreenProps {
  onLogin: () => void
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { isDark } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" })
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" })
  const { getToken } = useAuth() // Add useAuth hook

  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(50)
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)

  const formStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    }
  })

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    }
  })

  // Add logging for initialization
  React.useEffect(() => {
    console.log("AuthScreen mounted")
    console.log("SignIn initialized:", !!signIn)
    console.log("SignUp initialized:", !!signUp)
    console.log("GoogleAuth initialized:", !!googleAuth)
    console.log("AppleAuth initialized:", !!appleAuth)
    
    // Animate logo
    logoOpacity.value = withTiming(1, { duration: 800 })
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 400 }),
    )

    // Animate form
    formOpacity.value = withDelay(400, withTiming(1, { duration: 800 }))
    formTranslateY.value = withDelay(400, withTiming(0, { duration: 800 }))

    return () => {
      console.log("AuthScreen unmounted")
    }
  }, [signIn, signUp, googleAuth, appleAuth])

  const toggleAuthMode = () => {
    // Animate form out
    formOpacity.value = withTiming(0, { duration: 300 })
    formTranslateY.value = withTiming(20, { duration: 300 })

    // Toggle mode
    setTimeout(() => {
      setIsLogin(!isLogin)

      // Animate form back in
      formOpacity.value = withTiming(1, { duration: 500 })
      formTranslateY.value = withTiming(0, { duration: 500 })
    }, 300)
  }

  const fetchUserData = async () => {
    try {
      const token = await getToken()
      const response = await fetch("https://api.clerk.dev/v1/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log("User data:", data)
    } catch (err) {
      console.error("Failed to fetch user data:", err)
    }
  }
  
  const handleAuth = async () => {
    try {
      if (isLogin) {
        // Sign in
        if (!signIn) throw new Error("SignIn is not initialized")
        const result = await signIn.create({
          identifier: email,
          password,
        })
        if (result.status === "complete") {
          await fetchUserData() // Fetch user data after successful login
          onLogin()
        }
      } else {
        // Sign up
        if (!signUp) throw new Error("SignUp is not initialized")
        const result = await signUp.create({
          emailAddress: email,
          password,
        })
        if (result.status === "complete") {
          await fetchUserData() // Fetch user data after successful sign-up
          onLogin()
        }
      }
    } catch (err) {
      console.error("Authentication error:", err)
      Alert.alert("Error", "Failed to authenticate. Please try again.")
    }
  }

  const handleGoogleAuth = async () => {
    try {
      if (!googleAuth) throw new Error("Google OAuth is not initialized")

      console.log("Starting Google OAuth flow...")
      
      // For mobile and web compatibility
      const redirectUrl = Platform.OS === 'web' 
        ? "https://divine-cub-68.clerk.accounts.dev/v1/oauth_callback" // Update with the exact URL from your new Clerk app
        : undefined;
        
      console.log("Using redirectUrl:", redirectUrl);
      
      // Start OAuth flow with enhanced error logging
      const result = await googleAuth({
        redirectUrl
      }).catch(error => {
        console.error("GoogleAuth error caught:", error);
        throw error;
      });
      
      if (!result) {
        console.log("OAuth result is null or undefined");
        return;
      }
      
      console.log("OAuth result full:", JSON.stringify(result, null, 2));
      
      const { createdSessionId, setActive } = result;

      if (createdSessionId) {
        console.log("Session created successfully:", createdSessionId);
        if (setActive) {
          try {
            await setActive({ session: createdSessionId });
            console.log("Session activated");
            await fetchUserData();
            
            // This will trigger the root component to re-render with isSignedIn=true
            console.log("Auth successful, calling onLogin callback");
            onLogin();
          } catch (setActiveError) {
            console.error("Error activating session:", setActiveError);
            Alert.alert("Error", "Authentication successful but session activation failed");
          }
        } else {
          console.error("setActive function is undefined");
          Alert.alert("Error", "Authentication successful but session activation failed");
        }
      } else {
        console.log("No session ID created - user may have cancelled or another error occurred");
      }
    } catch (err) {
      console.error("Google OAuth error details:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Authentication Error", 
        `Failed to authenticate with Google: ${err instanceof Error ? err.message : "Unknown error"}. Please check console logs.`
      );
    }
  }

  const handleAppleAuth = async () => {
    try {
      if (!appleAuth) throw new Error("Apple OAuth is not initialized")
      const { createdSessionId, setActive } = await appleAuth()
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId })
        await fetchUserData() // Fetch user data after successful Apple OAuth
        onLogin()
      }
    } catch (err) {
      console.error("Apple OAuth error:", err)
      Alert.alert("Error", "Failed to authenticate with Apple. Please try again.")
    }
  }

  const handleForgotPassword = async () => {
    try {
      if (!signIn) throw new Error("SignIn is not initialized")
      await signIn.create({
        strategy: "email_link",
        identifier: email,
      })
      Alert.alert("Success", "Password reset email sent!")
    } catch (err) {
      console.error("Forgot password error:", err)
      Alert.alert("Error", "Failed to send password reset email. Please try again.")
    }
  }

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getPlaceholderColor = () => (isDark ? "#6b7280" : "#94a3b8")
  const getInputBgColor = () => (isDark ? "#1e1e2e" : "#f8fafc")
  const getInputBorderColor = () => (isDark ? "#374151" : "#e2e8f0")

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#121212" : "#ffffff" }]}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Bell size={60} color={isDark ? "#6366f1" : "#4f46e5"} />
          <Text style={[styles.logoText, { color: getTextColor() }]}>SeeNotify</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, formStyle]}>
          <Text style={[styles.title, { color: getTextColor() }]}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
          <Text style={[styles.subtitle, { color: isDark ? "#a1a1aa" : "#64748b" }]}>
            {isLogin ? "Sign in to access all your notifications" : "Sign up to start managing your notifications"}
          </Text>

          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={isDark ? "#6b7280" : "#94a3b8"} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: getTextColor(),
                    backgroundColor: getInputBgColor(),
                    borderColor: getInputBorderColor(),
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={getPlaceholderColor()}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={isDark ? "#6b7280" : "#94a3b8"} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: getTextColor(),
                    backgroundColor: getInputBgColor(),
                    borderColor: getInputBorderColor(),
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={getPlaceholderColor()}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={isDark ? "#6b7280" : "#94a3b8"} />
                ) : (
                  <Eye size={20} color={isDark ? "#6b7280" : "#94a3b8"} />
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={{ color: isDark ? "#6366f1" : "#4f46e5" }}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Auth Button */}
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
              onPress={handleAuth}
            >
              <Text style={styles.authButtonText}>{isLogin ? "Sign In" : "Sign Up"}</Text>
              <LogIn size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: getInputBorderColor() }]} />
              <Text style={[styles.dividerText, { color: isDark ? "#6b7280" : "#94a3b8" }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: getInputBorderColor() }]} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: getInputBgColor(),
                    borderColor: getInputBorderColor(),
                  },
                ]}
                onPress={handleGoogleAuth}
              >
                <Text style={{ color: getTextColor() }}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: getInputBgColor(),
                    borderColor: getInputBorderColor(),
                  },
                ]}
                onPress={handleAppleAuth}
              >
                <Text style={{ color: getTextColor() }}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch Auth Mode */}
          <View style={styles.switchAuth}>
            <Text style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={{ color: isDark ? "#6366f1" : "#4f46e5", fontWeight: "600" }}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 48,
    fontSize: 16,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  authButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 24,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 0.48,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  switchAuth: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
})

export default AuthScreen