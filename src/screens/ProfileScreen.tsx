import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Settings, Bell, Palette, Clock, Volume2, Edit2, Check, MapPin, Calendar as CalendarIcon, Download, Upload, Trash2 } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassAlert } from '../components/ui/GlassAlert';
import { backupService } from '../services/backupService';
import { useAppStore } from '../store/useAppStore';
import { usePrayerStore } from '../store/usePrayerStore';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notificationsEnabled, notificationSound, userName, userEmail, userAvatar, setProfile, locationName } = useAppStore();
  const setNotificationsEnabled = useAppStore(state => state.setNotificationsEnabled);
  const setNotificationSound = useAppStore(state => state.setNotificationSound);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showWipeAlert, setShowWipeAlert] = useState(false);

  const resetApp = useAppStore(state => state.resetApp);
  const clearAllRecords = usePrayerStore(state => state.clearAllRecords);

  const executeWipeData = () => {
    setShowWipeAlert(false);
    clearAllRecords();
    resetApp();
  };

  const appStartDate = useAppStore(state => state.appStartDate);
  const setAppStartDate = useAppStore(state => state.setAppStartDate);
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  // Track date object for the picker
  const [tempDateObj, setTempDateObj] = useState(new Date(appStartDate));

  const handleAutoDetectLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      let locName = "Unknown Location";
      if (geocode && geocode.length > 0) {
        const g = geocode[0];
        locName = [g.city, g.subregion, g.region, g.country].filter(Boolean).join(', ') || locName;
      }
      
      setProfile(userName, userEmail, userAvatar); // update generic profile if needed
      useAppStore.getState().setLocation(lat, lng, locName);
      setIsEditingLocation(false);
    } catch (error) {
      alert('Error detecting location.');
    }
    setIsLocating(false);
  };

  const handleOpenMap = () => {
    setIsEditingLocation(false);
    navigation.navigate('Map');
  };

  const toggleEdit = () => {
    if (isEditing) {
      setProfile(editName, editEmail, userAvatar);
    }
    setIsEditing(!isEditing);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfile(userName, userEmail, result.assets[0].uri);
    }
  };

  const normalSoundPlayer = useAudioPlayer(require('../../assets/normaltune.wav'));
  const bankSoundPlayer = useAudioPlayer(require('../../assets/allah_ho_akbar_4969.mp3'));

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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "سُجُود | Sound Test",
        body: `Time for your prayer reminder! Active sound alert: ${notificationSound === 'normal' ? 'Normal Tune' : 'Azaan Sound'}.`,
        sound: notificationSound === 'normal' ? 'normaltune.wav' : 'allah_ho_akbar_4969.mp3', // Kept for iOS
        categoryId: 'prayer_alert',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: notificationSound === 'normal' ? 'normal' : 'azaan_custom_1',
      },
      identifier: 'test_notification',
    });

    alert("Native Push Notification scheduled for 5 seconds from now! You can close the app or go to home screen to see it.");
  };

  const SettingRow = ({ icon: Icon, title, subtitle, rightElement, onPress }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
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
            <TouchableOpacity style={styles.avatarCircle} onPress={pickImage}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              ) : (
                <Image source={require('../../assets/icon.png')} style={styles.avatarImage} />
              )}
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              {isEditing ? (
                <>
                  <TextInput 
                    style={styles.nameInput} 
                    value={editName} 
                    onChangeText={setEditName} 
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput 
                    style={styles.emailInput} 
                    value={editEmail} 
                    onChangeText={setEditEmail} 
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.name}>{userName}</Text>
                  <Text style={styles.memberText}>{userEmail}</Text>
                </>
              )}
            </View>
            <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
              {isEditing ? <Check color={colors.accent} size={20} /> : <Edit2 color={colors.textSecondary} size={20} />}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <GlassCard intensity="dark" style={styles.settingsCard}>
              <SettingRow 
                icon={CalendarIcon} 
                title="Tracking Started" 
                subtitle={appStartDate}
                onPress={() => {
                  setTempDateObj(new Date(appStartDate));
                  setIsEditingDate(true);
                }}
              />
              <SettingRow 
                icon={MapPin} 
                title="Location" 
                subtitle={locationName || "Unknown Location"}
                onPress={() => setIsEditingLocation(true)}
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

            {/* Data & Recovery */}
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Data & Recovery</Text>
            <GlassCard style={styles.settingsCard} intensity="dark">
              
              <TouchableOpacity style={styles.backupButton} onPress={backupService.exportBackup}>
                <Download color={colors.accent} size={20} />
                <Text style={styles.backupButtonText}>Backup Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.backupButton} onPress={backupService.importBackup}>
                <Upload color={colors.accent} size={20} />
                <Text style={styles.backupButtonText}>Restore Data</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.recoveryButton} onPress={() => setShowWipeAlert(true)}>
                <Trash2 color={colors.danger} size={20} />
                <Text style={styles.recoveryButtonText}>Wipe Data & Restart App</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>

        </ScrollView>

        {/* Location Options Modal */}
        <Modal transparent visible={isEditingLocation} animationType="fade" onRequestClose={() => setIsEditingLocation(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Location</Text>
              
              <TouchableOpacity style={styles.modalButton} onPress={handleAutoDetectLocation} disabled={isLocating}>
                {isLocating ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <MapPin color={colors.background} size={20} />
                    <Text style={styles.modalButtonText}>Auto-Detect Location</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsEditingLocation(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Native Date Picker */}
        {isEditingDate && (
          <DateTimePicker
            value={tempDateObj}
            mode="date"
            display="default"
            themeVariant="dark"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              // On Android, onChange is called even if they dismiss/cancel (event.type === 'dismissed' or 'set')
              setIsEditingDate(false);
              
              if (event.type === 'set' && selectedDate) {
                setTempDateObj(selectedDate);
                const dateString = selectedDate.toISOString().split('T')[0];
                setAppStartDate(dateString);
              }
            }}
          />
        )}

        {/* Custom Glass Alert for Wipe Data */}
        <GlassAlert 
          visible={showWipeAlert}
          title="Wipe Data & Restart"
          message="Are you absolutely sure you want to delete all prayer logs, reset all settings, and restart the setup process? This cannot be undone."
          cancelText="Cancel"
          confirmText="Wipe Data"
          isDestructive={true}
          onCancel={() => setShowWipeAlert(false)}
          onConfirm={executeWipeData}
        />
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
  nameInput: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xl,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 2,
    marginBottom: 4,
    minWidth: 150,
  },
  emailInput: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
    paddingVertical: 2,
    minWidth: 150,
  },
  editButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  locationInput: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    minWidth: 200,
    paddingVertical: 2,
  },
  locationCheckBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0F3819',
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 15,
    color: colors.background,
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  modalButtonTextSecondary: {
    fontFamily: typography.fonts.medium,
    fontSize: 15,
    color: colors.accent,
  },
  modalCancel: {
    marginTop: 8,
    padding: 8,
  },
  modalCancelText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  recoveryButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.danger}15`, // Put a slightly red danger tint for wipe
    borderRadius: 12,
    gap: 8,
  },
  recoveryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.danger,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  backupButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
    marginBottom: 16,
  }
});
