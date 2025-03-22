import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTheme } from '../context/ThemeContext'; 
import UserProfile from '../components/UserProfile';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isDark } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1e293b' }]}>Welcome to SeeNotify</Text>
      <UserProfile onLogout={handleSignOut} />
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: isDark ? '#a1a1aa' : '#64748b' }]}>
          View and manage your notifications here
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  content: {
    marginTop: 24,
  },
});

export default HomeScreen; 