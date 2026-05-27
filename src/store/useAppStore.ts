import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  isFirstLaunch: boolean;
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  notificationSound: 'normal' | 'bank';
  setFirstLaunch: (val: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setNotificationsEnabled: (val: boolean) => void;
  setNotificationSound: (sound: 'normal' | 'bank') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      theme: 'dark',
      notificationsEnabled: true,
      notificationSound: 'normal',
      setFirstLaunch: (val) => set({ isFirstLaunch: val }),
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
      setNotificationSound: (sound) => set({ notificationSound: sound }),
    }),
    {
      name: 'sujud-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
