import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors, typography } from '../theme';
import { useAppStore } from '../store/useAppStore';

export default function MapScreen() {
  const navigation = useNavigation();
  const { locationLat, locationLng, setLocation } = useAppStore();
  
  const [region, setRegion] = useState<Region>({
    latitude: locationLat || 24.7136,
    longitude: locationLng || 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Move map to select location');

  // Reverse geocode whenever map stops moving
  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
      if (reverse && reverse.length > 0) {
        const g = reverse[0];
        const formattedAddress = [g.city, g.subregion, g.region, g.country].filter(Boolean).join(', ');
        setAddress(formattedAddress || 'Unknown Location');
      } else {
        setAddress('Unknown Location');
      }
    } catch (e) {
      setAddress('Unknown Location');
    }
  };

  const confirmLocation = () => {
    setLoading(true);
    setLocation(region.latitude, region.longitude, address);
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      
      {/* Center Pin Overlay */}
      <View style={styles.centerPinContainer} pointerEvents="none">
        <MapPin color={colors.accent} size={40} fill={colors.background} />
      </View>

      <SafeAreaView style={styles.overlaySafe} pointerEvents="box-none">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pick Location</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Selected Location</Text>
            <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={confirmLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Text style={styles.confirmText}>Confirm Location</Text>
                <Check color={colors.background} size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40, // offset half the pin height so it points accurately
    zIndex: 1,
  },
  overlaySafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(11, 31, 18, 0.85)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  footer: {
    backgroundColor: 'rgba(11, 31, 18, 0.95)',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  addressBox: {
    marginBottom: 20,
  },
  addressLabel: {
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  addressText: {
    fontFamily: typography.fonts.medium,
    color: colors.text,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  confirmText: {
    fontFamily: typography.fonts.bold,
    color: colors.background,
    fontSize: 16,
  },
});
