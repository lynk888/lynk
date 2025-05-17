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
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  // Navigation data for the bottom tabs
  const navigationItems = [
    {
      name: "Contacts",
      icon: <Users size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Chat/Contact/ContactScreen"
    },
    {
      name: "Calls",
      icon: <Phone size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Calls/CallsScreen"
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
      route: "/(root)/Chat/ChatScreen"
    },
    {
      name: "Settings",
      icon: <Settings size={24} color="#0000004c" />,
      active: false,
      route: "/(root)/Settings/SettingsScreen"
    }
  ];

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
        <TouchableOpacity 
          style={styles.view7} 
          onPress={() => router.push('/(root)/Chat/Contact/ContactScreen')}
        >
          <Text>Start messaging</Text>
        </TouchableOpacity>
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
});

export default MyComponent;
