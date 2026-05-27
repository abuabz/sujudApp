import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Image } from 'react-native';
import { ChevronRight, Settings, Bell, Palette, Clock, Volume2 } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

export default function ProfileScreen() {
  const notificationsEnabled = useAppStore(state => state.notificationsEnabled);
  const notificationSound = useAppStore(state => state.notificationSound);
  const setNotificationsEnabled = useAppStore(state => state.setNotificationsEnabled);
  const setNotificationSound = useAppStore(state => state.setNotificationSound);

  const normalSoundPlayer = useAudioPlayer(require('../../assets/normaltune.wav'));
  const bankSoundPlayer = useAudioPlayer(require('../../assets/allah-ho-akbar-4969.mp3'));

  const playSound = async (soundType: 'normal' | 'bank') => {
    try {
      await setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      if (soundType === 'normal') {
        bankSoundPlayer.pause();
        normalSoundPlayer.seekTo(0);
        normalSoundPlayer.play();
      } else {
        normalSoundPlayer.pause();
        bankSoundPlayer.seekTo(0);
        bankSoundPlayer.play();
      }
    } catch (error) {
      console.log('Error playing audio via expo-audio, trying web fallback:', error);
      // Robust Fallback to Web browser Audio API
      try {
        const audioPath = soundType === 'normal'
          ? require('../../assets/normaltune.wav')
          : require('../../assets/allah-ho-akbar-4969.mp3');
        const AudioClass = (window as any).Audio || (window as any).webkitAudioContext;
        if (AudioClass) {
          const audio = new AudioClass(audioPath);
          audio.play();
        }
      } catch (webError) {
        console.log('Web audio fallback error:', webError);
      }
    }
  };

  const triggerTestNotification = async () => {
    // 1. Play selected sound preview
    playSound(notificationSound);

    // 2. Trigger native HTML5 Browser Notification if running on Web
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('Notification permission denied');
            return;
          }
        }

        if (Notification.permission === 'granted') {
          const title = "سُجُود | Sujud Alert";
          const options = {
            body: `Time for your prayer reminder! Active sound alert: ${notificationSound === 'normal' ? 'Normal Tune' : 'Bank Sound'}.`,
            icon: 'https://sujudapp.com/logo.png', // Fallback placeholder
          };
          new Notification(title, options);
        }
      } catch (e) {
        console.log('Error triggering browser notification:', e);
      }
    } else {
      // Mobile alert fallback in Expo Go when push hooks aren't fully registered
      alert(`[Sujud Reminder Alert]\nTime for prayer! Playing sound: ${notificationSound === 'normal' ? 'Normal Tune' : 'Bank Sound'}.`);
    }
  };

  const SettingRow = ({ icon: Icon, title, subtitle, rightElement }: any) => (
    <TouchableOpacity style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon color={colors.textSecondary} size={20} />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight color={colors.textSecondary} size={20} />}
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Image source={require('../../assets/icon.png')} style={styles.avatarImage} />
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.name}>Ahmed Khan</Text>
              <Text style={styles.memberText}>Member since May 2024</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <GlassCard intensity="dark" style={styles.settingsCard}>
              <SettingRow 
                icon={Clock} 
                title="Prayer Reminders" 
              />
              <SettingRow 
                icon={Settings} 
                title="Calculation Method" 
                subtitle="Muslim World League"
              />
              
              {/* Interactive Push Notifications Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Bell color={colors.textSecondary} size={20} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>
                      {notificationsEnabled ? 'Reminders enabled' : 'Reminders disabled'}
                    </Text>
                  </View>
                </View>
                <Switch 
                  value={notificationsEnabled} 
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#13351C', true: colors.primary }}
                  thumbColor={notificationsEnabled ? colors.accent : colors.textSecondary}
                />
              </View>

              {/* Dynamic Sound Segment Selector */}
              {notificationsEnabled && (
                <View style={styles.soundSelectorRow}>
                  <Text style={styles.soundLabel}>Reminder Sound</Text>
                  <View style={styles.soundOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.soundOption, 
                        notificationSound === 'normal' && styles.soundOptionActive
                      ]}
                      onPress={() => setNotificationSound('normal')}
                    >
                      <View style={styles.soundOptionContent}>
                        <Text style={[
                          styles.soundOptionText, 
                          notificationSound === 'normal' && styles.soundOptionTextActive
                        ]}>
                          Normal Sound
                        </Text>
                        <TouchableOpacity 
                          style={styles.testSoundButton} 
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent toggling the sound setting
                            playSound('normal');
                          }}
                        >
                          <Volume2 color={notificationSound === 'normal' ? colors.accent : colors.textSecondary} size={16} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.soundOption, 
                        notificationSound === 'bank' && styles.soundOptionActive
                      ]}
                      onPress={() => setNotificationSound('bank')}
                    >
                      <View style={styles.soundOptionContent}>
                        <Text style={[
                          styles.soundOptionText, 
                          notificationSound === 'bank' && styles.soundOptionTextActive
                        ]}>
                          Bank Sound
                        </Text>
                        <TouchableOpacity 
                          style={styles.testSoundButton} 
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent toggling the sound setting
                            playSound('bank');
                          }}
                        >
                          <Volume2 color={notificationSound === 'bank' ? colors.accent : colors.textSecondary} size={16} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Trigger Notification Test Button */}
              {notificationsEnabled && (
                <TouchableOpacity 
                  style={styles.testNotifyButton} 
                  onPress={triggerTestNotification}
                >
                  <Text style={styles.testNotifyButtonText}>Trigger Test Notification</Text>
                  <Bell color={colors.background} size={16} />
                </TouchableOpacity>
              )}

              <SettingRow 
                icon={Palette} 
                title="Theme" 
                subtitle="Dark Green"
              />
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
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.textSecondary}33`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: 4,
  },
  memberText: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#0A1C0E',
    padding: 10,
    paddingVertical: 8,
    borderWidth: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.textSecondary}33`,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    // padding: 8,
  },
  settingTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  settingSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  soundSelectorRow: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.textSecondary}33`,
  },
  soundLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 10,
  },
  soundOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  soundOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: `${colors.card}33`,
    borderWidth: 1,
    borderColor: `${colors.highlight}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundOptionActive: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
  },
  soundOptionText: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  soundOptionTextActive: {
    color: colors.text,
  },
  soundOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  testSoundButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: `${colors.background}88`,
  },
  testNotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 14,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  testNotifyButtonText: {
    fontFamily: typography.fonts.bold,
    fontSize: 13,
    color: colors.background,
  },
});
