import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, Linking, Alert, Pressable } from 'react-native';
import { X, Home, Settings, Info, Globe, Heart } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { colors, typography } from '../../theme';
import { GlassCard } from './GlassCard';

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const SideMenuModal = ({ visible, onClose }: SideMenuModalProps) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showAbout, setShowAbout] = React.useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || url.startsWith('upi://')) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link on your device.");
      }
    } catch (error) {
      Alert.alert("Notice", "No compatible app found to handle this link.");
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.overlay}>
        <Pressable 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} 
          onPress={onClose} 
        />

        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <GlassCard style={styles.glassContainer} intensity="dark" blur={true}>
            <View style={styles.header}>
              <Text style={styles.logoText}>سُجُود</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); navigation.navigate('Home'); }}>
                <Home color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); navigation.navigate('Profile'); }}>
                <Settings color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => setShowAbout(true)}>
                <Info color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>About Sujud</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* About Modal */}
        <Modal transparent visible={showAbout} animationType="fade" onRequestClose={() => setShowAbout(false)}>
          <View style={styles.aboutOverlay}>
            <GlassCard style={styles.aboutContent} intensity="dark" blur={true}>
              <View style={styles.aboutHeader}>
                <Text style={styles.aboutTitle}>About Sujud</Text>
                <TouchableOpacity onPress={() => setShowAbout(false)}>
                  <X color={colors.textSecondary} size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.aboutDetailsRow}>
                <Text style={styles.aboutLabel}>Developer:</Text>
                <Text style={styles.aboutValue}> Muhd Aboobacker P</Text>
              </View>

              <TouchableOpacity
                style={styles.aboutLinkRow}
                onPress={() => handleOpenLink('https://abuparambil.vercel.app')}
              >
                <Globe color={colors.primary} size={18} />
                <Text style={styles.aboutLinkText}>abuparambil</Text>
              </TouchableOpacity>

              <View style={styles.aboutDivider} />

              <Text style={styles.aboutSodhakaText}>Support the project(Sodhaka):</Text>

              <TouchableOpacity
                style={styles.donationButton}
                onPress={() => handleOpenLink('upi://pay?pa=mohamedaboobackerp-2@okicici&pn=Aboobacker&cu=INR')}
              >
                <Heart color={colors.background} size={20} />
                <Text style={styles.donationButtonText}>Donate via GPay / UPI</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuContainer: {
    width: width * 0.75,
    height: '100%',
  },
  glassContainer: {
    flex: 1,
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontFamily: typography.fonts.primary,
    fontSize: 28,
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
    gap: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemText: {
    fontFamily: typography.fonts.medium,
    fontSize: 18,
    color: colors.text,
  },
  aboutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutContent: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  aboutDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  aboutValue: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  aboutLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  aboutLinkText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: `${colors.textSecondary}20`,
    marginBottom: 24,
  },
  aboutSodhakaText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  donationButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.background,
  },
});
