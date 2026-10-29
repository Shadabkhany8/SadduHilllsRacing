import {
  EnvironmentConfig,
  FloatingTextEffect,
  GameRunStats,
  ParticleEffect,
  UpgradeLevels,
  VehicleConfig,
} from '@/types/game';
import { getFuelCapacityMultiplier } from '@/constants/upgrades';
import { TerrainGenerator } from './TerrainGenerator';
import { VehicleInputs, VehiclePhysics } from './VehiclePhysics';
import { Camera } from './Camera';
import { AudioService } from '@/services/AudioService';
import { HapticsService } from '@/services/HapticsService';
import { SaveGameService } from '@/services/SaveGameService';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameRunStats) => void;
  onGameOver: (finalStats: GameRunStats, isNewRecord: boolean, crashReason: string) => void;
}

export class GameEngine {
  public vehiclePhysics: VehiclePhysics;
  public terrain: TerrainGenerator;
  public camera: Camera;

  public vehicleConfig: VehicleConfig;
  public environmentConfig: EnvironmentConfig;
  public upgradeLevels: UpgradeLevels;

  public runStats: GameRunStats;
  public particles: ParticleEffect[] = [];
  public floatingTexts: FloatingTextEffect[] = [];

  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public crashReason: string = '';

  public inputs: VehicleInputs = { accelerate: false, brake: false };
  private callbacks: GameEngineCallbacks;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private fixedDt: number = 1 / 60;
  private startX: number = 60;
  private hasRecordedRun: boolean = false;

  // Visual effects timers
  private exhaustTimer: number = 0;

  constructor(
    vehicleConfig: VehicleConfig,
    environmentConfig: EnvironmentConfig,
    upgradeLevels: UpgradeLevels,
    callbacks: GameEngineCallbacks
  ) {
    this.vehicleConfig = vehicleConfig;
    this.environmentConfig = environmentConfig;
    this.upgradeLevels = upgradeLevels;
    this.callbacks = callbacks;

    const fuelMultiplier = getFuelCapacityMultiplier(this.upgradeLevels.fuel || 1);
    const maxFuel = Math.round(this.vehicleConfig.baseFuelCapacity * fuelMultiplier);

    this.runStats = {
      distanceMeters: 0,
      coinsEarned: 0,
      fuelRemaining: maxFuel,
      maxFuel,
      airTimeSeconds: 0,
      flipsDone: 0,
      topSpeedKmh: 0,
    };

    this.terrain = new TerrainGenerator(this.environmentConfig);
    this.vehiclePhysics = new VehiclePhysics(
      this.vehicleConfig,
      this.upgradeLevels,
      this.environmentConfig,
      this.terrain,
      this.startX
    );
    this.camera = new Camera(this.startX, 280);
  }

  setInputs(accelerate: boolean, brake: boolean): void {
    this.inputs.accelerate = accelerate;
    this.inputs.brake = brake;
  }

  start(): void {
    this.isPaused = false;
    this.isGameOver = false;
    this.hasRecordedRun = false;
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  pause(): void {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  resume(): void {
    if (!this.isGameOver) {
      this.isPaused = false;
      this.lastTimestamp = performance.now();
      this.loop(this.lastTimestamp);
    }
  }

  restart(): void {
    this.pause();
    this.hasRecordedRun = false;
    this.isGameOver = false;
    this.crashReason = '';

    const fuelMultiplier = getFuelCapacityMultiplier(this.upgradeLevels.fuel || 1);
    const maxFuel = Math.round(this.vehicleConfig.baseFuelCapacity * fuelMultiplier);

    this.runStats = {
      distanceMeters: 0,
      coinsEarned: 0,
      fuelRemaining: maxFuel,
      maxFuel,
      airTimeSeconds: 0,
      flipsDone: 0,
      topSpeedKmh: 0,
    };

    this.particles = [];
    this.floatingTexts = [];
    this.terrain.setEnvironment(this.environmentConfig);
    this.vehiclePhysics.reset(this.startX);
    this.camera.reset(this.startX, 280);

    this.start();
  }

  destroy(): void {
    this.pause();
    this.particles = [];
    this.floatingTexts = [];
  }

  private loop = (timestamp: number): void => {
    if (this.isPaused) return;

    const frameTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // cap large lag spikes
    this.lastTimestamp = timestamp;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDt) {
      this.updatePhysicsStep(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.updateVFX(frameTime);
    this.callbacks.onStatsUpdate({ ...this.runStats });

    if (!this.isGameOver) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  private updatePhysicsStep(dt: number): void {
    if (this.isGameOver) return;

    // 1. Advance vehicle physics
    this.vehiclePhysics.update(this.inputs, dt);
    const { chassis, rearWheel, frontWheel, isCrashed, currentSpeedKmh } = this.vehiclePhysics.state;

    // 2. Camera tracking
    this.camera.update(chassis.x, chassis.y, chassis.vx, chassis.vy, 800, 450, dt);

    // 3. Terrain chunk generation ahead of vehicle
    this.terrain.updateChunks(chassis.x);

    // 4. Update distance
    const currentDistance = Math.max(0, Math.round((chassis.x - this.startX) / 18));
    this.runStats.distanceMeters = Math.max(this.runStats.distanceMeters, currentDistance);
    this.runStats.topSpeedKmh = Math.max(this.runStats.topSpeedKmh, currentSpeedKmh);

    // 5. Landing impact sound and particle burst
    if (this.vehiclePhysics.justLanded) {
      AudioService.playLanding();
      HapticsService.medium();
      this.spawnLandingDust(rearWheel.x, rearWheel.y);
      this.spawnLandingDust(frontWheel.x, frontWheel.y);
    }

    // 6. Fuel consumption
    if (this.inputs.accelerate) {
      const consumption = this.vehicleConfig.fuelConsumptionRate * dt * 1.35;
      this.runStats.fuelRemaining = Math.max(0, this.runStats.fuelRemaining - consumption);
    } else {
      // Idle engine fuel drain
      const idleConsumption = this.vehicleConfig.fuelConsumptionRate * dt * 0.25;
      this.runStats.fuelRemaining = Math.max(0, this.runStats.fuelRemaining - idleConsumption);
    }

    // Check Out of Fuel
    if (this.runStats.fuelRemaining <= 0) {
      this.vehiclePhysics.triggerOutOfFuelCrash();
      this.triggerGameOver('Out of Fuel!');
      return;
    }

    // Check Stunt Flips award
    if (this.vehiclePhysics.completedFlipsThisJump > 0) {
      const flips = this.vehiclePhysics.completedFlipsThisJump;
      this.vehiclePhysics.completedFlipsThisJump = 0;
      this.runStats.flipsDone += flips;
      const bonusCoins = flips * 50;
      this.runStats.coinsEarned += bonusCoins;
      AudioService.playCoin();
      HapticsService.coin();
      this.addFloatingText(`FLIP BONUS! +${bonusCoins}`, chassis.x, chassis.y - 45, '#FFD166');
    }

    // 7. Collectibles detection
    const collectibles = this.terrain.getCollectiblesInRange(chassis.x - 70, chassis.x + 70);
    for (const item of collectibles) {
      if (item.collected) continue;

      // Test distance from rear/front wheels and chassis center
      const dChassis = Math.hypot(chassis.x - item.x, chassis.y - item.y);
      const dRear = Math.hypot(rearWheel.x - item.x, rearWheel.y - item.y);
      const dFront = Math.hypot(frontWheel.x - item.x, frontWheel.y - item.y);

      const collectThreshold = item.radius + 24;
      if (dChassis < collectThreshold || dRear < collectThreshold || dFront < collectThreshold) {
        this.terrain.collectItem(item.id);

        if (item.type === 'coin') {
          this.runStats.coinsEarned += item.value;
          AudioService.playCoin();
          HapticsService.coin();
          this.spawnCoinGlint(item.x, item.y);
          this.addFloatingText(`+${item.value}`, item.x, item.y - 15, '#FFD166');
        } else if (item.type === 'fuel') {
          this.runStats.fuelRemaining = this.runStats.maxFuel;
          AudioService.playFuel();
          HapticsService.fuel();
          this.spawnFuelSparks(item.x, item.y);
          this.addFloatingText('+FUEL 100%', item.x, item.y - 20, '#06D6A0');
        }
      }
    }

    // 8. Crash detection
    if (isCrashed && !this.isGameOver) {
      AudioService.playCrash();
      HapticsService.crash();
      this.spawnCrashExplosion(chassis.x, chassis.y);
      const reason = this.vehiclePhysics.state.crashReason === 'out_of_fuel' 
        ? 'Out of Fuel!' 
        : 'Driver Crash!';
      this.triggerGameOver(reason);
    }

    // 9. Wheel dust emission while driving
    if (rearWheel.onGround && this.inputs.accelerate && Math.abs(rearWheel.vx) > 30) {
      this.spawnDriveDust(rearWheel.x, rearWheel.y);
    }
  }

  private triggerGameOver(reason: string): void {
    if (this.hasRecordedRun) return;
    this.hasRecordedRun = true;
    this.isGameOver = true;
    this.crashReason = reason;

    // Idempotent record run in save service
    SaveGameService.recordRun(
      this.environmentConfig.id,
      this.runStats.distanceMeters,
      this.runStats.coinsEarned
    ).then(({ isNewRecord }) => {
      this.callbacks.onGameOver(this.runStats, isNewRecord, reason);
    });
  }

  private updateVFX(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = 1.0 - p.life / p.maxLife;
    }

    // Update floating text popups
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life += dt;
      if (t.life >= t.maxLife) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y -= 28 * dt; // float upwards
    }
  }

  private spawnLandingDust(x: number, y: number): void {
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 1.2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        id: `dust_${Math.random()}`,
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.2,
        size: 5 + Math.random() * 6,
        color: this.environmentConfig.terrainSurfaceColor,
        alpha: 0.8,
      });
    }
  }

  private spawnDriveDust(x: number, y: number): void {
    if (Math.random() > 0.45) return;
    this.particles.push({
      id: `drive_dust_${Math.random()}`,
      x: x - 8,
      y: y + 2,
      vx: -60 - Math.random() * 40,
      vy: -15 - Math.random() * 25,
      life: 0,
      maxLife: 0.35,
      size: 4 + Math.random() * 4,
      color: this.environmentConfig.terrainSurfaceColor,
      alpha: 0.6,
    });
  }

  private spawnCoinGlint(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 65 + Math.random() * 45;
      this.particles.push({
        id: `coin_spark_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.4,
        size: 3.5,
        color: '#FFD166',
        alpha: 1.0,
      });
    }
  }

  private spawnFuelSparks(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 80 + Math.random() * 50;
      this.particles.push({
        id: `fuel_spark_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5,
        size: 4.5,
        color: '#06D6A0',
        alpha: 1.0,
      });
    }
  }

  private spawnCrashExplosion(x: number, y: number): void {
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        id: `crash_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0,
        maxLife: 0.75 + Math.random() * 0.3,
        size: 6 + Math.random() * 8,
        color: i % 2 === 0 ? '#EF233C' : '#FFD166',
        alpha: 1.0,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string): void {
    this.floatingTexts.push({
      id: `text_${Math.random()}`,
      text,
      x,
      y,
      life: 0,
      maxLife: 0.9,
      color,
      fontSize: 16,
    });
  }
}
