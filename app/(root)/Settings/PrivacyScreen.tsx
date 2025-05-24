import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PrivacyScreen = () => {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Privacy</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          Your privacy is important to us. This privacy policy explains how we collect,
          use, and protect your information when you use our messaging app.
        </Text>

        <Text style={styles.subTitle}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          • Account information (email, username)
          • Messages and media you send
          • Contact information you choose to share
        </Text>

        <Text style={styles.subTitle}>How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          • To provide messaging services
          • To improve our app
          • To ensure security and prevent abuse
        </Text>

        <Text style={styles.subTitle}>Data Security</Text>
        <Text style={styles.paragraph}>
          We use industry-standard encryption to protect your messages and personal information.
        </Text>

        <Text style={styles.subTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy, please contact us at privacy@lynk.app
        </Text>
      </ScrollView>
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
    marginRight: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
});

export default PrivacyScreen;