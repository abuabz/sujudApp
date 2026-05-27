import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../../theme';
import { GradientBackground } from './GradientBackground';
import { Skeleton } from './Skeleton';

export function HomeSkeleton() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={100} height={32} borderRadius={8} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} scrollEnabled={false}>
          {/* Next Prayer Card Skeleton */}
          <Skeleton height={140} borderRadius={24} style={styles.nextPrayerCard} />

          {/* Today's Prayers Card Skeleton */}
          <View style={styles.todaysPrayersCard}>
            <Skeleton width={160} height={20} borderRadius={4} style={styles.sectionTitle} />
            <View style={styles.prayersRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.prayerItem}>
                  <Skeleton width={48} height={48} borderRadius={24} style={styles.prayerIcon} />
                  <Skeleton width={40} height={14} borderRadius={4} style={styles.prayerText} />
                  <Skeleton width={32} height={12} borderRadius={4} style={styles.prayerText} />
                  <Skeleton width={20} height={20} borderRadius={10} style={styles.tickBox} />
                </View>
              ))}
            </View>
          </View>

          {/* This Month Overview Skeleton */}
          <View style={styles.section}>
            <Skeleton width={150} height={20} borderRadius={4} style={styles.sectionTitle} />
            <View style={styles.overviewCard}>
              <View style={styles.overviewLeft}>
                <Skeleton width={90} height={90} borderRadius={45} />
                <View style={styles.overviewLeftTextContainer}>
                  <Skeleton width={50} height={12} borderRadius={4} style={styles.overviewText} />
                  <Skeleton width={70} height={12} borderRadius={4} style={styles.overviewText} />
                </View>
              </View>
              <View style={styles.overviewRight}>
                <View style={styles.overviewStatBox}>
                  <Skeleton width={80} height={12} borderRadius={4} style={styles.overviewText} />
                  <Skeleton width={60} height={20} borderRadius={4} style={styles.overviewText} />
                </View>
                <View style={styles.overviewStatBox}>
                  <Skeleton width={85} height={12} borderRadius={4} style={styles.overviewText} />
                  <Skeleton width={40} height={20} borderRadius={4} style={styles.overviewText} />
                </View>
              </View>
            </View>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextPrayerCard: {
    marginBottom: 30,
    backgroundColor: `${colors.card}4D`,
  },
  todaysPrayersCard: {
    backgroundColor: `${colors.card}4D`,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.highlight}10`,
    marginBottom: 30,
  },
  sectionTitle: {
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
  prayerIcon: {
    marginBottom: 8,
  },
  prayerText: {
    marginBottom: 6,
  },
  tickBox: {
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${colors.highlight}10`,
    backgroundColor: `${colors.card}33`,
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overviewLeftTextContainer: {
    justifyContent: 'center',
    gap: 6,
  },
  overviewRight: {
    gap: 16,
  },
  overviewStatBox: {
    alignItems: 'flex-start',
    gap: 4,
  },
  overviewText: {
    marginVertical: 1,
  },
});
