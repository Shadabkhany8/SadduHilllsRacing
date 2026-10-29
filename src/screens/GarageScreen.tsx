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
import Svg, { Circle, G, Line, Polygon, Rect } from 'react-native-svg';
import { VEHICLE_LIST, VEHICLES } from '@/constants/vehicles';
import { VehicleConfig } from '@/types/game';
import { SaveGameService } from '@/services/SaveGameService';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface GarageScreenProps {
  onBack: () => void;
  onGoToUpgrades: () => void;
}

export const GarageScreen: React.FC<GarageScreenProps> = ({ onBack, onGoToUpgrades }) => {
  const [saveData, setSaveData] = useState(SaveGameService.get());
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const idx = VEHICLE_LIST.findIndex((v) => v.id === saveData.selectedVehicleId);
    return idx >= 0 ? idx : 0;
  });

  const currentVehicle: VehicleConfig = VEHICLE_LIST[selectedIndex] || VEHICLES.buggy;
  const isUnlocked = saveData.unlockedVehicles.includes(currentVehicle.id);
  const isSelected = saveData.selectedVehicleId === currentVehicle.id;

  const handleSelect = async () => {
    AudioService.playButton();
    HapticsService.button();
    await SaveGameService.selectVehicle(currentVehicle.id);
    setSaveData({ ...SaveGameService.get() });
  };

  const handleUnlock = async () => {
    AudioService.playButton();
    HapticsService.button();
    const res = await SaveGameService.purchaseVehicle(currentVehicle.id);
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

  const handleNext = () => {
    AudioService.playButton();
    HapticsService.button();
    setSelectedIndex((prev) => (prev + 1) % VEHICLE_LIST.length);
  };

  const handlePrev = () => {
    AudioService.playButton();
    HapticsService.button();
    setSelectedIndex((prev) => (prev - 1 + VEHICLE_LIST.length) % VEHICLE_LIST.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>GARAGE</Text>

        <View style={styles.coinBadge}>
          <Text style={styles.coinStar}>★</Text>
          <Text style={styles.coinAmount}>{saveData.totalCoins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VEHICLE CAROUSEL SELECTOR */}
        <View style={styles.carouselContainer}>
          <TouchableOpacity style={styles.navArrow} onPress={handlePrev}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>

          {/* 2D VEHICLE PREVIEW GRAPHIC */}
          <View style={styles.previewCard}>
            <Svg width={260} height={130} viewBox="-130 -65 260 130">
              {/* Ground shadow */}
              <Circle cx={0} cy={44} r={65} fill="rgba(0, 0, 0, 0.25)" scaleY={0.25} />

              {/* Suspension Struts */}
              <Line
                x1={-currentVehicle.wheelBase * 0.45}
                y1={0}
                x2={-currentVehicle.wheelBase * 0.45}
                y2={30}
                stroke="#6C757D"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <Line
                x1={currentVehicle.wheelBase * 0.45}
                y1={0}
                x2={currentVehicle.wheelBase * 0.45}
                y2={30}
                stroke="#6C757D"
                strokeWidth={5}
                strokeLinecap="round"
              />

              {/* Vehicle Body */}
              <Rect
                x={-currentVehicle.chassisWidth * 0.48}
                y={-currentVehicle.chassisHeight * 0.45}
                width={currentVehicle.chassisWidth * 0.96}
                height={currentVehicle.chassisHeight * 0.9}
                rx={8}
                fill={currentVehicle.bodyPrimaryColor}
                stroke={currentVehicle.bodySecondaryColor}
                strokeWidth={3}
              />

              {/* Cockpit */}
              <Polygon
                points={`${-currentVehicle.chassisWidth * 0.15},${-currentVehicle.chassisHeight * 0.4} ${currentVehicle.chassisWidth * 0.18},${-currentVehicle.chassisHeight * 0.4} ${currentVehicle.chassisWidth * 0.3},${-currentVehicle.chassisHeight * 0.1} ${-currentVehicle.chassisWidth * 0.25},${-currentVehicle.chassisHeight * 0.1}`}
                fill={currentVehicle.cockpitColor}
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />

              {/* Driver */}
              <Circle
                cx={-currentVehicle.chassisWidth * 0.05}
                cy={-currentVehicle.chassisHeight * 0.48}
                r={7}
                fill={currentVehicle.accentColor}
              />

              {/* Racing Accent */}
              <Rect
                x={-currentVehicle.chassisWidth * 0.42}
                y={-2}
                width={currentVehicle.chassisWidth * 0.84}
                height={5}
                fill={currentVehicle.accentColor}
              />

              {/* Rear Wheel */}
              <G x={-currentVehicle.wheelBase * 0.45} y={30}>
                <Circle cx={0} cy={0} r={currentVehicle.wheelRadius} fill="#212529" stroke="#495057" strokeWidth={3} />
                <Circle cx={0} cy={0} r={currentVehicle.wheelRadius * 0.6} fill={currentVehicle.wheelRimColor} />
                <Circle cx={0} cy={0} r={3} fill="#FFFFFF" />
              </G>

              {/* Front Wheel */}
              <G x={currentVehicle.wheelBase * 0.45} y={30}>
                <Circle cx={0} cy={0} r={currentVehicle.wheelRadius} fill="#212529" stroke="#495057" strokeWidth={3} />
                <Circle cx={0} cy={0} r={currentVehicle.wheelRadius * 0.6} fill={currentVehicle.wheelRimColor} />
                <Circle cx={0} cy={0} r={3} fill="#FFFFFF" />
              </G>
            </Svg>

            <Text style={styles.vehicleTitle}>{currentVehicle.name}</Text>
            <Text style={styles.vehicleTagline}>{currentVehicle.tagline}</Text>
          </View>

          <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.descriptionText}>{currentVehicle.description}</Text>

        {/* SPECIFICATIONS & STAT METERS */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsSectionTitle}>VEHICLE SPECIFICATIONS</Text>

          {/* Engine Power */}
          <View style={styles.statRow}>
            <Text style={styles.statName}>Engine Power</Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (currentVehicle.baseEnginePower / 2000) * 100)}%`, backgroundColor: '#FF595E' },
                ]}
              />
            </View>
          </View>

          {/* Top Speed */}
          <View style={styles.statRow}>
            <Text style={styles.statName}>Top Speed</Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (currentVehicle.baseTopSpeed / 120) * 100)}%`, backgroundColor: '#FFCA3A' },
                ]}
              />
            </View>
          </View>

          {/* Suspension */}
          <View style={styles.statRow}>
            <Text style={styles.statName}>Suspension Travel</Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (currentVehicle.maxSuspensionTravel / 28) * 100)}%`, backgroundColor: '#8AC926' },
                ]}
              />
            </View>
          </View>

          {/* Tire Grip */}
          <View style={styles.statRow}>
            <Text style={styles.statName}>Tire Grip</Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (currentVehicle.baseTireGrip / 1.6) * 100)}%`, backgroundColor: '#1982C4' },
                ]}
              />
            </View>
          </View>

          {/* Fuel Capacity */}
          <View style={styles.statRow}>
            <Text style={styles.statName}>Fuel Tank</Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (currentVehicle.baseFuelCapacity / 150) * 100)}%`, backgroundColor: '#6A4C93' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          {isUnlocked ? (
            <TouchableOpacity
              style={[styles.primaryActionBtn, isSelected ? styles.selectedBtn : styles.selectBtn]}
              onPress={handleSelect}
              disabled={isSelected}>
              <Text style={styles.primaryActionText}>
                {isSelected ? '✓ CURRENTLY SELECTED' : 'SELECT VEHICLE'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
              <Text style={styles.unlockBtnText}>UNLOCK FOR ★ {currentVehicle.price}</Text>
            </TouchableOpacity>
          )}

          {isUnlocked && (
            <TouchableOpacity style={styles.upgradeNavBtn} onPress={onGoToUpgrades}>
              <Text style={styles.upgradeNavBtnText}>⚡ TUNE & UPGRADE VEHICLE</Text>
            </TouchableOpacity>
          )}
        </View>
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
    fontSize: 20,
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
    alignItems: 'center',
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  arrowText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
  },
  previewCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vehicleTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },
  vehicleTagline: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  statsSectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    width: 130,
  },
  meterTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 5,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 5,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryActionBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  selectBtn: {
    backgroundColor: '#06D6A0',
  },
  selectedBtn: {
    backgroundColor: '#334155',
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  unlockBtn: {
    backgroundColor: '#FB8500',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB703',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  upgradeNavBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  upgradeNavBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
