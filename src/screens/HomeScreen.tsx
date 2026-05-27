import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
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

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');

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

  useEffect(() => {
    (async () => {
      let lat = 24.7136; // Default Riyadh
      let lng = 46.6753;
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        }
      } catch (error) {
        console.log('Error getting location, using default', error);
      }
      
      const times = getPrayerTimesForDate(new Date(), lat, lng);
      setPrayerTimes(times);

      // Pre-calculate immediately so the first render is fully prepared
      const now = new Date();
      const next = getNextPrayer(times, now);
      setNextPrayer(next);
      setTimeLeft(formatCountdown(next.time, now));

      // 800ms smooth skeleton transition delay
      setTimeout(() => {
        setLoading(false);
      }, 800);
    })();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const now = new Date();
      const next = getNextPrayer(prayerTimes, now);
      setNextPrayer(next);
      setTimeLeft(formatCountdown(next.time, now));
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const prayers = prayerTimes ? [
    { name: 'Fajr', time: formatTime(prayerTimes.fajr), icon: Moon, current: nextPrayer?.name === 'Fajr' },
    { name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), icon: Sun, current: nextPrayer?.name === 'Dhuhr' },
    { name: 'Asr', time: formatTime(prayerTimes.asr), icon: Sun, current: nextPrayer?.name === 'Asr' },
    { name: 'Maghrib', time: formatTime(prayerTimes.maghrib), icon: Sunrise, current: nextPrayer?.name === 'Maghrib' },
    { name: 'Isha', time: formatTime(prayerTimes.isha), icon: Moon, current: nextPrayer?.name === 'Isha' },
  ] : [];

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Menu color={colors.accent} size={24} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>سُجُود</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color={colors.accent} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
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

          {/* Today's Prayer Times */}
          <GlassCard style={styles.todaysPrayersCard} intensity="dark">
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            <View style={styles.prayersRow}>
              {prayers.map((prayer) => (
                <View key={prayer.name} style={styles.prayerItem}>
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
                  <TouchableOpacity 
                    style={styles.tickBox} 
                    onPress={() => togglePrayerCompletion(prayer.name as StorePrayerName)}
                  >
                    {isCompleted(prayer.name) ? (
                      <View style={styles.checkedCircle}>
                        <CircleCheck color={colors.white} size={20} />
                      </View>
                    ) : (
                      <Circle color={colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </GlassCard>

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
