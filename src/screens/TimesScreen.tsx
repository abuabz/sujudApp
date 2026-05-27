import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { ChevronLeft, Share, Volume2, Sun, Moon, Sunrise, CalendarDays } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getPrayerTimesForDate, PrayerTimesData } from '../services/prayerTimes';
import { getNextPrayer, formatTime, NextPrayerResult } from '../utils/timeUtils';

export default function TimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerResult | null>(null);
  const [locationName, setLocationName] = useState('Riyadh, Saudi Arabia');
  const [dateString, setDateString] = useState('');

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
          
          let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geocode.length > 0) {
            setLocationName(`${geocode[0].city || geocode[0].region}, ${geocode[0].country}`);
          }
        }
      } catch (error) {
        console.log('Error getting location, using default', error);
      }
      
      const times = getPrayerTimesForDate(new Date(), lat, lng);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times, new Date()));

      // Basic date formatting
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      setDateString(new Date().toLocaleDateString('en-GB', options) + ' / 10 Dhul-Qadah 1445'); // Hijri is mock for now
    })();
  }, []);

  const prayers = prayerTimes ? [
    { name: 'Fajr', time: formatTime(prayerTimes.fajr), icon: Moon, current: nextPrayer?.name === 'Fajr' },
    { name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), icon: Sun, current: nextPrayer?.name === 'Dhuhr' },
    { name: 'Asr', time: formatTime(prayerTimes.asr), icon: Sun, current: nextPrayer?.name === 'Asr' },
    { name: 'Maghrib', time: formatTime(prayerTimes.maghrib), icon: Sunrise, current: nextPrayer?.name === 'Maghrib' },
    { name: 'Isha', time: formatTime(prayerTimes.isha), icon: Moon, current: nextPrayer?.name === 'Isha' },
  ] : [];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Share color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{locationName}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>

          <View style={styles.prayersList}>
            {prayers.map((prayer) => (
              <GlassCard 
                key={prayer.name} 
                style={[styles.prayerRow, prayer.current && styles.prayerRowActive]} 
                intensity={prayer.current ? 'medium' : 'light'}
              >
                <View style={styles.prayerRowLeft}>
                  <prayer.icon color={prayer.current ? colors.accent : colors.textSecondary} size={20} />
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                </View>
                <View style={styles.prayerRowRight}>
                  <Text style={styles.prayerTime}>{prayer.time}</Text>
                  <TouchableOpacity>
                    <Volume2 color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>

          <TouchableOpacity style={styles.timetableButton}>
            <Text style={styles.timetableButtonText}>Today's Timetable</Text>
            <CalendarDays color={colors.textSecondary} size={16} />
          </TouchableOpacity>

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
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
    gap: 12,
    marginBottom: 40,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0A1C0E',
    borderWidth: 0,
  },
  prayerRowActive: {
    backgroundColor: '#13351C', // Lighter green for active
    borderWidth: 1,
    borderColor: '#1E7A3A',
  },
  prayerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prayerName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  prayerRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prayerTime: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
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
});
