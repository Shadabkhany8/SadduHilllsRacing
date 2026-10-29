import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameRunStats } from '@/types/game';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface GameHUDProps {
  stats: GameRunStats;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, onPause }) => {
  const fuelPercent = Math.max(0, Math.min(100, (stats.fuelRemaining / stats.maxFuel) * 100));
  const isLowFuel = fuelPercent < 25;

  let fuelColor = '#06D6A0';
  if (fuelPercent < 25) {
    fuelColor = '#EF233C';
  } else if (fuelPercent < 50) {
    fuelColor = '#FFD166';
  }

  const handlePause = () => {
    AudioService.playButton();
    HapticsService.button();
    onPause();
  };

  return (
    <SafeAreaView style={styles.safeContainer} pointerEvents="box-none">
      <View style={styles.headerRow} pointerEvents="box-none">
        {/* LEFT: Distance & Speed Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.distanceValue}>{stats.distanceMeters}m</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SPEED</Text>
            <Text style={styles.speedValue}>{stats.topSpeedKmh} <Text style={styles.unitText}>km/h</Text></Text>
          </View>
        </View>

        {/* CENTER: Fuel Meter Gauge */}
        <View style={[styles.fuelContainer, isLowFuel && styles.fuelContainerAlert]}>
          <View style={styles.fuelHeader}>
            <Text style={[styles.fuelLabel, isLowFuel && styles.fuelLabelAlert]}>
              {isLowFuel ? '⚠️ LOW FUEL' : 'FUEL'}
            </Text>
            <Text style={styles.fuelPercentText}>{Math.round(fuelPercent)}%</Text>
          </View>
          <View style={styles.fuelBarTrack}>
            <View style={[styles.fuelBarFill, { width: `${fuelPercent}%`, backgroundColor: fuelColor }]} />
          </View>
        </View>

        {/* RIGHT: Coins & Pause Button */}
        <View style={styles.rightGroup}>
          <View style={styles.coinBadge}>
            <View style={styles.coinIcon}>
              <Text style={styles.coinIconText}>★</Text>
            </View>
            <Text style={styles.coinText}>{stats.coinsEarned}</Text>
          </View>

          <TouchableOpacity style={styles.pauseButton} onPress={handlePause} activeOpacity={0.8}>
            <Text style={styles.pauseIconText}>❚❚</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  distanceValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  speedValue: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
  },
  unitText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  fuelContainer: {
    flex: 1,
    maxWidth: 240,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fuelContainerAlert: {
    borderColor: '#EF233C',
    backgroundColor: 'rgba(120, 0, 0, 0.88)',
  },
  fuelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fuelLabel: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fuelLabelAlert: {
    color: '#FFD166',
    fontWeight: '900',
  },
  fuelPercentText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  fuelBarTrack: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fuelBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#FFD166',
    gap: 6,
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    color: '#785006',
    fontSize: 12,
    fontWeight: 'bold',
  },
  coinText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  pauseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
  },
});
