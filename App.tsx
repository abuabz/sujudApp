import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { HomeSkeleton } from './src/components/ui/HomeSkeleton';
import { schedulePrayerNotifications } from './src/services/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Configure Custom Android Audio Channels
if (Platform.OS === 'android') {
  Notifications.deleteNotificationChannelAsync('normal').catch(() => {});
  Notifications.deleteNotificationChannelAsync('azaan_custom_1').catch(() => {});
  Notifications.deleteNotificationChannelAsync('bank').catch(() => {});

  Notifications.setNotificationChannelAsync('normal_v2', {
    name: 'Normal Sound',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'normaltune',
  });
  
  Notifications.setNotificationChannelAsync('azaan_custom_2', {
    name: 'Azaan Sound',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'allah_ho_akbar_4969',
  });
}

// Setup Interactive Dismiss Button on the Notification
Notifications.setNotificationCategoryAsync('prayer_alert', [
  {
    identifier: 'dismiss',
    buttonTitle: 'Close / Silence',
    options: {
      opensAppToForeground: false,
    },
  }
]);

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Stapel-SemiExpanded': require('./assets/fonts/Stapel_Semi-Expanded-Medium.ttf'),
      });
      setFontsLoaded(true);
      
      // Schedule automated prayer notifications on boot
      schedulePrayerNotifications().catch(e => console.log('Failed to schedule notifications:', e));
    }
    loadFonts();

    // Listen for the "Close / Silence" action to dismiss the notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.actionIdentifier === 'dismiss') {
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
