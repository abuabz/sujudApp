import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { usePrayerStore } from '../store/usePrayerStore';

export const backupService = {
  exportBackup: async () => {
    try {
      // 1. Gather all data
      const appState = useAppStore.getState();
      const prayerState = usePrayerStore.getState();
      
      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        appState: {
          userName: appState.userName,
          userEmail: appState.userEmail,
          appStartDate: appState.appStartDate,
          notificationsEnabled: appState.notificationsEnabled,
          notificationSound: appState.notificationSound,
          locationLat: appState.locationLat,
          locationLng: appState.locationLng,
          locationName: appState.locationName,
          isFirstLaunch: appState.isFirstLaunch
        },
        prayerState: {
          records: prayerState.records
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      
      // 2. Create file in document directory
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `sujud-backup-${dateStr}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // 3. Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Sujud Backup',
          UTI: 'public.json'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      Alert.alert('Backup Failed', 'An error occurred while creating the backup.');
    }
  },

  importBackup: async () => {
    try {
      // 1. Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      if (!file.name.endsWith('.json')) {
        Alert.alert('Invalid File', 'Please select a valid Sujud backup (.json) file.');
        return;
      }

      // 2. Read the file
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // 3. Parse and Validate
      const backupData = JSON.parse(fileContent);
      
      if (!backupData.appState || !backupData.prayerState) {
        Alert.alert('Invalid Backup', 'This file does not appear to be a valid Sujud backup.');
        return;
      }

      // 4. Restore State
      useAppStore.getState().restoreState(backupData.appState);
      usePrayerStore.getState().restoreState(backupData.prayerState.records);
      
      Alert.alert(
        'Restore Complete', 
        'Your data has been successfully restored!',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Failed', 'An error occurred while reading the backup file. It might be corrupted.');
    }
  }
};
