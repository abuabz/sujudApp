import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { usePrayerStore } from '../store/usePrayerStore';

export default function QazaManagerScreen() {
  const qazaCount = usePrayerStore(state => state.getQazaCount());

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Qaza Manager</Text>
          <Text style={styles.subtitle}>Track and fulfill your missed prayers</Text>
          
          <GlassCard style={styles.summaryCard} intensity="dark">
            <Text style={styles.summaryTitle}>Total Pending</Text>
            <Text style={styles.summaryCount}>{qazaCount}</Text>
            <Text style={styles.summarySubtitle}>Prayers to make up</Text>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            {qazaCount === 0 ? (
              <GlassCard intensity="light" style={styles.emptyState}>
                <Text style={styles.emptyText}>Alhamdulillah! You have no pending qaza prayers.</Text>
              </GlassCard>
            ) : (
              <GlassCard intensity="light">
                <Text style={styles.emptyText}>Feature coming soon: View specific missed prayers by date and mark them as completed.</Text>
              </GlassCard>
            )}
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
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 30,
  },
  summaryTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  summaryCount: {
    fontFamily: typography.fonts.bold,
    fontSize: 72,
    color: colors.warning,
    marginBottom: 10,
  },
  summarySubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: 15,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
