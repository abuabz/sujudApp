import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type PrayerStatus = 'Completed' | 'Missed' | 'Qaza' | 'Jamath' | 'Individual';

export interface PrayerRecord {
  id: string;
  date: string; // YYYY-MM-DD
  prayerName: PrayerName;
  status: PrayerStatus;
  timestamp: number;
}

interface PrayerState {
  records: Record<string, PrayerRecord[]>; // Keyed by YYYY-MM-DD for fast lookup
  addRecord: (record: PrayerRecord) => void;
  getRecordsByDate: (date: string) => PrayerRecord[];
  getQazaCount: () => number;
}

const generateMockRecords = (): Record<string, PrayerRecord[]> => {
  const mock: Record<string, PrayerRecord[]> = {};
  const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  // Generate mock data for the last 6 days
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    mock[dateStr] = prayers.map(prayerName => {
      // Fajr and Isha are occasionally Missed, others are mostly Completed
      let status: PrayerStatus = 'Completed';
      const rand = Math.random();
      if (prayerName === 'Fajr') {
        status = rand > 0.45 ? 'Completed' : 'Missed';
      } else if (prayerName === 'Isha') {
        status = rand > 0.3 ? 'Completed' : 'Missed';
      } else {
        status = rand > 0.15 ? 'Completed' : 'Missed';
      }
      
      return {
        id: `${dateStr}-${prayerName}`,
        date: dateStr,
        prayerName,
        status,
        timestamp: d.getTime(),
      };
    });
  }
  return mock;
};

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      records: generateMockRecords(),
      addRecord: (record) => {
        set((state) => {
          const dateRecords = state.records[record.date] || [];
          // Replace if exists, otherwise add
          const existingIndex = dateRecords.findIndex(r => r.prayerName === record.prayerName);
          const newDateRecords = [...dateRecords];
          if (existingIndex >= 0) {
            newDateRecords[existingIndex] = record;
          } else {
            newDateRecords.push(record);
          }
          return {
            records: {
              ...state.records,
              [record.date]: newDateRecords,
            }
          };
        });
      },
      getRecordsByDate: (date) => {
        return get().records[date] || [];
      },
      getQazaCount: () => {
        const records = get().records;
        let count = 0;
        Object.values(records).forEach(dayRecords => {
          dayRecords.forEach(r => {
            if (r.status === 'Qaza' || r.status === 'Missed') {
              count++;
            }
          });
        });
        return count;
      }
    }),
    {
      name: 'sujud-prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
