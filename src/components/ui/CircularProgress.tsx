import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../theme';

interface CircularProgressProps {
  percentage: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularProgress({ 
  percentage, 
  radius = 40, 
  strokeWidth = 8,
  color = colors.accent 
}: CircularProgressProps) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const halfCircle = radius + strokeWidth;
  const size = halfCircle * 2;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={colors.card}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${halfCircle} ${halfCircle})`}
        />
      </Svg>
      <Text style={[styles.text, { fontSize: radius * 0.55 }]}>
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.fonts.bold,
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  }
});
