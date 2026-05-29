import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Calendar as CalendarIcon, User, MapPin } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/useAppStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

export const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { setProfile, setAppStartDate, setLocation, setFirstLaunch } = useAppStore();

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter your name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      finishSetup();
    }
  };

  const finishSetup = () => {
    setProfile(name, '', null);
    setAppStartDate(dateObj.toISOString().split('T')[0]);
    setFirstLaunch(false);
  };

  const handleAutoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let locationName = 'Unknown Location';
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        locationName = [place.city, place.region, place.country].filter(Boolean).join(', ');
      }

      setLocation(location.coords.latitude, location.coords.longitude, locationName);
      Alert.alert('Success', `Location set to: ${locationName}`);
      finishSetup(); // Instantly finish after setting location
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. You can set it later in settings.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Sujud</Text>
              <Text style={styles.subtitle}>Let's set up your profile.</Text>
            </View>

            {/* Step 1: Name */}
            {step === 1 && (
              <GlassCard style={styles.card} intensity="dark">
                <View style={styles.iconContainer}>
                  <User color={colors.accent} size={32} />
                </View>
                <Text style={styles.cardTitle}>What is your name?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Aboobacker"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </GlassCard>
            )}

            {/* Step 2: Start Date */}
            {step === 2 && (
              <GlassCard style={styles.card} intensity="dark">
                <View style={styles.iconContainer}>
                  <CalendarIcon color={colors.accent} size={32} />
                </View>
                <Text style={styles.cardTitle}>When did you start tracking?</Text>
                <Text style={styles.cardSubtitle}>
                  We will calculate your monthly reports and missed prayers strictly from this date onwards.
                </Text>
                
                <TouchableOpacity 
                  style={styles.dateSelector} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateSelectorText}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display="default"
                    themeVariant="dark"
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setDateObj(selectedDate);
                      }
                    }}
                  />
                )}
              </GlassCard>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <GlassCard style={styles.card} intensity="dark">
                <View style={styles.iconContainer}>
                  <MapPin color={colors.accent} size={32} />
                </View>
                <Text style={styles.cardTitle}>Set your location</Text>
                <Text style={styles.cardSubtitle}>
                  We need your location to accurately calculate your local prayer times.
                </Text>

                <TouchableOpacity 
                  style={styles.autoDetectButton} 
                  onPress={handleAutoDetectLocation}
                  disabled={isLocating}
                >
                  <Text style={styles.autoDetectButtonText}>
                    {isLocating ? 'Detecting...' : 'Auto-Detect Location'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{ marginTop: 20, alignItems: 'center' }} 
                  onPress={finishSetup}
                >
                  <Text style={{ color: colors.textSecondary, fontFamily: typography.fonts.medium }}>Skip for now</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{step === 3 ? 'Finish' : 'Next'}</Text>
              {step !== 3 && <ChevronRight color={colors.background} size={20} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 18,
    color: colors.textSecondary,
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accent}22`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: 22,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    backgroundColor: `${colors.background}88`,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: 18,
    borderWidth: 1,
    borderColor: `${colors.highlight}33`,
  },
  dateSelector: {
    width: '100%',
    backgroundColor: `${colors.background}88`,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${colors.highlight}33`,
    alignItems: 'center',
  },
  dateSelectorText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: 16,
  },
  autoDetectButton: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  autoDetectButtonText: {
    color: colors.background,
    fontFamily: typography.fonts.bold,
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.background,
  },
});
