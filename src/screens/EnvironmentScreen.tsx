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
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ENVIRONMENT_LIST } from '@/constants/environments';
import { EnvironmentId } from '@/types/game';
import { SaveGameService } from '@/services/SaveGameService';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface EnvironmentScreenProps {
  onBack: () => void;
}

export const EnvironmentScreen: React.FC<EnvironmentScreenProps> = ({ onBack }) => {
  const [saveData, setSaveData] = useState(SaveGameService.get());

  const handleSelect = async (id: EnvironmentId) => {
    AudioService.playButton();
    HapticsService.button();
    await SaveGameService.selectEnvironment(id);
    setSaveData({ ...SaveGameService.get() });
  };

  const handleUnlock = async (id: EnvironmentId) => {
    AudioService.playButton();
    HapticsService.button();
    const res = await SaveGameService.purchaseEnvironment(id);
    if (res.success) {
      AudioService.playFuel();
      HapticsService.fuel();
      setSaveData({ ...SaveGameService.get() });
      Alert.alert('Unlocked!', res.message);
    } else {
      Alert.alert('Cannot Unlock', res.message);
    }
  };

  const handleBack = () => {
    AudioService.playButton();
    HapticsService.button();
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ENVIRONMENTS</Text>

        <View style={styles.coinBadge}>
          <Text style={styles.coinStar}>★</Text>
          <Text style={styles.coinAmount}>{saveData.totalCoins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {ENVIRONMENT_LIST.map((env) => {
          const isUnlocked = saveData.unlockedEnvironments.includes(env.id);
          const isSelected = saveData.selectedEnvironmentId === env.id;
          const bestDistance = saveData.bestDistanceByEnv[env.id] || 0;

          return (
            <View key={env.id} style={[styles.envCard, isSelected && styles.envCardSelected]}>
              {/* MINI ENVIRONMENT ART PREVIEW */}
              <View style={styles.previewContainer}>
                <Svg width="100%" height={90}>
                  <Defs>
                    <LinearGradient id={`grad_${env.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={env.skyColors[0]} />
                      <Stop offset="100%" stopColor={env.skyColors[1]} />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height={90} fill={`url(#grad_${env.id})`} />
                  <Circle cx={40} cy={30} r={18} fill={env.sunOrMoon.color} />
                  <Path
                    d={`M -20 65 Q 120 40 220 60 T 450 50 L 450 90 L -20 90 Z`}
                    fill={env.midHillColor}
                    opacity={0.7}
                  />
                  <Path
                    d={`M -20 75 Q 80 50 180 70 T 450 65 L 450 90 L -20 90 Z`}
                    fill={env.terrainSurfaceColor}
                  />
                </Svg>

                {/* Best Distance Tag */}
                <View style={styles.recordBadge}>
                  <Text style={styles.recordText}>RECORD: {bestDistance}m</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardInfo}>
                  <Text style={styles.envName}>{env.name.toUpperCase()}</Text>
                  <Text style={styles.envTagline}>{env.tagline}</Text>
                  <Text style={styles.envDesc}>{env.description}</Text>

                  {/* Surface physics attributes */}
                  <View style={styles.physicsTags}>
                    <View style={styles.tagPill}>
                      <Text style={styles.tagText}>
                        Friction: {Math.round(env.frictionMultiplier * 100)}%
                      </Text>
                    </View>
                    <View style={styles.tagPill}>
                      <Text style={styles.tagText}>
                        Gravity: {env.gravity} m/s²
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Button */}
                <View style={styles.cardAction}>
                  {isUnlocked ? (
                    <TouchableOpacity
                      style={[styles.selectBtn, isSelected && styles.selectedBtn]}
                      onPress={() => handleSelect(env.id)}
                      disabled={isSelected}>
                      <Text style={styles.selectBtnText}>
                        {isSelected ? '✓ SELECTED' : 'SELECT MAP'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.unlockBtn}
                      onPress={() => handleUnlock(env.id)}>
                      <Text style={styles.unlockBtnText}>UNLOCK ★ {env.unlockCost}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
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
    gap: 18,
  },
  envCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  envCardSelected: {
    borderColor: '#06D6A0',
  },
  previewContainer: {
    height: 90,
    width: '100%',
    position: 'relative',
  },
  recordBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  recordText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
  },
  cardDetails: {
    padding: 16,
  },
  cardInfo: {
    marginBottom: 14,
  },
  envName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  envTagline: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  envDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  physicsTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  cardAction: {
    width: '100%',
  },
  selectBtn: {
    backgroundColor: '#06D6A0',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  selectedBtn: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  unlockBtn: {
    backgroundColor: '#FB8500',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
