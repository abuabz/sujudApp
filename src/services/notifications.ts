import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store/useAppStore';
import { getPrayerTimesForDate } from './prayerTimes';
import { usePrayerStore } from '../store/usePrayerStore';

export async function schedulePrayerNotifications() {
  // 1. Cancel all previously scheduled notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const state = useAppStore.getState();
  if (!state.notificationsEnabled || !state.locationLat || !state.locationLng) {
    return;
  }

  const { locationLat, locationLng, notificationSound } = state;
  const channelId = notificationSound === 'normal' ? 'normal_v2' : 'azaan_custom_2';
  const normalChannelId = 'normal_v2'; // Warnings always use normal tune

  const prayerRecords = usePrayerStore.getState().records;
  
  // Create a flat list of all prayers from yesterday to 7 days from now
  const allPrayers: { name: string, date: Date, dateStr: string }[] = [];
  const today = new Date();
  
  for (let i = -1; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const times = getPrayerTimesForDate(targetDate, locationLat, locationLng);
    
    allPrayers.push({ name: 'Fajr', date: times.fajr, dateStr });
    allPrayers.push({ name: 'Dhuhr', date: times.dhuhr, dateStr });
    allPrayers.push({ name: 'Asr', date: times.asr, dateStr });
    allPrayers.push({ name: 'Maghrib', date: times.maghrib, dateStr });
    allPrayers.push({ name: 'Isha', date: times.isha, dateStr });
  }

  // Schedule notifications
  const now = new Date();
  
  for (let i = 1; i < allPrayers.length; i++) {
    const prayer = allPrayers[i];
    
    // Only schedule if the prayer is in the future
    if (prayer.date > now) {
      // 1. Regular prayer notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "سُجُود | Prayer Time",
          body: `It is time for ${prayer.name} prayer.`,
          categoryId: 'prayer_alert',
          sound: notificationSound === 'normal' ? 'normaltune.wav' : 'allah_ho_akbar_4969.mp3',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayer.date,
          channelId: channelId,
        },
      });

      // 2. Smart Warning logic
      const prevPrayer = allPrayers[i - 1];
      // Only warn if the previous prayer is already in the past
      if (prevPrayer.date < now) {
        const dailyRecords = prayerRecords[prevPrayer.dateStr] || [];
        const record = dailyRecords.find(r => r.prayerName === prevPrayer.name);
        const isCompleted = record && (record.status === 'Completed' || record.status === 'Jamath' || record.status === 'Individual');
        
        if (!isCompleted) {
          // Schedule 10 min warning
          const tenMinBefore = new Date(prayer.date.getTime() - 10 * 60 * 1000);
          if (tenMinBefore > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "سُجُود | Reminder",
                body: `You missed ${prevPrayer.name}! ${prayer.name} is in 10 minutes. Please get ready.`,
                sound: 'normaltune.wav',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: tenMinBefore,
                channelId: normalChannelId,
              },
            });
          }

          // Schedule 5 min warning
          const fiveMinBefore = new Date(prayer.date.getTime() - 5 * 60 * 1000);
          if (fiveMinBefore > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "سُجُود | Urgent Reminder",
                body: `${prayer.name} is in 5 minutes! Don't miss this one too.`,
                sound: 'normaltune.wav',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fiveMinBefore,
                channelId: normalChannelId,
              },
            });
          }
        }
      }
    }
  }
}
