import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { ChevronLeft, Share, Sun, Moon, Sunrise } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getPrayerTimesForDate, PrayerTimesData } from '../services/prayerTimes';
import { getNextPrayer, formatTime, NextPrayerResult } from '../utils/timeUtils';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';

export default function TimesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const viewShotRef = useRef<ViewShot>(null);

  const locationLat = useAppStore(state => state.locationLat);
  const locationLng = useAppStore(state => state.locationLng);
  const locationNameCache = useAppStore(state => state.locationName);
  const setLocation = useAppStore(state => state.setLocation);

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerResult | null>(null);
  const [locationName, setLocationName] = useState(locationNameCache || 'Riyadh, Saudi Arabia');
  const [dateString, setDateString] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        setIsSharing(true);
        // Wait a tiny bit for the UI to render the footer
        setTimeout(async () => {
          try {
            const uri = await captureRef(viewShotRef, {
              format: 'jpg',
              quality: 0.9,
            });
            setIsSharing(false);
            await Sharing.shareAsync(uri);
          } catch (e) {
            setIsSharing(false);
            console.log('Capture error:', e);
          }
        }, 100);
      }
    } catch (error) {
      setIsSharing(false);
      console.log('Error sharing:', error);
    }
  };

  useEffect(() => {
    (async () => {
      let lat = locationLat ?? 24.7136;
      let lng = locationLng ?? 46.6753;
      let locName = locationNameCache;

      if (locationLat === null || locationLng === null) {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let location = await Location.getLastKnownPositionAsync({});
            if (!location) {
              location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            }
            if (location) {
              lat = location.coords.latitude;
              lng = location.coords.longitude;
            }

            Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }).then(geocode => {
              if (geocode && geocode.length > 0) {
                const g = geocode[0];
                locName = [g.city, g.subregion, g.region, g.country].filter(Boolean).join(', ');
                setLocationName(locName || 'Unknown Location');
                setLocation(lat, lng, locName || 'Unknown Location');
              }
            }).catch(e => console.log('Geocode error', e));
          }
        } catch (error) {
          console.log('Error getting location, using default', error);
        }
      }

      const times = getPrayerTimesForDate(new Date(), lat, lng);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times, new Date()));

      // Basic date formatting
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      setDateString(new Date().toLocaleDateString('en-GB', options) + ' / 10 Dhul-Qadah 1445'); // Hijri is mock for now
    })();
  }, []);

  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (prayerTimes) {
      Animated.stagger(150,
        animatedValues.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          })
        )
      ).start();
    }
  }, [prayerTimes]);

  const isFriday = new Date().getDay() === 5;

  const prayers = prayerTimes ? [
    { name: 'Fajr', time: formatTime(prayerTimes.fajr), icon: Moon, current: nextPrayer?.name === 'Fajr' },
    { name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), icon: Sun, current: nextPrayer?.name === 'Dhuhr' },
    { name: 'Asr', time: formatTime(prayerTimes.asr), icon: Sun, current: nextPrayer?.name === 'Asr' },
    { name: 'Maghrib', time: formatTime(prayerTimes.maghrib), icon: Sunrise, current: nextPrayer?.name === 'Maghrib' },
    { name: 'Isha', time: formatTime(prayerTimes.isha), icon: Moon, current: nextPrayer?.name === 'Isha' },
  ] : [];

  const getBgForPrayer = (name: string) => {
    switch (name) {
      case 'Fajr': return require('../../assets/fajr_bg.png');
      case 'Dhuhr': return require('../../assets/dhuhr_bg.png');
      case 'Asr': return require('../../assets/asr_bg.jpeg');
      case 'Maghrib': return require('../../assets/maghrib_bg.png');
      case 'Isha': return require('../../assets/isha_bg.jpeg');
      default: return require('../../assets/fajr_bg.png');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Share color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={[{ backgroundColor: 'transparent', flex: 1 }, isSharing && { paddingBottom: 40 }]}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{locationName}</Text>
              <Text style={styles.dateText}>{dateString}</Text>
            </View>

            <View style={styles.prayersList}>
              {prayers.map((prayer, index) => {
                const translateY = animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                });
                const opacity = animatedValues[index];

                return (
                  <Animated.View key={prayer.name} style={[styles.prayerRowContainer, prayer.current && styles.prayerRowActive, { opacity, transform: [{ translateY }] }]}>
                    <ImageBackground source={getBgForPrayer(prayer.name)} style={styles.prayerRowImage} imageStyle={{ borderRadius: 20 }} resizeMode="cover">
                      <LinearGradient
                        colors={['transparent', '#0b1f13db']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.prayerRowOverlay}
                      />
                      <View style={styles.prayerContent}>
                        <View style={styles.prayerTextContainer}>
                          <View style={styles.prayerNameRow}>
                            <prayer.icon color={prayer.current ? colors.accent : colors.white} size={20} />
                            <Text style={[styles.prayerName, { color: colors.white }]}>{isFriday && prayer.name === 'Dhuhr' ? 'Juma' : prayer.name}</Text>
                          </View>
                          <Text style={[styles.prayerTime, { color: colors.white }]}>{prayer.time}</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </Animated.View>
                );
              })}
            </View>

            {/* App Branding Footer for Share */}
            {isSharing && (
              <View style={styles.shareFooter}>
                <Image source={require('../../assets/icon.png')} style={styles.shareLogo} />
                <View>
                  <Text style={styles.shareFooterText}>Sujud App</Text>
                  <Text style={styles.sharePoweredText}>powered by abuparambil</Text>
                </View>
              </View>
            )}
          </ViewShot>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: '#D4AF37', // Elegant gold font
  },
  iconButton: {
    padding: 8,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  locationText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 6,
  },
  dateText: {
    fontFamily: typography.fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
  },
  prayersList: {
    flex: 1,
    gap: 12,
    marginBottom: 40,
  },
  prayerRowContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  prayerRowImage: {
    flex: 1,
    justifyContent: 'center',
  },
  prayerRowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  prayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
  },
  prayerRowActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prayerTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  prayerName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  prayerTime: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  timetableButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#1E7A3A',
    borderRadius: 24,
  },
  timetableButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  shareFooter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  shareLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  shareFooterText: {
    fontFamily: typography.fonts.bold,
    color: colors.white,
    fontSize: typography.sizes.sm,
    opacity: 0.6,
  },
  sharePoweredText: {
    fontFamily: typography.fonts.regular,
    color: colors.white,
    fontSize: 8,
    opacity: 0.4,
    marginTop: -2,
  },
});
