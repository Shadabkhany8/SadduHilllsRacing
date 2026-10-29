export type VehicleId = 'buggy' | 'truck' | 'desert_buggy' | 'monster' | 'trail_moto';

export type UpgradeType = 'engine' | 'tires' | 'suspension' | 'fuel';

export type UpgradeLevels = Record<UpgradeType, number>;

export interface VehicleConfig {
  id: VehicleId;
  name: string;
  tagline: string;
  description: string;
  price: number;
  unlockedByDefault: boolean;
  
  // Physics parameters
  mass: number;
  chassisWidth: number;
  chassisHeight: number;
  wheelBase: number;        // distance between front and rear axle
  wheelRadius: number;
  rearWheelRadiusOffset?: number;
  frontWheelRadiusOffset?: number;
  centerOfMassYOffset: number; // lower = more stable, higher = rollovers
  
  // Suspension
  springStiffness: number;
  springDamping: number;
  suspensionRestLength: number;
  maxSuspensionTravel: number;
  
  // Drivetrain
  baseEnginePower: number;
  baseTopSpeed: number;
  baseTireGrip: number;
  airControlTorque: number; // airborne pitch sensitivity
  isFourWheelDrive: boolean;
  
  // Fuel
  baseFuelCapacity: number;
  fuelConsumptionRate: number; // per second when driving
  
  // Visual styling
  bodyPrimaryColor: string;
  bodySecondaryColor: string;
  cockpitColor: string;
  wheelRimColor: string;
  accentColor: string;
  driverType: 'helmet' | 'cap' | 'goggles' | 'bandana';
}

export type EnvironmentId = 
  | 'green_hills' 
  | 'desert_dunes' 
  | 'snowy_mountains' 
  | 'rocky_canyon' 
  | 'night_hills';

export interface EnvironmentConfig {
  id: EnvironmentId;
  name: string;
  tagline: string;
  description: string;
  unlockCost: number;
  unlockedByDefault: boolean;
  
  // Physics modifiers
  gravity: number;
  frictionMultiplier: number;
  bumpinessMultiplier: number;
  
  // Procedural terrain generation parameters
  baseHeight: number;
  terrainStep: number;
  wavelength: number;
  amplitude: number;
  steepnessFactor: number;
  roughness: number;
  
  // Aesthetics & Visuals
  skyColors: [string, string];
  sunOrMoon: {
    isMoon: boolean;
    color: string;
    glowColor: string;
    radius: number;
  };
  distantMountainColor: string;
  midHillColor: string;
  terrainSurfaceColor: string;
  terrainSubsurfaceColor: string;
  terrainSoilColor: string;
  soilPatternColor: string;
  
  // Ambient particle style
  ambientEffect?: 'leaves' | 'sand' | 'snow' | 'stars';
}

export interface Collectible {
  id: string;
  type: 'coin' | 'fuel';
  x: number;
  y: number;
  value: number; // coin amount or fuel restore %
  radius: number;
  collected: boolean;
  collectionProgress: number; // 0..1 for floating animation
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation?: number;
}

export interface FloatingTextEffect {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  fontSize: number;
}

export interface WheelPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  onGround: boolean;
  groundNormalX: number;
  groundNormalY: number;
  compression: number; // 0..1 compression ratio
  contactX: number;
  contactY: number;
}

export interface ChassisPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;           // in radians
  angularVelocity: number;  // rad/s
}

export interface VehiclePhysicsState {
  chassis: ChassisPhysicsState;
  rearWheel: WheelPhysicsState;
  frontWheel: WheelPhysicsState;
  isAirborne: boolean;
  airTimeSeconds: number;
  accumulatedAirRotation: number;
  currentSpeedKmh: number;
  isCrashed: boolean;
  crashReason?: 'driver_hit' | 'out_of_fuel' | 'flipped_stuck';
}

export interface GameRunStats {
  distanceMeters: number;
  coinsEarned: number;
  fuelRemaining: number; // 0..maxFuel
  maxFuel: number;
  airTimeSeconds: number;
  flipsDone: number;
  topSpeedKmh: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  controlSensitivity: number; // 0.5 .. 1.5
}

export interface SaveData {
  totalCoins: number;
  bestDistanceByEnv: Record<EnvironmentId, number>;
  selectedVehicleId: VehicleId;
  unlockedVehicles: VehicleId[];
  vehicleUpgrades: Record<VehicleId, UpgradeLevels>;
  selectedEnvironmentId: EnvironmentId;
  unlockedEnvironments: EnvironmentId[];
  settings: GameSettings;
  stats: {
    totalRuns: number;
    totalDistanceTraveled: number;
    totalCoinsCollected: number;
  };
}
