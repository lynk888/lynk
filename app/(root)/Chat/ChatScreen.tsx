import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ImageStyle,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Camera, Phone, Plus, Settings, Users } from "lucide-react-native";
import { useRouter } from 'expo-router';
import { useConversations } from "../../../hooks/useConversations";

function MyComponent() {
  const router = useRouter();
  const { conversations, loading, error, refreshConversations } = useConversations();

  // Refresh conversations when the component mounts
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Navigation data for the bottom tabs
  const navigationItems = [
    {
      name: "Contacts",
      icon: <Users size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Chat/Contact/ContactScreen",
    },
    {
      name: "Calls",
      icon: <Phone size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Calls/CallsScreen",
    },
    {
      name: "Chats",
      icon: (
        <View style={styles.chatIconContainer}>
          <View style={styles.chatIconBox}>
            <View style={styles.chatIconLarge} />
            <View style={styles.chatIconSmall} />
          </View>
        </View>
      ),
      active: true,
      route: "/(root)/Chat/ChatScreen",
    },
    {
      name: "Settings",
      icon: <Settings size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Settings/SettingsScreen",
    },
  ];

  return (
    <View style={styles.view1}>
      <View style={styles.view2}>
        <View style={styles.view3}>
          <View style={styles.view4}>
            <Text style={styles.headerText}>Chats</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(root)/Chat/NewConversation')}
            style={styles.newChatButton}
          >
            <Plus size={24} color="#007aff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007aff" />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/(root)/Chat/NewConversation')}
            >
              <Text style={styles.startButtonText}>Start a new conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => router.push({
                  pathname: '/(root)/Chat/RealTimeChat',
                  params: { conversationId: item.id }
                })}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.participants && item.participants[0]?.username
                      ? item.participants[0].username.charAt(0).toUpperCase()
                      : '?'}
                  </Text>
                </View>
                <View style={styles.conversationDetails}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>
                      {item.participants && item.participants[0]?.username
                        ? item.participants[0].username
                        : 'Unknown User'}
                    </Text>
                    {item.last_message_time && (
                      <Text style={styles.timeText}>
                        {new Date(item.last_message_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.messagePreviewContainer}>
                    <Text
                      style={styles.messagePreview}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.last_message_text || 'No messages yet'}
                    </Text>
                    {item.unread_count ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.unread_count}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.conversationsList}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavContent}>
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <Text style={[styles.navText, item.active && styles.activeText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view1: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  view2: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  view3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  view4: {
    flex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  conversationsList: {
    paddingTop: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagePreview: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  bottomNav: {
    height: 83,
    borderTopWidth: 1,
    borderTopColor: '#3d3d3f20',
    backgroundColor: '#f9f9f9f0',
  },
  bottomNavContent: {
    flexDirection: 'row',
    height: '100%',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  activeIcon: {
    color: '#007aff',
  },
  navText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0000004c',
    letterSpacing: 0.1,
  },
  activeText: {
    color: '#007aff',
  },
  chatIconContainer: {
    position: 'relative',
    height: 25,
  },
  chatIconBox: {
    width: 30,
    height: 25,
    position: 'relative',
  },
  chatIconLarge: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007aff',
    borderRadius: 4,
  },
  chatIconSmall: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#007aff',
    borderRadius: 2,
    bottom: 0,
    right: 0,
  },
});

export default MyComponent;
