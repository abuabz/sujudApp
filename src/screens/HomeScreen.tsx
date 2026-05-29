import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tz_lookup from 'tz-lookup';
import { colors, typography } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientBackground } from '../components/ui/GradientBackground';
import { CircularProgress } from '../components/ui/CircularProgress';
import { HomeSkeleton } from '../components/ui/HomeSkeleton';
import { Menu, Bell, Sun, Moon, Sunrise, CircleCheck, Circle } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getPrayerTimesForDate, PrayerTimesData } from '../services/prayerTimes';
import { getNextPrayer, formatCountdown, formatTime, PrayerName, NextPrayerResult } from '../utils/timeUtils';
import { usePrayerStore, PrayerName as StorePrayerName } from '../store/usePrayerStore';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SideMenuModal } from '../components/ui/SideMenuModal';
import { Calendar, AlertCircle, MapPin, Compass } from 'lucide-react-native';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [localTime, setLocalTime] = useState('');

  const addRecord = usePrayerStore(state => state.addRecord);
  const records = usePrayerStore(state => state.records);
  const todayDateString = new Date().toISOString().split('T')[0];
  const todaysRecords = records[todayDateString] || [];

  const togglePrayerCompletion = (prayerName: StorePrayerName) => {
    const existing = todaysRecords.find(r => r.prayerName === prayerName);
    if (existing && existing.status === 'Completed') {
      // Un-complete (we can mark it as Missed or remove it, let's just mark it as Missed for now or remove? 
      // The store doesn't have a 'remove' method, so let's mark it as Missed, or just leave it)
      addRecord({
        id: `${todayDateString}-${prayerName}`,
        date: todayDateString,
        prayerName: prayerName,
        status: 'Missed',
        timestamp: Date.now(),
      });
    } else {
      // Mark as completed
      addRecord({
        id: `${todayDateString}-${prayerName}`,
        date: todayDateString,
        prayerName: prayerName,
        status: 'Completed',
        timestamp: Date.now(),
      });
    }
  };

  const isCompleted = (prayerName: string) => {
    return todaysRecords.some(r => r.prayerName === prayerName && (r.status === 'Completed' || r.status === 'Jamath' || r.status === 'Individual'));
  };

  const getMissedTodayCount = () => {
    if (!prayerTimes) return 0;
    const now = new Date();
    let missed = 0;
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha },
    ];
    
    prayers.forEach(p => {
      if (p.time < now) {
        // Time has passed. Did they complete it?
        const record = todaysRecords.find(r => r.prayerName === p.name);
        if (!record || record.status === 'Missed' || record.status === 'Qaza') {
          missed++;
        }
      }
    });
    return missed;
  };

  const missedTodayCount = getMissedTodayCount();

  const getHijriDate = () => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
    } catch (e) {
      return '14 Muharram 1446 AH';
    }
  };

  const locationLat = useAppStore(state => state.locationLat);
  const locationLng = useAppStore(state => state.locationLng);
  const locationName = useAppStore(state => state.locationName);
  const setLocation = useAppStore(state => state.setLocation);

  useEffect(() => {
    (async () => {
      let lat = locationLat ?? 24.7136; // Default Riyadh
      let lng = locationLng ?? 46.6753;
      let locName = null;

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
            
            // Do not block rendering for reverse geocode
            Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }).then(geocode => {
              if (geocode && geocode.length > 0) {
                const g = geocode[0];
                locName = [g.city, g.subregion, g.region, g.country].filter(Boolean).join(', ') || 'Unknown Location';
                setLocation(lat, lng, locName);
              }
            }).catch(e => console.log('Geocode error', e));
          }
        } catch (error) {
          console.log('Error getting location, using default', error);
        }
      }
      
      const times = getPrayerTimesForDate(new Date(), lat, lng);
      setPrayerTimes(times);

      // Pre-calculate immediately so the first render is fully prepared
      const now = new Date();
      const next = getNextPrayer(times, now);
      setNextPrayer(next);
      setTimeLeft(formatCountdown(next.time, now));

      // Small skeleton transition delay
      setTimeout(() => {
        setLoading(false);
      }, 150);
    })();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    
    let tz = 'Asia/Riyadh';
    try {
      if (locationLat && locationLng) {
        tz = tz_lookup(locationLat, locationLng);
      }
    } catch (e) {
      console.log('TZ error', e);
    }

    const updateTime = () => {
      const now = new Date();
      const next = getNextPrayer(prayerTimes, now);
      setNextPrayer(next);
      setTimeLeft(formatCountdown(next.time, now));
      
      try {
        setLocalTime(now.toLocaleTimeString('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
        }));
      } catch (e) {
        setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, locationLat, locationLng]);

  const now = new Date();
  const prayers = prayerTimes ? [
    { name: 'Fajr', time: formatTime(prayerTimes.fajr), icon: Moon, current: nextPrayer?.name === 'Fajr', isFuture: prayerTimes.fajr > now },
    { name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), icon: Sun, current: nextPrayer?.name === 'Dhuhr', isFuture: prayerTimes.dhuhr > now },
    { name: 'Asr', time: formatTime(prayerTimes.asr), icon: Sun, current: nextPrayer?.name === 'Asr', isFuture: prayerTimes.asr > now },
    { name: 'Maghrib', time: formatTime(prayerTimes.maghrib), icon: Sunrise, current: nextPrayer?.name === 'Maghrib', isFuture: prayerTimes.maghrib > now },
    { name: 'Isha', time: formatTime(prayerTimes.isha), icon: Moon, current: nextPrayer?.name === 'Isha', isFuture: prayerTimes.isha > now },
  ] : [];

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <GradientBackground>
      <SideMenuModal visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuOpen(true)}>
            <Menu color={colors.accent} size={24} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>سُجُود</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell color={colors.accent} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Location & Local Time Banner */}
          <View style={styles.locationBanner}>
            <MapPin color={colors.textSecondary} size={16} />
            <Text style={styles.locationBannerText} numberOfLines={1}>
              {locationName || 'Unknown Location'}
            </Text>
            <View style={styles.locationBannerDot} />
            <Text style={styles.locationBannerTime}>{localTime}</Text>
          </View>

          {/* Next Prayer Card */}
          <GlassCard style={styles.nextPrayerCard} intensity="dark">
            <View style={styles.nextPrayerHeader}>
              <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
              <Sun color={colors.accent} size={20} />
            </View>
            <View style={styles.nextPrayerTimeRow}>
              <Text style={styles.nextPrayerName}>{nextPrayer ? nextPrayer.name : '...'}</Text>
              <Text style={styles.nextPrayerTime}>{nextPrayer ? formatTime(nextPrayer.time) : '...'}</Text>
            </View>
            <Text style={styles.nextPrayerCountdown}>{timeLeft} remaining</Text>
          </GlassCard>

          {/* Daily Highlights */}
          <View style={styles.highlightsContainer}>
            <GlassCard style={[styles.highlightCard, { backgroundColor: 'rgba(253,245,230,0.95)' }]} intensity="light">
              <View style={styles.highlightHeader}>
                <Calendar color={colors.primary} size={18} />
                <Text style={[styles.highlightTitle, { color: colors.primary }]}>Hijri Date</Text>
              </View>
              <Text style={[styles.highlightValue, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>{getHijriDate()}</Text>
              <Text style={[styles.highlightSub, { color: colors.primary }]}>Islamic Calendar</Text>
            </GlassCard>

            <GlassCard style={[styles.highlightCard, missedTodayCount > 0 && styles.highlightCardWarning]} intensity="dark">
              <View style={styles.highlightHeader}>
                <AlertCircle color={missedTodayCount > 0 ? '#FFA500' : colors.textSecondary} size={18} />
                <Text style={[styles.highlightTitle, missedTodayCount > 0 && { color: '#FFA500' }]}>Missed Today</Text>
              </View>
              <Text style={styles.highlightValue}>{missedTodayCount}</Text>
              <Text style={styles.highlightSub}>Prayers</Text>
            </GlassCard>
          </View>

          {/* Today's Prayer Times */}
          <GlassCard style={styles.todaysPrayersCard} intensity="dark">
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            <View style={styles.prayersRow}>
              {prayers.map((prayer) => (
                <TouchableOpacity 
                  key={prayer.name} 
                  style={styles.prayerItem}
                  onPress={() => togglePrayerCompletion(prayer.name as StorePrayerName)}
                  disabled={prayer.isFuture}
                  activeOpacity={0.7}
                >
                  <View style={[styles.prayerIconWrapper, prayer.current && styles.prayerIconWrapperActive]}>
                    <prayer.icon 
                      color={prayer.current ? colors.highlight : colors.accent} 
                      size={28} 
                      style={styles.prayerIcon}
                    />
                  </View>
                  <Text style={[styles.prayerItemName, prayer.current && { color: colors.text }]}>
                    {prayer.name}
                  </Text>
                  <Text style={[styles.prayerItemTime, prayer.current && { color: colors.accent }]}>
                    {prayer.time}
                  </Text>
                  <View style={styles.tickBox}>
                    {isCompleted(prayer.name) ? (
                      <View style={styles.checkedCircle}>
                        <CircleCheck color={colors.white} size={20} />
                      </View>
                    ) : (
                      <Circle color={colors.textSecondary} size={20} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Qibla Finder Banner */}
          <TouchableOpacity onPress={() => navigation.navigate('Qibla')} activeOpacity={0.9} style={{ marginBottom: 30 }}>
            <View style={{ borderRadius: 20, overflow: 'hidden', height: 140 }}>
              <ImageBackground 
                source={require('../../assets/kaaba_banner.png')} 
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}
                resizeMode="cover"
              >
                <View style={{ flex: 1, zIndex: 2 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, fontSize: 22, color: '#FFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}>Qibla Finder</Text>
                  <Text style={{ fontFamily: typography.fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 }}>Find the direction to Mecca</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(212,175,55,0.8)', padding: 10, borderRadius: 24, zIndex: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 4 }}>
                  <Compass color="#FFF" size={24} />
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          {/* This Month Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month Overview</Text>
            <GlassCard style={styles.overviewCard} intensity="dark">
              <View style={styles.overviewLeft}>
                <CircularProgress percentage={85} radius={45} strokeWidth={6} color={colors.accent} />
                <View style={styles.overviewLeftTextContainer}>
                  <Text style={styles.overviewLabelText}>Prayers</Text>
                  <Text style={styles.overviewLabelText}>Completed</Text>
                </View>
              </View>
              <View style={styles.overviewRight}>
                <View style={styles.overviewStatBox}>
                  <Text style={styles.overviewStatLabel}>Total Prayers</Text>
                  <Text style={styles.overviewStatValue}>124/150</Text>
                </View>
                <View style={styles.overviewStatBox}>
                  <Text style={styles.overviewStatLabel}>Missed (Qaza)</Text>
                  <Text style={styles.overviewStatValue}>26</Text>
                </View>
              </View>
            </GlassCard>
          </View>

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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoText: {
    fontFamily: typography.fonts.primary,
    fontSize: 28,
    color: colors.text,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  iconButton: {
    padding: 4,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 8,
  },
  locationBannerText: {
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
    maxWidth: '50%',
  },
  locationBannerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  locationBannerTime: {
    fontFamily: typography.fonts.bold,
    color: colors.text,
    fontSize: 14,
  },
  nextPrayerCard: {
    backgroundColor: '#0F3819',
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 0,
  },
  nextPrayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextPrayerLabel: {
    fontFamily: typography.fonts.medium,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  nextPrayerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  nextPrayerName: {
    fontFamily: typography.fonts.primary,
    color: colors.text,
    fontSize: typography.sizes.display,
  },
  nextPrayerTime: {
    fontFamily: typography.fonts.medium,
    color: colors.text,
    fontSize: typography.sizes.xl,
  },
  nextPrayerCountdown: {
    fontFamily: typography.fonts.regular,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#0F3819',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0,
  },
  highlightCardWarning: {
    backgroundColor: '#2D1A05', // Solid dark amber to prevent Android shadow bleed
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  highlightTitle: {
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    fontSize: 12,
  },
  highlightValue: {
    fontFamily: typography.fonts.medium,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  highlightSub: {
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    fontSize: 11,
  },
  todaysPrayersCard: {
    backgroundColor: '#0F3819',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 0,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 20,
  },
  prayersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerItem: {
    alignItems: 'center',
  },
  prayerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerIconWrapperActive: {
    backgroundColor: '#1E7A3A40',
    borderWidth: 2,
    borderColor: '#8DD13A',
  },
  prayerIcon: {
    // marginBottom: 8,
  },
  prayerItemName: {
    fontFamily: typography.fonts.medium,
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  prayerItemTime: {
    fontFamily: typography.fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  tickBox: {
    marginTop: 4,
  },
  checkedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A1C0E',
    borderWidth: 0,
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overviewLeftTextContainer: {
    justifyContent: 'center',
  },
  overviewLabelText: {
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  overviewRight: {
    gap: 16,
  },
  overviewStatBox: {
    alignItems: 'flex-start',
  },
  overviewStatLabel: {
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  overviewStatValue: {
    fontFamily: typography.fonts.medium,
    color: colors.text,
    fontSize: typography.sizes.lg,
  },
});
