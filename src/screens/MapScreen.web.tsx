import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { colors, typography } from '../theme';

export default function MapScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick Location</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <MapPin color={colors.textSecondary} size={48} />
        <Text style={styles.text}>
          Map selection is not supported on the Web preview.
        </Text>
        <Text style={styles.subtext}>
          Please run this app on an Android Emulator or iOS Simulator to use the interactive map picker, or use the "Auto-Detect Location" option in Settings instead.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  text: {
    fontFamily: typography.fonts.medium,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtext: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
