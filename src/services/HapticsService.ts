import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { SaveGameService } from './SaveGameService';

export class HapticsService {
  private static isEnabled(): boolean {
    if (Platform.OS === 'web') return false;
    return SaveGameService.get().settings.hapticsEnabled;
  }

  static light(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptic failures on unsupported hardware
    }
  }

  static medium(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }

  static heavy(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore
    }
  }

  static coin(): void {
    this.light();
  }

  static fuel(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  }

  static crash(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  }

  static button(): void {
    if (!this.isEnabled()) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  }
}
