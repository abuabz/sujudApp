import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { HomeSkeleton } from './src/components/ui/HomeSkeleton';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Stapel-SemiExpanded': require('./assets/fonts/Stapel_Semi-Expanded-Medium.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
