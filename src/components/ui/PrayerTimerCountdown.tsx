import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';
import { Clock } from 'lucide-react-native';

interface PrayerTimerCountdownProps {
  targetDate: Date;
  prayerName: string;
}

export function PrayerTimerCountdown({ targetDate, prayerName }: PrayerTimerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock color={colors.highlight} size={20} />
        <Text style={styles.subtitle}>Upcoming Prayer</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.prayerName}>{prayerName}</Text>
        <Text style={styles.countdown}>{timeLeft}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  prayerName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xxxl,
    color: colors.text,
  },
  countdown: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
    color: colors.highlight,
    fontVariant: ['tabular-nums'],
  },
});
