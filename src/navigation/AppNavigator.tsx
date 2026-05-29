import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Clock, BookOpen, ChartBar, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import TimesScreen from '../screens/TimesScreen';
import QuranScreen from '../screens/QuranScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QazaManagerScreen from '../screens/QazaManagerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MapScreen from '../screens/MapScreen';
import QiblaScreen from '../screens/QiblaScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme';
import { schedulePrayerNotifications } from '../services/notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Empty dummy component for unimplemented screens
const DummyScreen = () => null;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.card,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Times" 
        component={TimesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Quran" 
        component={QuranScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ChartBar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isFirstLaunch } = useAppStore();

  React.useEffect(() => {
    const unsub = useAppStore.subscribe((state, prevState) => {
      if (
        state.notificationsEnabled !== prevState.notificationsEnabled ||
        state.notificationSound !== prevState.notificationSound ||
        state.locationLat !== prevState.locationLat
      ) {
        schedulePrayerNotifications().catch(e => console.log('Failed to reschedule:', e));
      }
    });
    return () => unsub();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {isFirstLaunch ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="QazaTracker" component={QazaManagerScreen} />
            <Stack.Screen name="PrayerAnalytics" component={AnalyticsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Qibla" component={QiblaScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
