import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { MainMenuScreen } from '@/screens/MainMenuScreen';
import { GameScreen } from '@/screens/GameScreen';
import { GarageScreen } from '@/screens/GarageScreen';
import { UpgradeScreen } from '@/screens/UpgradeScreen';
import { EnvironmentScreen } from '@/screens/EnvironmentScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { SaveGameService } from '@/services/SaveGameService';

type ActiveView = 'menu' | 'game' | 'garage' | 'upgrades' | 'environments' | 'settings';

export default function IndexScreen() {
  const [currentView, setCurrentView] = useState<ActiveView>('menu');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    SaveGameService.load().then(() => {
      setIsLoaded(true);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentView !== 'menu') {
        if (currentView === 'upgrades') {
          setCurrentView('garage');
        } else {
          setCurrentView('menu');
        }
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentView]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06D6A0" />
      </View>
    );
  }

  switch (currentView) {
    case 'game':
      return (
        <GameScreen
          onReturnToMenu={() => setCurrentView('menu')}
          onOpenGarage={() => setCurrentView('garage')}
        />
      );

    case 'garage':
      return (
        <GarageScreen
          onBack={() => setCurrentView('menu')}
          onGoToUpgrades={() => setCurrentView('upgrades')}
        />
      );

    case 'upgrades':
      return <UpgradeScreen onBack={() => setCurrentView('garage')} />;

    case 'environments':
      return <EnvironmentScreen onBack={() => setCurrentView('menu')} />;

    case 'settings':
      return <SettingsScreen onBack={() => setCurrentView('menu')} />;

    case 'menu':
    default:
      return (
        <MainMenuScreen
          onPlay={() => setCurrentView('game')}
          onGarage={() => setCurrentView('garage')}
          onUpgrades={() => setCurrentView('upgrades')}
          onEnvironments={() => setCurrentView('environments')}
          onSettings={() => setCurrentView('settings')}
        />
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
