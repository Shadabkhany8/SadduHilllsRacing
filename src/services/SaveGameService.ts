import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnvironmentId, SaveData, UpgradeType, VehicleId } from '@/types/game';
import { VEHICLES } from '@/constants/vehicles';
import { ENVIRONMENTS } from '@/constants/environments';
import { getUpgradeCost, MAX_UPGRADE_LEVEL } from '@/constants/upgrades';

const STORAGE_KEY = '@sadduhills_savedata_v1';

export const DEFAULT_SAVE_DATA: SaveData = {
  totalCoins: 250, // Starting bonus coins so player can try upgrades right away!
  bestDistanceByEnv: {
    green_hills: 0,
    desert_dunes: 0,
    snowy_mountains: 0,
    rocky_canyon: 0,
    night_hills: 0,
  },
  selectedVehicleId: 'buggy',
  unlockedVehicles: ['buggy'],
  vehicleUpgrades: {
    buggy: { engine: 1, tires: 1, suspension: 1, fuel: 1 },
    truck: { engine: 1, tires: 1, suspension: 1, fuel: 1 },
    desert_buggy: { engine: 1, tires: 1, suspension: 1, fuel: 1 },
    monster: { engine: 1, tires: 1, suspension: 1, fuel: 1 },
    trail_moto: { engine: 1, tires: 1, suspension: 1, fuel: 1 },
  },
  selectedEnvironmentId: 'green_hills',
  unlockedEnvironments: ['green_hills'],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    controlSensitivity: 1.0,
  },
  stats: {
    totalRuns: 0,
    totalDistanceTraveled: 0,
    totalCoinsCollected: 0,
  },
};

// In-memory cache for ultra-fast, synchronous access during gameplay loops
let cachedData: SaveData = { ...DEFAULT_SAVE_DATA };
let isInitialized = false;

export class SaveGameService {
  /**
   * Initializes and loads stored data into memory cache.
   */
  static async load(): Promise<SaveData> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedData = this.sanitize(parsed);
      } else {
        cachedData = { ...DEFAULT_SAVE_DATA };
        await this.persist();
      }
    } catch (err) {
      console.warn('[SaveGameService] Failed to load data from storage, using defaults:', err);
      cachedData = { ...DEFAULT_SAVE_DATA };
    }
    isInitialized = true;
    return cachedData;
  }

  /**
   * Returns current synchronously cached data.
   */
  static get(): SaveData {
    if (!isInitialized) {
      // Return defaults if read before async load finishes
      return cachedData;
    }
    return cachedData;
  }

  /**
   * Persists the current cached state to AsyncStorage.
   */
  private static async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    } catch (err) {
      console.error('[SaveGameService] Storage write error:', err);
    }
  }

  /**
   * Updates settings.
   */
  static async updateSettings(settings: Partial<SaveData['settings']>): Promise<SaveData> {
    cachedData.settings = { ...cachedData.settings, ...settings };
    await this.persist();
    return cachedData;
  }

  /**
   * Selects an unlocked vehicle.
   */
  static async selectVehicle(id: VehicleId): Promise<boolean> {
    if (cachedData.unlockedVehicles.includes(id)) {
      cachedData.selectedVehicleId = id;
      await this.persist();
      return true;
    }
    return false;
  }

  /**
   * Selects an unlocked environment.
   */
  static async selectEnvironment(id: EnvironmentId): Promise<boolean> {
    if (cachedData.unlockedEnvironments.includes(id)) {
      cachedData.selectedEnvironmentId = id;
      await this.persist();
      return true;
    }
    return false;
  }

  /**
   * Purchases and unlocks a vehicle if coins are sufficient.
   */
  static async purchaseVehicle(id: VehicleId): Promise<{ success: boolean; message: string }> {
    const config = VEHICLES[id];
    if (!config) return { success: false, message: 'Vehicle not found' };
    if (cachedData.unlockedVehicles.includes(id)) {
      return { success: true, message: 'Already unlocked' };
    }
    if (cachedData.totalCoins < config.price) {
      return { success: false, message: `Need ${config.price - cachedData.totalCoins} more coins` };
    }

    cachedData.totalCoins -= config.price;
    cachedData.unlockedVehicles.push(id);
    cachedData.selectedVehicleId = id;
    await this.persist();
    return { success: true, message: `${config.name} unlocked!` };
  }

  /**
   * Purchases an upgrade level for a specific vehicle and attribute.
   */
  static async purchaseUpgrade(
    vehicleId: VehicleId,
    type: UpgradeType
  ): Promise<{ success: boolean; newLevel: number; cost: number; message: string }> {
    const currentUpgrades = cachedData.vehicleUpgrades[vehicleId] || {
      engine: 1,
      tires: 1,
      suspension: 1,
      fuel: 1,
    };
    const currentLevel = currentUpgrades[type] || 1;

    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      return { success: false, newLevel: currentLevel, cost: 0, message: 'Maximum level reached' };
    }

    const cost = getUpgradeCost(type, currentLevel);
    if (cachedData.totalCoins < cost) {
      return {
        success: false,
        newLevel: currentLevel,
        cost,
        message: `Need ${cost - cachedData.totalCoins} more coins`,
      };
    }

    cachedData.totalCoins -= cost;
    currentUpgrades[type] = currentLevel + 1;
    cachedData.vehicleUpgrades[vehicleId] = currentUpgrades;
    await this.persist();

    return {
      success: true,
      newLevel: currentLevel + 1,
      cost,
      message: `${type.toUpperCase()} upgraded to Lv.${currentLevel + 1}!`,
    };
  }

  /**
   * Unlocks an environment.
   */
  static async purchaseEnvironment(
    id: EnvironmentId
  ): Promise<{ success: boolean; message: string }> {
    const config = ENVIRONMENTS[id];
    if (!config) return { success: false, message: 'Environment not found' };
    if (cachedData.unlockedEnvironments.includes(id)) {
      return { success: true, message: 'Already unlocked' };
    }
    if (cachedData.totalCoins < config.unlockCost) {
      return {
        success: false,
        message: `Need ${config.unlockCost - cachedData.totalCoins} more coins`,
      };
    }

    cachedData.totalCoins -= config.unlockCost;
    cachedData.unlockedEnvironments.push(id);
    cachedData.selectedEnvironmentId = id;
    await this.persist();
    return { success: true, message: `${config.name} unlocked!` };
  }

  /**
   * Saves run results (distance and coins collected) safely and idempotently.
   */
  static async recordRun(
    envId: EnvironmentId,
    distanceMeters: number,
    coinsEarned: number
  ): Promise<{ isNewRecord: boolean; bestDistance: number; totalCoins: number }> {
    const prevBest = cachedData.bestDistanceByEnv[envId] || 0;
    const isNewRecord = distanceMeters > prevBest;
    const bestDistance = isNewRecord ? distanceMeters : prevBest;

    cachedData.totalCoins += coinsEarned;
    cachedData.bestDistanceByEnv[envId] = bestDistance;

    // Update lifetime stats
    cachedData.stats.totalRuns += 1;
    cachedData.stats.totalDistanceTraveled += distanceMeters;
    cachedData.stats.totalCoinsCollected += coinsEarned;

    await this.persist();
    return {
      isNewRecord,
      bestDistance,
      totalCoins: cachedData.totalCoins,
    };
  }

  /**
   * Resets save data to factory defaults.
   */
  static async resetAllData(): Promise<SaveData> {
    cachedData = { ...DEFAULT_SAVE_DATA };
    await this.persist();
    return cachedData;
  }

  /**
   * Validates and merges partial or old save schemas into the latest shape.
   */
  private static sanitize(loaded: Partial<SaveData>): SaveData {
    const safe = { ...DEFAULT_SAVE_DATA };

    if (typeof loaded.totalCoins === 'number' && loaded.totalCoins >= 0) {
      safe.totalCoins = loaded.totalCoins;
    }

    if (loaded.bestDistanceByEnv && typeof loaded.bestDistanceByEnv === 'object') {
      safe.bestDistanceByEnv = {
        ...safe.bestDistanceByEnv,
        ...loaded.bestDistanceByEnv,
      };
    }

    if (loaded.selectedVehicleId && VEHICLES[loaded.selectedVehicleId]) {
      safe.selectedVehicleId = loaded.selectedVehicleId;
    }

    if (Array.isArray(loaded.unlockedVehicles) && loaded.unlockedVehicles.length > 0) {
      safe.unlockedVehicles = loaded.unlockedVehicles.filter((id) => VEHICLES[id]);
      if (!safe.unlockedVehicles.includes('buggy')) {
        safe.unlockedVehicles.unshift('buggy');
      }
    }

    if (loaded.vehicleUpgrades && typeof loaded.vehicleUpgrades === 'object') {
      safe.vehicleUpgrades = {
        ...safe.vehicleUpgrades,
        ...loaded.vehicleUpgrades,
      };
    }

    if (loaded.selectedEnvironmentId && ENVIRONMENTS[loaded.selectedEnvironmentId]) {
      safe.selectedEnvironmentId = loaded.selectedEnvironmentId;
    }

    if (Array.isArray(loaded.unlockedEnvironments) && loaded.unlockedEnvironments.length > 0) {
      safe.unlockedEnvironments = loaded.unlockedEnvironments.filter((id) => ENVIRONMENTS[id]);
      if (!safe.unlockedEnvironments.includes('green_hills')) {
        safe.unlockedEnvironments.unshift('green_hills');
      }
    }

    if (loaded.settings && typeof loaded.settings === 'object') {
      safe.settings = { ...safe.settings, ...loaded.settings };
    }

    if (loaded.stats && typeof loaded.stats === 'object') {
      safe.stats = { ...safe.stats, ...loaded.stats };
    }

    return safe;
  }
}
