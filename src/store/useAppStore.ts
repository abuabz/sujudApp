import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  isFirstLaunch: boolean;
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  notificationSound: 'normal' | 'bank';
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  setFirstLaunch: (val: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setNotificationsEnabled: (val: boolean) => void;
  setNotificationSound: (sound: 'normal' | 'bank') => void;
  setLocation: (lat: number, lng: number, name: string | null) => void;
  setProfile: (name: string, email: string, avatar: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      theme: 'dark',
      notificationsEnabled: true,
      notificationSound: 'normal',
      locationLat: null,
      locationLng: null,
      locationName: null,
      userName: 'Ahmed Khan',
      userEmail: 'ahmed@example.com',
      userAvatar: null,
      setFirstLaunch: (val) => set({ isFirstLaunch: val }),
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
      setNotificationSound: (sound) => set({ notificationSound: sound }),
      setLocation: (lat, lng, name) => set({ locationLat: lat, locationLng: lng, locationName: name }),
      setProfile: (name, email, avatar) => set({ userName: name, userEmail: email, userAvatar: avatar }),
    }),
    {
      name: 'sujud-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
