import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export default function QuranScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quran</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.display,
    color: colors.primary,
  },
});
