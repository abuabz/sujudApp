import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Clock, AlertTriangle } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { useNavigation } from '@react-navigation/native';

export default function NotificationsScreen() {
  const navigation = useNavigation();

  // Dummy notifications
  const notifications = [
    { id: 1, title: 'Time for Asr', message: 'It is time to pray Asr in your location.', time: '10m ago', icon: Clock, type: 'info' },
    { id: 2, title: 'Missed Fajr', message: 'You have not marked Fajr as completed today. Do you need to pray Qaza?', time: '5h ago', icon: AlertTriangle, type: 'warning' },
    { id: 3, title: 'Welcome to Sujud', message: 'Jummah Mubarak! Don\'t forget to read Surah Al-Kahf today.', time: '2d ago', icon: Bell, type: 'info' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {notifications.map((notif) => (
            <GlassCard key={notif.id} style={styles.notificationCard} intensity="dark">
              <View style={[styles.iconContainer, notif.type === 'warning' && styles.iconWarning]}>
                <notif.icon color={notif.type === 'warning' ? '#FFA500' : colors.accent} size={20} />
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notif.title}</Text>
                  <Text style={styles.time}>{notif.time}</Text>
                </View>
                <Text style={styles.message}>{notif.message}</Text>
              </View>
            </GlassCard>
          ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  scrollContainer: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#0F3819',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E7A3A40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWarning: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  time: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  message: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
