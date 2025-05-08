import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PrivacyScreen = () => {
  const router = useRouter();
  const [isLocationEnabled, setIsLocationEnabled] = React.useState(false);
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = React.useState(true);
  const [isPersonalizedAdsEnabled, setIsPersonalizedAdsEnabled] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Location Services */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Location Services</Text>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.settingsItemText}>Location Services</Text>
            </View>
            <Switch
              value={isLocationEnabled}
              onValueChange={setIsLocationEnabled}
              trackColor={{ false: '#767577', true: '#34C759' }}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Data & Privacy</Text>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemText}>Analytics</Text>
                <Text style={styles.settingsItemDescription}>
                  Help improve the app by sharing anonymous usage data
                </Text>
              </View>
            </View>
            <Switch
              value={isAnalyticsEnabled}
              onValueChange={setIsAnalyticsEnabled}
              trackColor={{ false: '#767577', true: '#34C759' }}
              ios_backgroundColor="#767577"
            />
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#32C759' }]}>
                <Ionicons name="newspaper-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemText}>Personalized Ads</Text>
                <Text style={styles.settingsItemDescription}>
                  See ads based on your interests
                </Text>
              </View>
            </View>
            <Switch
              value={isPersonalizedAdsEnabled}
              onValueChange={setIsPersonalizedAdsEnabled}
              trackColor={{ false: '#767577', true: '#34C759' }}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        {/* Privacy Links */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>More Information</Text>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => router.push('/(root)/Settings/PrivacyPolicy')}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' }]}>
                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.settingsItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  settingsList: {
    marginTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    color: '#6B6B6B',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemText: {
    fontSize: 16,
    color: '#000000',
  },
  settingsItemDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default PrivacyScreen;