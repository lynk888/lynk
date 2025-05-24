import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CallLog {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  date: string;
  avatar: ImageSourcePropType;
}

const calls: CallLog[] = [
  {
    id: '1',
    name: 'Unknown',
    type: 'outgoing',
    date: '10/6/25',
    avatar: { uri: 'https://via.placeholder.com/50' },
  },
  {
    id: '2',
    name: 'Ahmed',
    type: 'incoming',
    date: '10/5/25',
    avatar: { uri: 'https://via.placeholder.com/50' },
  },
  {
    id: '3',
    name: 'Rita',
    type: 'missed',
    date: '10/4/25',
    avatar: { uri: 'https://via.placeholder.com/50' },
  },
  {
    id: '4',
    name: 'Olumide',
    type: 'outgoing',
    date: '10/3/25',
    avatar: { uri: 'https://via.placeholder.com/50' },
  },
];

const CallsScreen = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const renderCallLog = ({ item }: { item: CallLog }) => (
    <View style={styles.callItem}>
      <View style={styles.callInfo}>
        <Image
          source={item.avatar}
          style={styles.avatar}
        />
        <View style={styles.callDetails}>
          <Text style={styles.callerName}>{item.name}</Text>
          <View style={styles.callTypeContainer}>
            <Ionicons
              name={item.type === 'outgoing' ? 'call-outline' : 'arrow-down-outline'}
              size={16}
              color="#8E8E93"
            />
            <Text style={styles.callType}>{item.type}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.callDate}>{item.date}</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentButton,
              filter === 'all' && styles.segmentButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.segmentButtonText,
              filter === 'all' && styles.segmentButtonTextActive
            ]}>All</Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentButton,
              filter === 'missed' && styles.segmentButtonActive
            ]}
            onPress={() => setFilter('missed')}
          >
            <Text style={[
              styles.segmentButtonText,
              filter === 'missed' && styles.segmentButtonTextActive
            ]}>Missed</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filter === 'all' ? calls : calls.filter(call => call.type === 'missed')}
        renderItem={renderCallLog}
        keyExtractor={(item) => item.id}
        style={styles.callsList}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Chat/Contact/ContactScreen')}
        >
          <Ionicons name="people-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="call" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Calls</Text>
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentButtonText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#000000',
  },
  callsList: {
    flex: 1,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  callDetails: {
    justifyContent: 'center',
  },
  callerName: {
    fontSize: 16,
    fontWeight: '400',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callType: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 8,
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

export default CallsScreen;
