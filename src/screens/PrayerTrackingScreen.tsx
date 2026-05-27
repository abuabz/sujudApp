import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { usePrayerStore, PrayerName, PrayerStatus } from '../store/usePrayerStore';

const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const STATUS_OPTIONS: PrayerStatus[] = ['Completed', 'Jamath', 'Individual', 'Missed', 'Qaza'];

export default function PrayerTrackingScreen() {
  const addRecord = usePrayerStore(state => state.addRecord);
  const getRecordsByDate = usePrayerStore(state => state.getRecordsByDate);
  
  // Use today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = getRecordsByDate(today);

  const handleStatusSelect = (prayerName: PrayerName, status: PrayerStatus) => {
    addRecord({
      id: `${today}-${prayerName}`,
      date: today,
      prayerName,
      status,
      timestamp: Date.now(),
    });
  };

  const getStatusColor = (status: PrayerStatus) => {
    switch (status) {
      case 'Completed':
      case 'Jamath':
        return colors.success;
      case 'Individual':
        return colors.accent;
      case 'Missed':
        return colors.danger;
      case 'Qaza':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Prayer Tracking</Text>
          <Text style={styles.subtitle}>Mark your daily progress</Text>
          
          <View style={styles.cardsContainer}>
            {PRAYERS.map(prayerName => {
              const currentRecord = todayRecords.find(r => r.prayerName === prayerName);
              const currentStatus = currentRecord?.status;

              return (
                <GlassCard key={prayerName} style={styles.prayerCard}>
                  <View style={styles.prayerHeader}>
                    <Text style={styles.prayerTitle}>{prayerName}</Text>
                    {currentStatus && (
                      <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
                        {currentStatus}
                      </Text>
                    )}
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusOptions}>
                    {STATUS_OPTIONS.map(status => {
                      const isActive = currentStatus === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            isActive && { backgroundColor: getStatusColor(status), borderColor: getStatusColor(status) }
                          ]}
                          onPress={() => handleStatusSelect(prayerName, status)}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            isActive && { color: colors.background }
                          ]}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </GlassCard>
              );
            })}
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
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xxxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  cardsContainer: {
    gap: 16,
  },
  prayerCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: colors.text,
  },
  statusText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
  },
  statusOptions: {
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: `${colors.textSecondary}50`,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  statusButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
