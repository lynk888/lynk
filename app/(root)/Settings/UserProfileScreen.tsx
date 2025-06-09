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
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
  bio?: string;
  interests?: string[];
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
    bio: '',
    interests: [],
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
        bio: profileData?.bio || '',
        interests: profileData?.interests || [],
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
          bio: profile.bio,
          interests: profile.interests,
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const fileExt = uri.split('.').pop();
      const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          avatar_url: publicUrl,
        });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            <Image
              source={{
                uri: profile.avatar_url || 'https://via.placeholder.com/120'
              }}
              style={styles.avatar}
            />
            {isEditing && (
              <View style={styles.changePhotoOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={pickImage}
            >
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

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, styles.bioInput]}
                value={profile.bio}
                onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.bio || 'No bio yet'}</Text>
            )}
          </View>

          {/* Interests */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Interests</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.interests?.join(', ')}
                onChangeText={(text) => setProfile(prev => ({ 
                  ...prev, 
                  interests: text.split(',').map(i => i.trim()).filter(i => i)
                }))}
                placeholder="Add interests (comma separated)"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.interests?.length ? profile.interests.join(', ') : 'No interests added'}
              </Text>
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
  bioInput: {
    height: 100,
  },
  changePhotoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfileScreen;
