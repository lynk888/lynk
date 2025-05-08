import * as React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ImageStyle,
  TouchableOpacity,
} from "react-native";
import { Camera, Phone, Plus, Settings, Users } from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

function MyComponent() {
  return (
    <View style={styles.view1}>
      <View style={styles.view2}>
        <View style={styles.view3}>
          <View style={styles.view4}>
            <Text style={styles.headerText}>Chats</Text>
          </View>
          <Image
            resizeMode="contain"
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/b3463ce93a5d4046b208184ab25b408e/b889712010381bbb2caf2029ee632ec5375c0629?apiKey=b3463ce93a5d4046b208184ab25b408e&",
            }}
            style={styles.image1 as ImageStyle}
          />
          <Image
            resizeMode="contain"
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/b3463ce93a5d4046b208184ab25b408e/83ebe4443bd64d5a4931e34c500e4e7feba408d5?apiKey=b3463ce93a5d4046b208184ab25b408e&",
            }}
            style={styles.image2}
          />
        </View>
        <View style={styles.view5}>
          {/* <View style={styles.view6}>
            <Text>Tap on </Text> <Text>in the top right to start a chat</Text>
          </View> */}
          <Image
            resizeMode="contain"
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/b3463ce93a5d4046b208184ab25b408e/e834acf49b48d17b416f3c1e4cbefa06657ccafa?apiKey=b3463ce93a5d4046b208184ab25b408e&",
            }}
            style={styles.image3 as ImageStyle}
          />
        </View>
        <TouchableOpacity style={styles.view7} >
          <Text>Start messaging</Text>
        </TouchableOpacity>
      </View>

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
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubbles" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Chat</Text>
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
    paddingHorizontal: 38,
    paddingTop: 68,
  },
  view3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  view4: {
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  image1: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
  image2: {
    width: 40,
    height: 40,
  },
  view5: {
    alignItems: 'center',
    marginTop: 294,
  },
  view6: {
    fontWeight: 'bold',
  },
  image3: {
    width: 20,
    height: 20,
  },
  view7: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#7CC2E4',
    padding: 10,
    borderRadius: 5,
    marginLeft:100,
    width: 150,
    justifyContent: 'center',
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
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  activeNavText: {
    color: '#007AFF',
  },
});

export default MyComponent;
