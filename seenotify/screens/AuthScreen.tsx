"use client"

import React, { useState, useEffect } from "react"
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

interface AuthScreenProps {
  onLogin: () => void
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { isDark } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Define all shared values at component level
  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(50)
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)

  // Create animation styles at component level
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

  // Initial animation
  useEffect(() => {
    // Animate logo
    logoOpacity.value = withTiming(1, { duration: 800 })
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 400 }),
    )

    // Animate form
    formOpacity.value = withDelay(400, withTiming(1, { duration: 800 }))
    formTranslateY.value = withDelay(400, withTiming(0, { duration: 800 }))
  }, [])

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

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://192.168.75.118:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for sessions to work
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
  
      // Successful authentication
      onLogin();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch('http://192.168.75.118:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      Alert.alert('Success', 'Password has been reset successfully');
      setIsForgotPassword(false);
      setIsLogin(true);
      setEmail('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getPlaceholderColor = () => (isDark ? "#6b7280" : "#94a3b8")
  const getInputBgColor = () => (isDark ? "#1e1e2e" : "#f8fafc")
  const getInputBorderColor = () => (isDark ? "#374151" : "#e2e8f0")

  const renderAuthForm = () => (
    <Animated.View style={[styles.formContainer, formStyle]}>
      <Text style={[styles.title, { color: getTextColor() }]}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#a1a1aa" : "#64748b" }]}>
        {isLogin ? "Sign in to access all your notifications" : "Sign up to start managing your notifications"}
      </Text>

      <View style={styles.form}>
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
        </View>            {isLogin && (
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => {
                  setIsForgotPassword(true);
                  setEmail('');
                  setPassword('');
                }}
              >
                <Text style={{ color: isDark ? "#6366f1" : "#4f46e5" }}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
          onPress={handleAuth}
        >
          <Text style={styles.authButtonText}>{isLogin ? "Sign In" : "Sign Up"}</Text>
          <LogIn size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: getInputBorderColor() }]} />
          <Text style={[styles.dividerText, { color: isDark ? "#6b7280" : "#94a3b8" }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: getInputBorderColor() }]} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: getInputBgColor(),
                borderColor: getInputBorderColor(),
              },
            ]}
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
          >
            <Text style={{ color: getTextColor() }}>Apple</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  )

  const renderForgotPasswordForm = () => (
    <Animated.View style={[styles.formContainer, formStyle]}>
      <Text style={[styles.title, { color: getTextColor() }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#a1a1aa" : "#64748b" }]}>
        Enter your email and new password
      </Text>

      <View style={styles.form}>
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
            placeholder="New Password"
            placeholderTextColor={getPlaceholderColor()}
            value={newPassword}
            onChangeText={setNewPassword}
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

        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
          onPress={handleForgotPassword}
        >
          <Text style={styles.authButtonText}>Reset Password</Text>
          <LogIn size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchAuth}
          onPress={() => {
            setIsForgotPassword(false);
            setEmail('');
            setNewPassword('');
          }}
        >
          <Text style={{ color: isDark ? "#6366f1" : "#4f46e5", fontWeight: "600" }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#121212" : "#ffffff" }]}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Bell size={60} color={isDark ? "#6366f1" : "#4f46e5"} />
          <Text style={[styles.logoText, { color: getTextColor() }]}>SeeNotify</Text>
        </Animated.View>

        {isForgotPassword ? renderForgotPasswordForm() : renderAuthForm()}
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