import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ContactInfo = () => {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Contact info</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/80' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Olumide</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>bio</Text>
          <Text style={styles.infoText}>Design adds value faster, than it adds cost</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>username</Text>
          <Text style={styles.infoText}>@zack_life</Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextBlue}>Archive Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextRed}>Clear All Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextRed}>Delete Contact</Text>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoItem: {
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#000000',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionTextBlue: {
    fontSize: 16,
    color: '#007AFF',
  },
  actionTextRed: {
    fontSize: 16,
    color: '#FF3B30',
  },
});

export default ContactInfo;





