import React from 'react';
import image1 from './assets/images/ahmed.png'
import image2 from './assets/images/Olumide.png'
import image3 from './assets/images/Rita.png'
import { ImageSourcePropType } from 'react-native';


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Contact {
  id: string;
  name: string;
  status: string;
  avatar: string | { uri: string }; // Support both string URLs and objects with a uri property
}

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Ahmed',
    status: 'online',
    avatar: image1
  },
  {
    id: '2',
    name: 'Olumide',
    status: 'online',
    avatar: image2
  },
  {
    id: '3',
    name: 'Rita',
    status: 'online',
    avatar: image3
    
    

  },
];

const ContactsScreen = () => {
  const router = useRouter();

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Image
          source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.onlineIndicator} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Contacts</Text>

      <TouchableOpacity style={styles.addFriendsButton}>
        <Ionicons name="person-add-outline" size={24} color="#000" />
        <Text style={styles.addFriendsText}>Add Friends</Text>
      </TouchableOpacity>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Contact</Text>
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Settings/SettingsScreen')}
        >
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Settings</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  addFriendsText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CD964',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  navItem: {
    alignItems: 'center',
    position: 'relative',
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ContactsScreen;
