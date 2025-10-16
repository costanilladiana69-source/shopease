import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors.js';

export default function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Simulate connection status (in a real app, you'd check actual connection)
    const interval = setInterval(() => {
      setIsConnected(true); // Assume always connected for now
    }, 5000);

    // Pulse animation for the indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearInterval(interval);
      pulseAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            backgroundColor: isConnected ? COLORS.success : COLORS.error,
            opacity: pulseAnim 
          }
        ]} 
      />
      <Text style={styles.text}>
        {isConnected ? 'Real-time Connected' : 'Connecting...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

