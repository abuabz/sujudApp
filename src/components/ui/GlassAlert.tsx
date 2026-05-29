import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, typography } from '../../theme';
import { GlassCard } from './GlassCard';

interface GlassAlertProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

const { width } = Dimensions.get('window');

export const GlassAlert = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'OK',
  onCancel,
  onConfirm,
  isDestructive = false
}: GlassAlertProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <GlassCard style={styles.alertBox} intensity="dark" blur={true}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, isDestructive && styles.destructiveButton]} 
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, isDestructive && styles.destructiveText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: 22,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.background,
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 60, 60, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 60, 60, 0.5)',
  },
  destructiveText: {
    color: '#FF6B6B',
  },
});
