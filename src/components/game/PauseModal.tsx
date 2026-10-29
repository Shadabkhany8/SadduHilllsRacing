import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';
import { SaveGameService } from '@/services/SaveGameService';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestart,
  onMenu,
}) => {
  const currentSettings = SaveGameService.get().settings;
  const [soundOn, setSoundOn] = useState(currentSettings.soundEnabled);
  const [hapticsOn, setHapticsOn] = useState(currentSettings.hapticsEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SaveGameService.updateSettings({ soundEnabled: next });
    AudioService.playButton();
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    SaveGameService.updateSettings({ hapticsEnabled: next });
    HapticsService.button();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>GAME PAUSED</Text>

          {/* Quick Settings */}
          <View style={styles.settingsRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, soundOn && styles.toggleBtnActive]}
              onPress={toggleSound}>
              <Text style={styles.toggleText}>SOUND: {soundOn ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, hapticsOn && styles.toggleBtnActive]}
              onPress={toggleHaptics}>
              <Text style={styles.toggleText}>HAPTIC: {hapticsOn ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsGroup}>
            <TouchableOpacity style={[styles.btn, styles.resumeBtn]} onPress={onResume}>
              <Text style={styles.btnText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.restartBtn]} onPress={onRestart}>
              <Text style={styles.btnText}>RESTART RUN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.menuBtn]} onPress={onMenu}>
              <Text style={styles.btnTextSecondary}>MAIN MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  toggleBtnActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  toggleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  buttonsGroup: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  resumeBtn: {
    backgroundColor: '#06D6A0',
  },
  restartBtn: {
    backgroundColor: '#E63946',
  },
  menuBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnTextSecondary: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '800',
  },
});
