import { EnvironmentConfig, EnvironmentId } from '@/types/game';

export const ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  green_hills: {
    id: 'green_hills',
    name: 'Green Hills',
    tagline: 'Lush pastures & rolling meadows',
    description: 'The idyllic countryside featuring smooth grassy crests, mild slopes, and forgiving landings. Great for setting early distance records.',
    unlockCost: 0,
    unlockedByDefault: true,
    
    gravity: 9.8,
    frictionMultiplier: 1.0,
    bumpinessMultiplier: 1.0,
    
    baseHeight: 280,
    terrainStep: 14,
    wavelength: 320,
    amplitude: 75,
    steepnessFactor: 1.0,
    roughness: 0.15,
    
    skyColors: ['#4EA8DE', '#90E0EF'],
    sunOrMoon: {
      isMoon: false,
      color: '#FFD166',
      glowColor: 'rgba(255, 209, 102, 0.4)',
      radius: 42,
    },
    distantMountainColor: '#5390D9',
    midHillColor: '#52B788',
    terrainSurfaceColor: '#2D6A4F',
    terrainSubsurfaceColor: '#74C69D',
    terrainSoilColor: '#403D39',
    soilPatternColor: '#252422',
    ambientEffect: 'leaves',
  },

  desert_dunes: {
    id: 'desert_dunes',
    name: 'Desert Dunes',
    tagline: 'Blazing heat & shifting sands',
    description: 'Golden undulating dunes with expansive launch ramps. Sand slightly reduces wheel traction and requires careful throttle modulation.',
    unlockCost: 1200,
    unlockedByDefault: false,
    
    gravity: 9.8,
    frictionMultiplier: 0.88,
    bumpinessMultiplier: 1.15,
    
    baseHeight: 290,
    terrainStep: 14,
    wavelength: 380,
    amplitude: 95,
    steepnessFactor: 1.25,
    roughness: 0.12,
    
    skyColors: ['#F77F00', '#FCBF49'],
    sunOrMoon: {
      isMoon: false,
      color: '#FFF3B0',
      glowColor: 'rgba(255, 243, 176, 0.5)',
      radius: 54,
    },
    distantMountainColor: '#E09F3E',
    midHillColor: '#DDA15E',
    terrainSurfaceColor: '#BC6C25',
    terrainSubsurfaceColor: '#DDA15E',
    terrainSoilColor: '#7F4F24',
    soilPatternColor: '#582F0E',
    ambientEffect: 'sand',
  },

  snowy_mountains: {
    id: 'snowy_mountains',
    name: 'Snowy Mountains',
    tagline: 'Icy inclines & glacial peaks',
    description: 'Sub-zero mountain ranges with slick ice and deep snow packs. Lower tire grip demands upgraded tires to prevent backsliding.',
    unlockCost: 2500,
    unlockedByDefault: false,
    
    gravity: 9.8,
    frictionMultiplier: 0.76,
    bumpinessMultiplier: 1.1,
    
    baseHeight: 270,
    terrainStep: 14,
    wavelength: 340,
    amplitude: 85,
    steepnessFactor: 1.15,
    roughness: 0.22,
    
    skyColors: ['#1A365D', '#63B3ED'],
    sunOrMoon: {
      isMoon: false,
      color: '#EBF8FF',
      glowColor: 'rgba(235, 248, 255, 0.6)',
      radius: 36,
    },
    distantMountainColor: '#2B6CB0',
    midHillColor: '#BEE3F8',
    terrainSurfaceColor: '#F7FAFC',
    terrainSubsurfaceColor: '#CBD5E0',
    terrainSoilColor: '#4A5568',
    soilPatternColor: '#2D3748',
    ambientEffect: 'snow',
  },

  rocky_canyon: {
    id: 'rocky_canyon',
    name: 'Rocky Canyon',
    tagline: 'Jagged gorges & treacherous drops',
    description: 'Dramatic sandstone plateaus, sudden cliff drops, and steep ravines. High suspension stiffness is mandatory to survive hard impacts.',
    unlockCost: 4000,
    unlockedByDefault: false,
    
    gravity: 10.2,
    frictionMultiplier: 1.05,
    bumpinessMultiplier: 1.35,
    
    baseHeight: 300,
    terrainStep: 12,
    wavelength: 290,
    amplitude: 110,
    steepnessFactor: 1.4,
    roughness: 0.32,
    
    skyColors: ['#6B2D5C', '#E26D5C'],
    sunOrMoon: {
      isMoon: false,
      color: '#FFE6A7',
      glowColor: 'rgba(255, 230, 167, 0.4)',
      radius: 46,
    },
    distantMountainColor: '#8E3B46',
    midHillColor: '#C44536',
    terrainSurfaceColor: '#772E25',
    terrainSubsurfaceColor: '#9D4439',
    terrainSoilColor: '#471A15',
    soilPatternColor: '#2B0E0B',
  },

  night_hills: {
    id: 'night_hills',
    name: 'Night Hills',
    tagline: 'Starlit neon & midnight breeze',
    description: 'A captivating nocturnal drive under a giant crescent moon with twinkling constellations and glowing neon hill silhouettes.',
    unlockCost: 5500,
    unlockedByDefault: false,
    
    gravity: 9.8,
    frictionMultiplier: 1.02,
    bumpinessMultiplier: 1.05,
    
    baseHeight: 280,
    terrainStep: 14,
    wavelength: 330,
    amplitude: 80,
    steepnessFactor: 1.05,
    roughness: 0.16,
    
    skyColors: ['#0B091A', '#1F1A3A'],
    sunOrMoon: {
      isMoon: true,
      color: '#E0AAFF',
      glowColor: 'rgba(224, 170, 255, 0.45)',
      radius: 48,
    },
    distantMountainColor: '#240046',
    midHillColor: '#3C096C',
    terrainSurfaceColor: '#7B2CBF',
    terrainSubsurfaceColor: '#5A189A',
    terrainSoilColor: '#10002B',
    soilPatternColor: '#0A0017',
    ambientEffect: 'stars',
  },
};

export const ENVIRONMENT_LIST: EnvironmentConfig[] = Object.values(ENVIRONMENTS);
