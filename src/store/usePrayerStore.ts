import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from './useAppStore';
import { getPrayerTimesForDate } from '../services/prayerTimes';

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
  removeRecord: (id: string) => void;
  clearAllRecords: () => void;
  restoreState: (records: Record<string, PrayerRecord[]>) => void;
  getRecordsByDate: (date: string) => PrayerRecord[];
  getQazaCount: () => number;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      records: {},
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
      removeRecord: (id) =>
        set((state) => {
          const date = id.split('_')[0]; // Assuming ID format date_prayerName
          const newRecords = { ...state.records };
          if (newRecords[date]) {
            newRecords[date] = newRecords[date].filter((r) => r.id !== id);
            if (newRecords[date].length === 0) {
              delete newRecords[date];
            }
          }
          return { records: newRecords };
        }),
      clearAllRecords: () => set({ records: {} }),
      restoreState: (records) => set({ records }),
      getRecordsByDate: (date) => {
        return get().records[date] || [];
      },
      getQazaCount: () => {
        const records = get().records;
        const appState = useAppStore.getState();
        const appStartStr = appState.appStartDate;
        if (!appStartStr) return 0;
        
        const lat = appState.locationLat ?? 24.7136;
        const lng = appState.locationLng ?? 46.6753;

        let missedCount = 0;
        const now = new Date();
        const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        
        let iterDate = new Date(appStartStr);
        const iterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        while (iterDate <= iterEnd) {
          const dateStr = iterDate.toISOString().split('T')[0];
          const isToday = dateStr === now.toISOString().split('T')[0];
          const dayRecords = records[dateStr] || [];

          let times = null;
          if (isToday) {
            times = getPrayerTimesForDate(now, lat, lng);
          }

          prayerNames.forEach(name => {
            const record = dayRecords.find(r => r.prayerName === name);
            
            let isEligible = true;
            if (isToday && times) {
              const prayerTime = times[name.toLowerCase() as keyof typeof times] as Date;
              if (prayerTime && prayerTime > now) {
                isEligible = false;
              }
            }

            if (isEligible) {
              if (record) {
                if (record.status === 'Missed') {
                  missedCount++;
                }
                // If it's Qaza, it means they already made it up, so it's no longer pending Qaza!
              } else {
                missedCount++;
              }
            }
          });
          
          iterDate.setDate(iterDate.getDate() + 1);
        }
        
        return missedCount;
      }
    }),
    {
      name: 'sujud-prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
