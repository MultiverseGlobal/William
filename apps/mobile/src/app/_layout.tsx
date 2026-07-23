import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep native splash screen visible while loading onboarding state
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const onboarded = await AsyncStorage.getItem('william_onboarded');
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});

        if (onboarded !== 'true') {
          setTimeout(() => {
            router.replace('/onboarding');
          }, 50);
        }
      } catch (err) {
        console.log('Layout prepare error:', err);
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  if (!isReady) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 220,
        contentStyle: { backgroundColor: '#ECEEF2' },
      }}
    />
  );
}

