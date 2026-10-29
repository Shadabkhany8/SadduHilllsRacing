import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SaveGameService } from '@/services/SaveGameService';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SaveGameService.load().finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
          animation: 'fade',
        }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
