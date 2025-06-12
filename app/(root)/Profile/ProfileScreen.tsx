import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileService } from '../../../services/profileService';
import { formatDistanceToNow } from 'date-fns';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [profile, setProfile] = useState<any>({
    id: params.userId as string,
    username: params.username as string,
    avatar_url: params.avatarUrl as string,
    bio: params.bio as string,
    interests: params.interests ? JSON.parse(params.interests as string) : [],
    created_at: params.memberSince as string,
    is_online: params.isOnline === 'true'
  });
  const [loading, setLoading] = useState(!params.userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    
    // Only fetch if we don't have complete data
    if (!profile.username || !profile.bio) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [params.userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!params.userId) {
        throw new Error('User ID is required');
      }

      const profileData = await ProfileService.getProfileById(params.userId as string);
      
      if (!profileData) {
        setError('Profile not found');
        return;
      }

      setProfile(profileData);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=random`
            }}
            style={styles.profileImage}
          />
        </View>

        {/* Username */}
        <Text style={styles.username}>{profile?.username || 'User'}</Text>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>
            {profile?.bio || 'No bio available'}
          </Text>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          {profile?.interests?.length > 0 ? (
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noInterestsText}>No interests added</Text>
          )}
        </View>

        {/* Member Since */}
        {profile?.created_at && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Since</Text>
            <Text style={styles.memberSinceText}>
              {(() => {
                try {
                  const date = new Date(profile.created_at);
                  if (isNaN(date.getTime())) {
                    return 'Date not available';
                  }
                  return formatDistanceToNow(date, { addSuffix: true });
                } catch (error) {
                  return 'Date not available';
                }
              })()}
            </Text>
          </View>
        )}

        {/* Online Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: profile?.is_online ? '#4CD964' : '#8E8E93' }
            ]} />
            <Text style={styles.statusText}>
              {profile?.is_online ? 'Online' : (() => {
                try {
                  const lastSeen = profile?.last_seen || profile?.created_at;
                  if (!lastSeen) return 'Last seen unknown';
                  const date = new Date(lastSeen);
                  if (isNaN(date.getTime())) {
                    return 'Last seen unknown';
                  }
                  return 'Last seen ' + formatDistanceToNow(date, { addSuffix: true });
                } catch (error) {
                  return 'Last seen unknown';
                }
              })()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  interestTag: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#000',
  },
  noInterestsText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  memberSinceText: {
    fontSize: 16,
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#000',
  },
}); 