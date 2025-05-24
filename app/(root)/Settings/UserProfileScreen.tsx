import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../utils/supabase';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

const UserProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get parameters passed from Settings screen
  const initialName = params.name as string || '';
  const initialEmail = params.email as string || '';
  const initialUsername = params.username as string || '';
  const initialAvatarUrl = params.avatar_url as string || '';

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: initialUsername,
    email: initialEmail,
    avatar_url: initialAvatarUrl,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Try to get profile from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      // Combine auth data with profile data
      setProfile({
        id: userData.user.id,
        username: profileData?.username || initialUsername || userData.user.email?.split('@')[0] || '',
        email: userData.user.email || initialEmail,
        avatar_url: profileData?.avatar_url || initialAvatarUrl,
        created_at: profileData?.created_at || userData.user.created_at,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          email: profile.email,
        });

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile(); // Reset to original values
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.editButton}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri: profile.avatar_url || 'https://via.placeholder.com/120'
            }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.username}
                onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
                placeholder="Enter username"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.username || 'Not set'}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{profile.email}</Text>
            <Text style={styles.fieldNote}>Email cannot be changed</Text>
          </View>

          {/* User ID */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>User ID</Text>
            <Text style={[styles.fieldValue, styles.userIdText]}>{profile.id}</Text>
          </View>

          {/* Member Since */}
          {profile.created_at && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Member Since</Text>
              <Text style={styles.fieldValue}>
                {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Cancel Button (only shown when editing) */}
        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  fieldsContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  fieldInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  fieldNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  userIdText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});

export default UserProfileScreen;
