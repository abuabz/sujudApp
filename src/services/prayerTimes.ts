import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Qibla } from 'adhan';

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  qiblaDirection: number;
}

export function getPrayerTimesForDate(date: Date, latitude: number, longitude: number): PrayerTimesData {
  const coordinates = new Coordinates(latitude, longitude);
  // Using Muslim World League by default, this could be configurable in the user profile later
  const params = CalculationMethod.MuslimWorldLeague();
  
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);
  
  const qiblaDirection = Qibla(coordinates);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    midnight: sunnahTimes.middleOfTheNight,
    qiblaDirection,
  };
}
