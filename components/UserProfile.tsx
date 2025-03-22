import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '../context/ThemeContext';

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile = ({ onLogout }: UserProfileProps) => {
  const { user } = useUser();
  const { isDark } = useTheme();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {user.imageUrl ? (
          <Image 
            source={{ uri: user.imageUrl }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#374151' : '#e2e8f0' }]}>
            <Text style={{ fontSize: 20, color: isDark ? '#f8fafc' : '#1e293b' }}>
              {user.firstName?.[0] || user.username?.[0] || '?'}
            </Text>
          </View>
        )}
        
        <View style={styles.userInfo}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#f8fafc' : '#1e293b' }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#a1a1aa' : '#64748b' }}>
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {onLogout && (
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDark ? '#374151' : '#e2e8f0' }]}
          onPress={onLogout}
        >
          <Text style={{ color: isDark ? '#f8fafc' : '#1e293b' }}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});

export default UserProfile; 