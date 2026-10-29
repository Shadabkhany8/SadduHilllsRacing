import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticsService } from '@/services/HapticsService';

interface TouchControlsProps {
  onAccelerateChange: (isPressed: boolean) => void;
  onBrakeChange: (isPressed: boolean) => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onAccelerateChange,
  onBrakeChange,
  disabled = false,
}) => {
  const [gasPressed, setGasPressed] = useState(false);
  const [brakePressed, setBrakePressed] = useState(false);

  const handleGasStart = () => {
    if (disabled) return;
    setGasPressed(true);
    onAccelerateChange(true);
    HapticsService.light();
  };

  const handleGasEnd = () => {
    setGasPressed(false);
    onAccelerateChange(false);
  };

  const handleBrakeStart = () => {
    if (disabled) return;
    setBrakePressed(true);
    onBrakeChange(true);
    HapticsService.light();
  };

  const handleBrakeEnd = () => {
    setBrakePressed(false);
    onBrakeChange(false);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* LEFT CONTROL: BRAKE / REVERSE PEDAL */}
      <View
        style={styles.touchAreaLeft}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleBrakeStart}
        onResponderRelease={handleBrakeEnd}
        onResponderTerminate={handleBrakeEnd}>
        <View style={[styles.pedal, styles.brakePedal, brakePressed && styles.brakePedalPressed]}>
          <View style={styles.pedalLines}>
            <View style={styles.pedalGripLine} />
            <View style={styles.pedalGripLine} />
            <View style={styles.pedalGripLine} />
          </View>
          <Text style={styles.pedalLabel}>BRAKE</Text>
          <Text style={styles.pedalSubLabel}>&lt; REVERSE</Text>
        </View>
      </View>

      {/* RIGHT CONTROL: ACCELERATE / DRIVE PEDAL */}
      <View
        style={styles.touchAreaRight}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleGasStart}
        onResponderRelease={handleGasEnd}
        onResponderTerminate={handleGasEnd}>
        <View style={[styles.pedal, styles.gasPedal, gasPressed && styles.gasPedalPressed]}>
          <View style={styles.pedalLines}>
            <View style={styles.pedalGripLine} />
            <View style={styles.pedalGripLine} />
            <View style={styles.pedalGripLine} />
          </View>
          <Text style={styles.pedalLabel}>GAS</Text>
          <Text style={styles.pedalSubLabel}>DRIVE &gt;</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10,
  },
  touchAreaLeft: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchAreaRight: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pedal: {
    width: 120,
    height: 90,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pedalLines: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  pedalGripLine: {
    width: 5,
    height: 24,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  brakePedal: {
    backgroundColor: '#D90429',
    borderColor: '#EF233C',
  },
  brakePedalPressed: {
    backgroundColor: '#9B2226',
    borderColor: '#D90429',
    transform: [{ scale: 0.94 }, { translateY: 4 }],
  },
  gasPedal: {
    backgroundColor: '#06D6A0',
    borderColor: '#38B000',
  },
  gasPedalPressed: {
    backgroundColor: '#007200',
    borderColor: '#06D6A0',
    transform: [{ scale: 0.94 }, { translateY: 4 }],
  },
  pedalLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pedalSubLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
