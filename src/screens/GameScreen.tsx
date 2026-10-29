import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { GameEngine } from '@/game/GameEngine';
import { GameRenderer } from '@/components/game/GameRenderer';
import { GameHUD } from '@/components/game/GameHUD';
import { TouchControls } from '@/components/game/TouchControls';
import { PauseModal } from '@/components/game/PauseModal';
import { GameOverModal } from '@/components/game/GameOverModal';
import { GameRunStats } from '@/types/game';
import { VEHICLES } from '@/constants/vehicles';
import { ENVIRONMENTS } from '@/constants/environments';
import { SaveGameService } from '@/services/SaveGameService';

interface GameScreenProps {
  onReturnToMenu: () => void;
  onOpenGarage: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onReturnToMenu, onOpenGarage }) => {
  const { width, height } = useWindowDimensions();
  const saveData = SaveGameService.get();

  const vehicleConfig = useMemo(
    () => VEHICLES[saveData.selectedVehicleId] || VEHICLES.buggy,
    [saveData.selectedVehicleId]
  );
  const envConfig = useMemo(
    () => ENVIRONMENTS[saveData.selectedEnvironmentId] || ENVIRONMENTS.green_hills,
    [saveData.selectedEnvironmentId]
  );
  const upgradeLevels = useMemo(
    () =>
      saveData.vehicleUpgrades[vehicleConfig.id] || {
        engine: 1,
        tires: 1,
        suspension: 1,
        fuel: 1,
      },
    [saveData.vehicleUpgrades, vehicleConfig.id]
  );

  const [stats, setStats] = useState<GameRunStats>({
    distanceMeters: 0,
    coinsEarned: 0,
    fuelRemaining: 100,
    maxFuel: 100,
    airTimeSeconds: 0,
    flipsDone: 0,
    topSpeedKmh: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [gameOverData, setGameOverData] = useState<{
    visible: boolean;
    isNewRecord: boolean;
    reason: string;
  }>({
    visible: false,
    isNewRecord: false,
    reason: '',
  });

  // Re-render tick counter for 60fps graphics loop without causing React tree thrashing
  const [, setFrameTick] = useState(0);

  const [engine] = useState(() => {
    return new GameEngine(vehicleConfig, envConfig, upgradeLevels, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        setFrameTick((t) => (t + 1) % 1000);
      },
      onGameOver: (finalStats, isNewRecord, reason) => {
        setStats(finalStats);
        setGameOverData({
          visible: true,
          isNewRecord,
          reason,
        });
      },
    });
  });

  useEffect(() => {
    engine.start();

    return () => {
      engine.destroy();
    };
  }, [engine]);

  const handleAccelerateChange = (isPressed: boolean) => {
    engine.setInputs(isPressed, engine.inputs.brake);
  };

  const handleBrakeChange = (isPressed: boolean) => {
    engine.setInputs(engine.inputs.accelerate, isPressed);
  };

  const handlePause = () => {
    if (!engine.isGameOver) {
      engine.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    engine.resume();
  };

  const handleRestart = () => {
    setIsPaused(false);
    setGameOverData({ visible: false, isNewRecord: false, reason: '' });
    engine.restart();
  };

  return (
    <View style={styles.container}>
      {/* 2D GAME VIEWPORT CANVAS */}
      <GameRenderer engine={engine} width={width} height={height} />

      {/* HEADS-UP DISPLAY (Distance, Fuel, Speed, Coins) */}
      <GameHUD stats={stats} onPause={handlePause} />

      {/* TOUCH CONTROLS (Brake Left, Gas Right) */}
      <TouchControls
        onAccelerateChange={handleAccelerateChange}
        onBrakeChange={handleBrakeChange}
        disabled={isPaused || gameOverData.visible}
      />

      {/* PAUSE MODAL */}
      <PauseModal
        visible={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onMenu={onReturnToMenu}
      />

      {/* GAME OVER MODAL */}
      <GameOverModal
        visible={gameOverData.visible}
        stats={stats}
        isNewRecord={gameOverData.isNewRecord}
        reason={gameOverData.reason}
        onRestart={handleRestart}
        onGarage={onOpenGarage}
        onMenu={onReturnToMenu}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
});
