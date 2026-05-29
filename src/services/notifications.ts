import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store/useAppStore';
import { getPrayerTimesForDate } from './prayerTimes';

export async function schedulePrayerNotifications() {
  // 1. Cancel all previously scheduled notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const state = useAppStore.getState();
  if (!state.notificationsEnabled || !state.locationLat || !state.locationLng) {
    return;
  }

  const { locationLat, locationLng, notificationSound } = state;
  const channelId = notificationSound === 'normal' ? 'normal' : 'azaan_custom_1';

  // 2. Schedule for the next 7 days
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + i);
    
    const times = getPrayerTimesForDate(targetDate, locationLat, locationLng);
    
    const prayers = [
      { name: 'Fajr', date: times.fajr },
      { name: 'Dhuhr', date: times.dhuhr },
      { name: 'Asr', date: times.asr },
      { name: 'Maghrib', date: times.maghrib },
      { name: 'Isha', date: times.isha },
    ];

    for (const prayer of prayers) {
      if (prayer.date > new Date()) {
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
      }
    }
  }
}
