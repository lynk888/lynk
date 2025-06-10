import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface MessageCountBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const MessageCountBadge: React.FC<MessageCountBadgeProps> = ({ 
  count, 
  size = 'medium',
  style 
}) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  
  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
    },
  };

  return (
    <View style={[styles.badge, sizeStyles[size].container, style]}>
      <Text style={[styles.badgeText, sizeStyles[size].text]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.accent.secondary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Small size
  smallContainer: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  smallText: {
    fontSize: 10,
  },
  
  // Medium size (default)
  mediumContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  mediumText: {
    fontSize: 12,
  },
  
  // Large size
  largeContainer: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  largeText: {
    fontSize: 14,
  },
});
