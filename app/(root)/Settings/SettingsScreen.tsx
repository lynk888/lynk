import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, email } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [email]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        console.error('No user found');
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

      // Set profile data
      setUserProfile({
        id: userData.user.id,
        username: profileData?.username || userData.user.email?.split('@')[0] || 'User',
        email: userData.user.email || email || '',
        avatar_url: profileData?.avatar_url,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfilePress = () => {
    if (userProfile) {
      router.push({
        pathname: '/(root)/Settings/UserProfileScreen',
        params: {
          name: userProfile.username,
          email: userProfile.email,
          username: userProfile.username,
          avatar_url: userProfile.avatar_url || '',
        },
      });
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    // Implement actual delete account logic here
    Alert.alert('Account Deleted', 'Your account has been permanently deleted');
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress}>
        {loadingProfile ? (
          <View style={styles.profileLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.profileLoadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <Image
              source={{
                uri: userProfile?.avatar_url || 'https://via.placeholder.com/60'
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.username || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile?.email || 'No email'}
              </Text>
              <Text style={styles.profileHandle}>
                @{userProfile?.username || 'username'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </>
        )}
      </TouchableOpacity>

      {/* Settings Options */}
      <View style={styles.settingsOptions}>
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push('/(root)/Settings/NotificationsScreen')}
        >
          <View style={styles.settingsItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#4CD964' }]}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.settingsItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push('/(root)/Settings/PrivacyScreen')}
        >
          <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.settingsItemText}>Privacy and Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Text style={styles.deleteAccount}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>No, Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.deleteButtonText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setShowLogoutModal(true)}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Chat/Contact/ContactScreen')}
        >
          <Ionicons name="people-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Calls/CallsScreen')}
        >
          <Ionicons name="call-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Calls</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Chat/ChatScreen')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Chat</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    minHeight: 80,
  },
  profileLoadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileLoadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  profileHandle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingsOptions: {
    marginTop: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    fontSize: 16,
  },
  dangerZone: {
    marginTop: 'auto',
    padding: 16,
  },
  deleteAccount: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activeNavText: {
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});

export default SettingsScreen;
