import { PrayerTimesData } from '../services/prayerTimes';

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface NextPrayerResult {
  name: PrayerName;
  time: Date;
  isTomorrow: boolean;
}

export function getNextPrayer(prayerTimes: PrayerTimesData, now: Date): NextPrayerResult {
  if (now < prayerTimes.fajr) return { name: 'Fajr', time: prayerTimes.fajr, isTomorrow: false };
  if (now < prayerTimes.sunrise) return { name: 'Sunrise', time: prayerTimes.sunrise, isTomorrow: false };
  if (now < prayerTimes.dhuhr) return { name: 'Dhuhr', time: prayerTimes.dhuhr, isTomorrow: false };
  if (now < prayerTimes.asr) return { name: 'Asr', time: prayerTimes.asr, isTomorrow: false };
  if (now < prayerTimes.maghrib) return { name: 'Maghrib', time: prayerTimes.maghrib, isTomorrow: false };
  if (now < prayerTimes.isha) return { name: 'Isha', time: prayerTimes.isha, isTomorrow: false };
  
  // If past Isha, next prayer is Fajr tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Ideally we would calculate prayer times for tomorrow here, but for simplicity we'll just add 24 hours to today's Fajr
  const tomorrowFajr = new Date(prayerTimes.fajr.getTime() + 24 * 60 * 60 * 1000);
  
  return { name: 'Fajr', time: tomorrowFajr, isTomorrow: true };
}

export function formatCountdown(targetTime: Date, now: Date): string {
  const diffMs = targetTime.getTime() - now.getTime();
  if (diffMs <= 0) return '00:00:00';
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
