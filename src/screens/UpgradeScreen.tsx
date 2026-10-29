import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VEHICLES } from '@/constants/vehicles';
import {
  getUpgradeCost,
  MAX_UPGRADE_LEVEL,
  UPGRADE_METADATA,
} from '@/constants/upgrades';
import { UpgradeType, VehicleConfig } from '@/types/game';
import { SaveGameService } from '@/services/SaveGameService';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface UpgradeScreenProps {
  onBack: () => void;
}

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onBack }) => {
  const [saveData, setSaveData] = useState(SaveGameService.get());
  const selectedVehicle: VehicleConfig = VEHICLES[saveData.selectedVehicleId] || VEHICLES.buggy;
  const currentUpgrades = saveData.vehicleUpgrades[selectedVehicle.id] || {
    engine: 1,
    tires: 1,
    suspension: 1,
    fuel: 1,
  };

  const handleUpgrade = async (type: UpgradeType) => {
    AudioService.playButton();
    HapticsService.button();

    const res = await SaveGameService.purchaseUpgrade(selectedVehicle.id, type);
    if (res.success) {
      AudioService.playCoin();
      HapticsService.fuel();
      setSaveData({ ...SaveGameService.get() });
    } else {
      Alert.alert('Cannot Upgrade', res.message);
    }
  };

  const handleBack = () => {
    AudioService.playButton();
    HapticsService.button();
    onBack();
  };

  const upgradeTypes: UpgradeType[] = ['engine', 'tires', 'suspension', 'fuel'];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>UPGRADES</Text>
          <Text style={styles.vehicleSubtitle}>{selectedVehicle.name}</Text>
        </View>

        <View style={styles.coinBadge}>
          <Text style={styles.coinStar}>★</Text>
          <Text style={styles.coinAmount}>{saveData.totalCoins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* UPGRADE CARDS */}
        {upgradeTypes.map((type) => {
          const meta = UPGRADE_METADATA[type];
          const level = currentUpgrades[type] || 1;
          const isMax = level >= MAX_UPGRADE_LEVEL;
          const cost = getUpgradeCost(type, level);
          const canAfford = saveData.totalCoins >= cost;

          return (
            <View key={type} style={styles.upgradeCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleInfo}>
                  <Text style={[styles.upgradeTitle, { color: meta.accentColor }]}>
                    {meta.title.toUpperCase()}
                  </Text>
                  <Text style={styles.upgradeTagline}>{meta.tagline}</Text>
                </View>

                {/* Current Level Badge */}
                <View style={[styles.levelBadge, isMax && styles.maxLevelBadge]}>
                  <Text style={styles.levelBadgeText}>
                    {isMax ? 'MAX LEVEL' : `LV. ${level} / ${MAX_UPGRADE_LEVEL}`}
                  </Text>
                </View>
              </View>

              {/* Level Progress Segments */}
              <View style={styles.progressTrack}>
                {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, idx) => {
                  const filled = idx < level;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.progressSegment,
                        filled && { backgroundColor: meta.accentColor },
                      ]}
                    />
                  );
                })}
              </View>

              <Text style={styles.upgradeDesc}>{meta.description}</Text>

              {/* Purchase Button */}
              {!isMax ? (
                <TouchableOpacity
                  style={[
                    styles.upgradeBtn,
                    canAfford ? styles.upgradeBtnAffordable : styles.upgradeBtnDisabled,
                  ]}
                  onPress={() => handleUpgrade(type)}
                  disabled={!canAfford}>
                  <Text style={styles.upgradeBtnText}>
                    UPGRADE TO LV.{level + 1} • ★ {cost}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.maxedIndicator}>
                  <Text style={styles.maxedText}>✓ MAXIMUM TUNING REACHED</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  vehicleSubtitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD166',
    gap: 6,
  },
  coinStar: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
  },
  coinAmount: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  upgradeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  upgradeTagline: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  maxLevelBadge: {
    borderColor: '#FFD166',
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
  },
  levelBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '900',
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    height: 10,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 3,
  },
  upgradeDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  upgradeBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeBtnAffordable: {
    backgroundColor: '#06D6A0',
  },
  upgradeBtnDisabled: {
    backgroundColor: '#334155',
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  maxedIndicator: {
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06D6A0',
  },
  maxedText: {
    color: '#06D6A0',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
