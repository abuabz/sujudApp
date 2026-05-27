import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';

export default function AnalyticsScreen() {
  const lineData = [
    { value: 50 },
    { value: 65 },
    { value: 60 },
    { value: 80 },
    { value: 85 },
    { value: 90 },
    { value: 100 },
  ];

  const pieData = [
    { value: 75, color: colors.success, text: '75%' },
    { value: 15, color: colors.warning, text: '15%' },
    { value: 10, color: colors.danger, text: '10%' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your prayer consistency insights</Text>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Consistency</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={lineData}
                color={colors.highlight}
                thickness={3}
                dataPointsColor={colors.accent}
                hideRules
                hideYAxisText
                yAxisColor="transparent"
                xAxisColor="transparent"
                height={150}
                initialSpacing={20}
              />
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Breakdown</Text>
            <View style={styles.pieContainer}>
              <PieChart
                data={pieData}
                donut
                innerRadius={60}
                radius={90}
                centerLabelComponent={() => {
                  return <Text style={styles.pieCenterText}>75%</Text>;
                }}
              />
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendText}>Qaza</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={styles.legendText}>Missed</Text>
              </View>
            </View>
          </GlassCard>
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
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: -10,
  },
  pieContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  pieCenterText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
    color: colors.text,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
