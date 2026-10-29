import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { SaveGameService } from '@/services/SaveGameService';
import { VEHICLES } from '@/constants/vehicles';
import { ENVIRONMENTS } from '@/constants/environments';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface MainMenuScreenProps {
  onPlay: () => void;
  onGarage: () => void;
  onUpgrades: () => void;
  onEnvironments: () => void;
  onSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onPlay,
  onGarage,
  onUpgrades,
  onEnvironments,
  onSettings,
}) => {
  const { width, height } = useWindowDimensions();
  const saveData = SaveGameService.get();

  const selectedVehicle = VEHICLES[saveData.selectedVehicleId] || VEHICLES.buggy;
  const selectedEnv = ENVIRONMENTS[saveData.selectedEnvironmentId] || ENVIRONMENTS.green_hills;
  const bestDistance = saveData.bestDistanceByEnv[selectedEnv.id] || 0;

  const handleAction = (cb: () => void) => {
    AudioService.playButton();
    HapticsService.button();
    cb();
  };

  return (
    <View style={styles.container}>
      {/* BACKGROUND SCENERY ART */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="menuSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#3A86FF" />
            <Stop offset="50%" stopColor="#8338EC" />
            <Stop offset="100%" stopColor="#FF006E" />
          </LinearGradient>
          <LinearGradient id="menuSun" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFBE0B" />
            <Stop offset="100%" stopColor="#FB5607" />
          </LinearGradient>
          <LinearGradient id="menuHill1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4361EE" />
            <Stop offset="100%" stopColor="#1E1B4B" />
          </LinearGradient>
          <LinearGradient id="menuHill2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#06D6A0" />
            <Stop offset="100%" stopColor="#0A3A40" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#menuSky)" />

        {/* Big Stylized Sun */}
        <Circle cx={width * 0.75} cy={height * 0.3} r={height * 0.22} fill="url(#menuSun)" opacity={0.85} />

        {/* Mountain Silhouette 1 */}
        <Path
          d={`M -20 ${height * 0.58} L ${width * 0.25} ${height * 0.42} L ${width * 0.55} ${height * 0.52} L ${width * 0.85} ${height * 0.38} L ${width + 20} ${height * 0.52} L ${width + 20} ${height} L -20 ${height} Z`}
          fill="url(#menuHill1)"
          opacity={0.8}
        />

        {/* Fore Rolling Hill */}
        <Path
          d={`M -20 ${height * 0.7} Q ${width * 0.3} ${height * 0.52} ${width * 0.65} ${height * 0.68} T ${width + 20} ${height * 0.62} L ${width + 20} ${height} L -20 ${height} Z`}
          fill="url(#menuHill2)"
        />
      </Svg>

      <SafeAreaView style={styles.safeContent}>
        {/* TOP BAR: COINS & BEST DISTANCE */}
        <View style={styles.topBar}>
          <View style={styles.envBadge}>
            <Text style={styles.envIconText}>📍</Text>
            <Text style={styles.envNameText}>{selectedEnv.name}</Text>
          </View>

          <View style={styles.topBarRight}>
            <View style={styles.recordBadge}>
              <Text style={styles.recordLabel}>BEST</Text>
              <Text style={styles.recordValue}>{bestDistance}m</Text>
            </View>

            <View style={styles.coinBadge}>
              <View style={styles.coinIcon}>
                <Text style={styles.coinIconText}>★</Text>
              </View>
              <Text style={styles.coinValue}>{saveData.totalCoins}</Text>
            </View>
          </View>
        </View>

        {/* LOGO & TITLE */}
        <View style={styles.titleSection}>
          <Text style={styles.logoSubTitle}>2D HILL RACER</Text>
          <Text style={styles.logoTitle}>SADDUHILLS</Text>
          <View style={styles.logoUnderline} />
        </View>

        {/* VEHICLE SHOWCASE BADGE */}
        <View style={styles.vehicleShowcase}>
          <View style={[styles.vehicleColorPill, { backgroundColor: selectedVehicle.bodyPrimaryColor }]}>
            <Text style={styles.vehiclePillText}>{selectedVehicle.name.toUpperCase()}</Text>
          </View>
          <Text style={styles.vehicleTaglineText}>{selectedVehicle.tagline}</Text>
        </View>

        {/* MENU ACTION BUTTONS */}
        <View style={styles.buttonStack}>
          {/* BIG PLAY BUTTON */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handleAction(onPlay)}
            activeOpacity={0.88}>
            <Text style={styles.playButtonText}>▶  DRIVE NOW</Text>
          </TouchableOpacity>

          {/* SECONDARY ROW: GARAGE & UPGRADES */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.garageBtn]}
              onPress={() => handleAction(onGarage)}
              activeOpacity={0.85}>
              <Text style={styles.actionBtnIcon}>🏎️</Text>
              <Text style={styles.actionBtnText}>GARAGE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.upgradeBtn]}
              onPress={() => handleAction(onUpgrades)}
              activeOpacity={0.85}>
              <Text style={styles.actionBtnIcon}>⚡</Text>
              <Text style={styles.actionBtnText}>UPGRADES</Text>
            </TouchableOpacity>
          </View>

          {/* TERTIARY ROW: MAPS & SETTINGS */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.mapBtn]}
              onPress={() => handleAction(onEnvironments)}
              activeOpacity={0.85}>
              <Text style={styles.actionBtnIcon}>🗺️</Text>
              <Text style={styles.actionBtnText}>MAPS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.settingsBtn]}
              onPress={() => handleAction(onSettings)}
              activeOpacity={0.85}>
              <Text style={styles.actionBtnIcon}>⚙️</Text>
              <Text style={styles.actionBtnText}>SETTINGS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  envBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  envIconText: {
    fontSize: 12,
  },
  envNameText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
    gap: 6,
  },
  recordLabel: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '900',
  },
  recordValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#FFD166',
    gap: 6,
  },
  coinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    color: '#785006',
    fontSize: 11,
    fontWeight: 'bold',
  },
  coinValue: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoSubTitle: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  logoUnderline: {
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#06D6A0',
    marginTop: 4,
  },
  vehicleShowcase: {
    alignItems: 'center',
    marginVertical: 4,
  },
  vehicleColorPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  vehiclePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  vehicleTaglineText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonStack: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: 12,
    marginBottom: 8,
  },
  playButton: {
    backgroundColor: '#06D6A0',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#38B000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  garageBtn: {
    backgroundColor: '#3B82F6',
  },
  upgradeBtn: {
    backgroundColor: '#FB8500',
  },
  mapBtn: {
    backgroundColor: '#8338EC',
  },
  settingsBtn: {
    backgroundColor: '#334155',
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
