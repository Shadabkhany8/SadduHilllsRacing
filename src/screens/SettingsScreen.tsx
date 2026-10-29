import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SaveGameService } from '@/services/SaveGameService';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [saveData, setSaveData] = useState(SaveGameService.get());
  const { settings, stats } = saveData;

  const updateSetting = async (key: keyof typeof settings, value: boolean | number) => {
    AudioService.playButton();
    HapticsService.button();
    const updated = await SaveGameService.updateSettings({ [key]: value });
    setSaveData({ ...updated });
  };

  const handleResetProgress = () => {
    AudioService.playButton();
    HapticsService.button();
    Alert.alert(
      'Reset All Progress?',
      'This will restore your coins, vehicle upgrades, and best distances to factory defaults. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            const reset = await SaveGameService.resetAllData();
            setSaveData({ ...reset });
            AudioService.playCrash();
            HapticsService.crash();
            Alert.alert('Reset Complete', 'Game progress has been reset to defaults.');
          },
        },
      ]
    );
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

        <Text style={styles.headerTitle}>SETTINGS</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AUDIO & HAPTICS SETTINGS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AUDIO & FEEDBACK</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDesc}>Engine, coin chimes, and landing thuds</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => updateSetting('soundEnabled', val)}
              trackColor={{ false: '#334155', true: '#06D6A0' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Music</Text>
              <Text style={styles.settingDesc}>Atmospheric environment tunes</Text>
            </View>
            <Switch
              value={settings.musicEnabled}
              onValueChange={(val) => updateSetting('musicEnabled', val)}
              trackColor={{ false: '#334155', true: '#06D6A0' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDesc}>Vibration on impacts and pickups</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(val) => updateSetting('hapticsEnabled', val)}
              trackColor={{ false: '#334155', true: '#06D6A0' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* LIFETIME STATISTICS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CAREER STATISTICS</Text>

          <View style={styles.statLine}>
            <Text style={styles.statName}>Total Runs Attempted</Text>
            <Text style={styles.statNumber}>{stats.totalRuns}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statLine}>
            <Text style={styles.statName}>Total Distance Traveled</Text>
            <Text style={styles.statNumber}>{stats.totalDistanceTraveled} m</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statLine}>
            <Text style={styles.statName}>Lifetime Coins Earned</Text>
            <Text style={[styles.statNumber, { color: '#FFD166' }]}>★ {stats.totalCoinsCollected}</Text>
          </View>
        </View>

        {/* RESET GAME DATA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          <Text style={styles.dataDesc}>
            Clear stored distance records, coins, and unlocks to restart from the beginning.
          </Text>

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetProgress}>
            <Text style={styles.resetBtnText}>RESET ALL PROGRESS</Text>
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  settingDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statName: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  statNumber: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '900',
  },
  dataDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 35, 60, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EF233C',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#EF233C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
