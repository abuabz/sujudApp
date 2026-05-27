import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../../theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'dark';
}

export function GlassCard({ children, style, intensity = 'medium', ...props }: GlassCardProps) {
  // Simulating glassmorphism without expo-blur for cross-platform robustness
  // Using semi-transparent background and subtle borders
  const bgOpacity = intensity === 'light' ? '1A' : intensity === 'medium' ? '33' : '4D';
  
  return (
    <View 
      style={[
        styles.card,
        { backgroundColor: `${colors.card}${bgOpacity}` },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.highlight}20`,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  }
});
