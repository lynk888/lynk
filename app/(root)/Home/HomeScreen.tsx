import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
// import { useMessageManagement } from '../../../hooks/useMessageManagement';
// import { MessageCountBadge } from '../../../components/MessageCountBadge';
import { Colors } from '../../../constants/Colors';

const HomeScreen: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  // const { totalUnreadCount } = useMessageManagement();
  const totalUnreadCount: number = 0; // Temporary placeholder

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to LYNK</Text>
          {/* {totalUnreadCount > 0 && (
            <MessageCountBadge
              count={totalUnreadCount}
              size="medium"
              style={styles.messageBadge}
            />
          )} */}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>You're now connected!</Text>
        {totalUnreadCount > 0 && (
          <Text style={styles.unreadText}>
            You have {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
          </Text>
        )}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(root)/Contacts/ContactsScreen')}
          >
            <Text style={styles.navButtonText}>📱 Contacts</Text>
            <Text style={styles.navButtonSubtext}>View and manage your friends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(root)/Chat/ChatScreen')}
          >
            <Text style={styles.navButtonText}>💬 Chats</Text>
            <Text style={styles.navButtonSubtext}>Start conversations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(root)/Settings/SettingsScreen')}
          >
            <Text style={styles.navButtonText}>⚙️ Settings</Text>
            <Text style={styles.navButtonSubtext}>Customize your experience</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  messageBadge: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  unreadText: {
    fontSize: 16,
    color: '#006D77',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  navigationContainer: {
    gap: 16,
    marginTop: 20,
  },
  navButton: {
    backgroundColor: Colors.primary.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.darkSlateGray,
    marginBottom: 4,
  },
  navButtonSubtext: {
    fontSize: 14,
    color: '#4A5568',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: Colors.status.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;