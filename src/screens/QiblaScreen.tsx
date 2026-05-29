import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ArrowUp, Compass } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { colors, typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { calculateQiblaBearing } from '../utils/qiblaMath';

const { width } = Dimensions.get('window');

export default function QiblaScreen() {
  const navigation = useNavigation();
  const { locationLat, locationLng, locationName } = useAppStore();
  
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const compassAnimation = useRef(new Animated.Value(0)).current;

  // Calculate Qibla bearing based on location
  useEffect(() => {
    if (locationLat && locationLng) {
      const bearing = calculateQiblaBearing(locationLat, locationLng);
      setQiblaBearing(bearing);
    }
  }, [locationLat, locationLng]);

  // Subscribe to Magnetometer
  useEffect(() => {
    Magnetometer.setUpdateInterval(50); // 50ms for smooth animation
    
    const subscription = Magnetometer.addListener((data) => {
      // Calculate heading from x and y magnetometer data
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      angle = angle - 90; // Adjust for phone orientation
      if (angle < 0) {
        angle = angle + 360;
      }
      
      // Calculate the difference between current heading and qibla bearing
      const diff = Math.abs(angle - qiblaBearing);
      
      // If we are within 5 degrees of the Qibla, mark as correct!
      if (diff < 5 || diff > 355) {
        if (!isCorrect) setIsCorrect(true);
      } else {
        if (isCorrect) setIsCorrect(false);
      }
      
      setHeading(angle);
    });

    return () => {
      subscription.remove();
    };
  }, [qiblaBearing, isCorrect]);

  // Smooth rotation animation
  useEffect(() => {
    // We want the compass arrow to point to Qibla relative to phone heading
    // The rotation of the arrow should be (Qibla Bearing - Phone Heading)
    let rotation = qiblaBearing - heading;
    if (rotation < 0) rotation += 360;
    
    Animated.timing(compassAnimation, {
      toValue: rotation,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaBearing]);

  const spin = compassAnimation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={colors.accent} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Qibla Finder</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          
          <GlassCard style={styles.infoCard} intensity="dark">
            <Compass color={colors.primary} size={24} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Point the arrow forward. When it glows green, you are facing Mecca.
            </Text>
          </GlassCard>

          {/* Compass Container */}
          <View style={styles.compassWrapper}>
            <View style={[styles.compassOuter, isCorrect && styles.compassOuterActive]}>
              <View style={styles.compassInner}>
                
                {/* Rotating Qibla Arrow */}
                <Animated.View style={[styles.arrowContainer, { transform: [{ rotate: spin }] }]}>
                  {/* Kaaba Icon at the tip */}
                  <View style={styles.kaabaIcon}>
                    <View style={styles.kaabaGoldBand} />
                  </View>
                  
                  {/* Arrow pointing to Kaaba */}
                  <ArrowUp 
                    color={isCorrect ? colors.success : colors.accent} 
                    size={80} 
                    strokeWidth={2}
                    style={{ marginTop: 10 }}
                  />
                </Animated.View>

              </View>
            </View>
          </View>

          {/* Location and Bearing Data */}
          <GlassCard style={styles.dataCard} intensity="light">
            <Text style={styles.locationText}>{locationName || "Location Unknown"}</Text>
            <View style={styles.bearingRow}>
              <View style={styles.bearingBox}>
                <Text style={styles.bearingLabel}>Qibla</Text>
                <Text style={styles.bearingValue}>{Math.round(qiblaBearing)}°</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.bearingBox}>
                <Text style={styles.bearingLabel}>Heading</Text>
                <Text style={[styles.bearingValue, isCorrect && { color: colors.success }]}>
                  {Math.round(heading)}°
                </Text>
              </View>
            </View>
          </GlassCard>

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    gap: 12,
  },
  infoIcon: {
    opacity: 0.8,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  compassWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  compassOuter: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.2)', // Accent color with low opacity
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,31,18,0.4)', // Dark glass background
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  compassOuterActive: {
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.6,
  },
  compassInner: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaIcon: {
    width: 32,
    height: 36,
    backgroundColor: '#111',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    position: 'absolute',
    top: -20, // Position at the very edge of the inner circle
  },
  kaabaGoldBand: {
    width: '100%',
    height: 6,
    backgroundColor: '#D4AF37',
    marginTop: 8,
  },
  arrowContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  locationText: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
  },
  bearingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  bearingBox: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bearingLabel: {
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  bearingValue: {
    fontFamily: typography.fonts.bold,
    color: colors.accent,
    fontSize: 28,
  },
});
