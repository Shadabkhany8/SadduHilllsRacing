import { VehicleConfig, VehicleId } from '@/types/game';

export const VEHICLES: Record<VehicleId, VehicleConfig> = {
  buggy: {
    id: 'buggy',
    name: 'Saddu Cruiser',
    tagline: 'The classic hill conqueror',
    description: 'A well-balanced off-road vehicle featuring responsive spring suspension and reliable rear-wheel drive. Perfect for tackling rolling hills.',
    price: 0,
    unlockedByDefault: true,
    
    mass: 950,
    chassisWidth: 104,
    chassisHeight: 44,
    wheelBase: 68,
    wheelRadius: 19,
    centerOfMassYOffset: -6,
    
    springStiffness: 110,
    springDamping: 14,
    suspensionRestLength: 32,
    maxSuspensionTravel: 18,
    
    baseEnginePower: 1150,
    baseTopSpeed: 85,
    baseTireGrip: 1.15,
    airControlTorque: 7.2,
    isFourWheelDrive: false,
    
    baseFuelCapacity: 100,
    fuelConsumptionRate: 3.8,
    
    bodyPrimaryColor: '#E63946',
    bodySecondaryColor: '#F1FAEE',
    cockpitColor: '#457B9D',
    wheelRimColor: '#F4A261',
    accentColor: '#FFD166',
    driverType: 'helmet',
  },

  truck: {
    id: 'truck',
    name: 'Hill Hauler 4x4',
    tagline: 'Heavy-duty climbing torque',
    description: 'A heavy pickup truck with full 4WD traction. Heavy mass prevents flipping easily on steep inclines and powers through rough valleys.',
    price: 1500,
    unlockedByDefault: false,
    
    mass: 1450,
    chassisWidth: 120,
    chassisHeight: 52,
    wheelBase: 78,
    wheelRadius: 23,
    centerOfMassYOffset: -10,
    
    springStiffness: 150,
    springDamping: 19,
    suspensionRestLength: 34,
    maxSuspensionTravel: 20,
    
    baseEnginePower: 1550,
    baseTopSpeed: 80,
    baseTireGrip: 1.35,
    airControlTorque: 5.5,
    isFourWheelDrive: true,
    
    baseFuelCapacity: 125,
    fuelConsumptionRate: 4.4,
    
    bodyPrimaryColor: '#1D3557',
    bodySecondaryColor: '#457B9D',
    cockpitColor: '#A8DADC',
    wheelRimColor: '#CED4DA',
    accentColor: '#E63946',
    driverType: 'cap',
  },

  desert_buggy: {
    id: 'desert_buggy',
    name: 'Dune Striker',
    tagline: 'Lightweight & airborne acrobat',
    description: 'Ultra-light frame with high air-control pitch sensitivity and long-travel suspension. Soars over big jumps and executes rapid flips.',
    price: 3200,
    unlockedByDefault: false,
    
    mass: 720,
    chassisWidth: 98,
    chassisHeight: 40,
    wheelBase: 70,
    wheelRadius: 18,
    centerOfMassYOffset: -4,
    
    springStiffness: 95,
    springDamping: 12,
    suspensionRestLength: 36,
    maxSuspensionTravel: 24,
    
    baseEnginePower: 1300,
    baseTopSpeed: 102,
    baseTireGrip: 1.10,
    airControlTorque: 9.8,
    isFourWheelDrive: false,
    
    baseFuelCapacity: 90,
    fuelConsumptionRate: 4.1,
    
    bodyPrimaryColor: '#FFB703',
    bodySecondaryColor: '#FB8500',
    cockpitColor: '#023047',
    wheelRimColor: '#219EBC',
    accentColor: '#FFFFFF',
    driverType: 'goggles',
  },

  monster: {
    id: 'monster',
    name: 'Apex Behemoth',
    tagline: 'Monster wheels crush every bump',
    description: 'Equipped with colossal monster tires and immense ground clearance. Effortlessly rolls over steep cliff steps and absorbs massive drops.',
    price: 6000,
    unlockedByDefault: false,
    
    mass: 1800,
    chassisWidth: 126,
    chassisHeight: 56,
    wheelBase: 84,
    wheelRadius: 32,
    centerOfMassYOffset: -14,
    
    springStiffness: 180,
    springDamping: 24,
    suspensionRestLength: 42,
    maxSuspensionTravel: 26,
    
    baseEnginePower: 1900,
    baseTopSpeed: 88,
    baseTireGrip: 1.45,
    airControlTorque: 6.2,
    isFourWheelDrive: true,
    
    baseFuelCapacity: 140,
    fuelConsumptionRate: 5.0,
    
    bodyPrimaryColor: '#2B2D42',
    bodySecondaryColor: '#8D99AE',
    cockpitColor: '#EF233C',
    wheelRimColor: '#D90429',
    accentColor: '#FFD166',
    driverType: 'helmet',
  },

  trail_moto: {
    id: 'trail_moto',
    name: 'Thunder Motocross',
    tagline: 'High speed, nimble two-wheeler',
    description: 'A nimble dirt bike with blistering acceleration. Lean forward and backward with precision to master crazy hill climbs and stunt jumps.',
    price: 4500,
    unlockedByDefault: false,
    
    mass: 420,
    chassisWidth: 72,
    chassisHeight: 46,
    wheelBase: 54,
    wheelRadius: 18,
    centerOfMassYOffset: -2,
    
    springStiffness: 85,
    springDamping: 10,
    suspensionRestLength: 30,
    maxSuspensionTravel: 20,
    
    baseEnginePower: 1200,
    baseTopSpeed: 110,
    baseTireGrip: 1.25,
    airControlTorque: 12.5,
    isFourWheelDrive: false,
    
    baseFuelCapacity: 80,
    fuelConsumptionRate: 3.5,
    
    bodyPrimaryColor: '#06D6A0',
    bodySecondaryColor: '#118AB2',
    cockpitColor: '#073B4C',
    wheelRimColor: '#FFD166',
    accentColor: '#EF476F',
    driverType: 'bandana',
  },
};

export const VEHICLE_LIST: VehicleConfig[] = Object.values(VEHICLES);
