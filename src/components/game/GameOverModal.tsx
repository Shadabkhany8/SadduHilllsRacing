import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameRunStats } from '@/types/game';
import { SaveGameService } from '@/services/SaveGameService';

interface GameOverModalProps {
  visible: boolean;
  stats: GameRunStats;
  isNewRecord: boolean;
  reason: string;
  onRestart: () => void;
  onGarage: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  stats,
  isNewRecord,
  reason,
  onRestart,
  onGarage,
  onMenu,
}) => {
  const totalCoins = SaveGameService.get().totalCoins;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Title */}
          <Text style={styles.reasonText}>{reason.toUpperCase()}</Text>
          <Text style={styles.title}>RUN COMPLETE</Text>

          {/* New Record Banner */}
          {isNewRecord && (
            <View style={styles.recordBanner}>
              <Text style={styles.recordBannerText}>🏆 NEW BEST DISTANCE! 🏆</Text>
            </View>
          )}

          {/* Run Statistics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.distanceValue}>{stats.distanceMeters}m</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>COINS EARNED</Text>
              <Text style={styles.coinsValue}>+{stats.coinsEarned}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TOP SPEED</Text>
              <Text style={styles.speedValue}>{stats.topSpeedKmh} km/h</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TOTAL COINS</Text>
              <Text style={styles.totalCoinsValue}>★ {totalCoins}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsGroup}>
            <TouchableOpacity style={[styles.btn, styles.restartBtn]} onPress={onRestart}>
              <Text style={styles.btnText}>PLAY AGAIN</Text>
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={[styles.btn, styles.garageBtn]} onPress={onGarage}>
                <Text style={styles.btnTextSecondary}>GARAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.menuBtn]} onPress={onMenu}>
                <Text style={styles.btnTextSecondary}>MAIN MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  reasonText: {
    color: '#EF233C',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  recordBanner: {
    backgroundColor: '#FFB703',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  recordBannerText: {
    color: '#023047',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  distanceValue: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '900',
  },
  coinsValue: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
  },
  speedValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  totalCoinsValue: {
    color: '#06D6A0',
    fontSize: 18,
    fontWeight: '900',
  },
  buttonsGroup: {
    width: '100%',
    gap: 12,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  restartBtn: {
    backgroundColor: '#06D6A0',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  garageBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  menuBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnTextSecondary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
