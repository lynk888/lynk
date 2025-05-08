import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Message Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MESSAGE NOTIFICATIONS</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show Notifications</Text>
          <Switch
            value={showNotifications}
            onValueChange={setShowNotifications}
            trackColor={{ false: '#767577', true: '#4CD964' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Message Preview</Text>
          <Switch
            value={messagePreview}
            onValueChange={setMessagePreview}
            trackColor={{ false: '#767577', true: '#4CD964' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound</Text>
          <View style={styles.settingValue}>
            <Text style={styles.valueText}>None</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Exceptions</Text>
          <View style={styles.settingValue}>
            <Text style={styles.valueText}>6 chats</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Set custom notifications for specific users.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 32, // To offset the back button and center the title
  },
  section: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 17,
    color: '#000000',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    marginHorizontal: 16,
    marginTop: 8,
  },
});

export default NotificationsScreen;