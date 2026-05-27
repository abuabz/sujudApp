import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { X, Home, Settings, Info, Share2, LogOut } from 'lucide-react-native';
import { colors, typography } from '../../theme';
import { GlassCard } from './GlassCard';

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const SideMenuModal = ({ visible, onClose }: SideMenuModalProps) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;

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
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <GlassCard style={styles.glassContainer} intensity="dark">
            <View style={styles.header}>
              <Text style={styles.logoText}>سُجُود</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Home color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Settings color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Share2 color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>Share App</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Info color={colors.accent} size={22} />
                <Text style={styles.menuItemText}>About Sujud</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={onClose}>
                <LogOut color={colors.error} size={20} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: 'rgba(11, 31, 18, 0.95)', 
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
  footer: {
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  logoutText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.error,
  },
});
