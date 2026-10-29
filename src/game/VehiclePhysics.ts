import {
  EnvironmentConfig,
  UpgradeLevels,
  VehicleConfig,
  VehiclePhysicsState,
  WheelPhysicsState,
} from '@/types/game';
import {
  getEnginePowerMultiplier,
  getSuspensionStiffnessMultiplier,
  getTireGripMultiplier,
} from '@/constants/upgrades';
import { TerrainGenerator } from './TerrainGenerator';

export interface VehicleInputs {
  accelerate: boolean; // Gas / forward / pitch CCW
  brake: boolean;      // Brake / reverse / pitch CW
}

export class VehiclePhysics {
  public state: VehiclePhysicsState;
  private config: VehicleConfig;
  private upgrades: UpgradeLevels;
  private env: EnvironmentConfig;
  private terrain: TerrainGenerator;

  // Cached upgraded multipliers
  private enginePower!: number;
  private tireGrip!: number;
  private springStiffness!: number;
  private springDamping!: number;

  // Cumulative rotation tracking for stunt flips
  private previousAngle: number = 0;
  private totalAirRotation: number = 0;
  public completedFlipsThisJump: number = 0;
  public justLanded: boolean = false;
  public landingImpactSpeed: number = 0;

  constructor(
    config: VehicleConfig,
    upgrades: UpgradeLevels,
    env: EnvironmentConfig,
    terrain: TerrainGenerator,
    spawnX = 60
  ) {
    this.config = config;
    this.upgrades = upgrades;
    this.env = env;
    this.terrain = terrain;

    this.recalculateUpgrades();
    this.state = this.createInitialState(spawnX);
  }

  recalculateUpgrades(): void {
    const engineMult = getEnginePowerMultiplier(this.upgrades.engine || 1);
    const tireMult = getTireGripMultiplier(this.upgrades.tires || 1);
    const suspMult = getSuspensionStiffnessMultiplier(this.upgrades.suspension || 1);

    this.enginePower = this.config.baseEnginePower * engineMult;
    this.tireGrip = this.config.baseTireGrip * tireMult * this.env.frictionMultiplier;
    this.springStiffness = this.config.springStiffness * suspMult;
    this.springDamping = this.config.springDamping * suspMult;
  }

  private createInitialState(spawnX: number): VehiclePhysicsState {
    const spawnY = this.terrain.getHeight(spawnX) - this.config.suspensionRestLength - this.config.wheelRadius - 10;
    const halfBase = this.config.wheelBase / 2;

    const rearWheel: WheelPhysicsState = {
      x: spawnX - halfBase,
      y: spawnY + this.config.suspensionRestLength,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      radius: this.config.wheelRadius,
      onGround: false,
      groundNormalX: 0,
      groundNormalY: -1,
      compression: 0,
      contactX: spawnX - halfBase,
      contactY: spawnY + this.config.suspensionRestLength,
    };

    const frontWheel: WheelPhysicsState = {
      x: spawnX + halfBase,
      y: spawnY + this.config.suspensionRestLength,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      radius: this.config.wheelRadius,
      onGround: false,
      groundNormalX: 0,
      groundNormalY: -1,
      compression: 0,
      contactX: spawnX + halfBase,
      contactY: spawnY + this.config.suspensionRestLength,
    };

    return {
      chassis: {
        x: spawnX,
        y: spawnY,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
      },
      rearWheel,
      frontWheel,
      isAirborne: true,
      airTimeSeconds: 0,
      accumulatedAirRotation: 0,
      currentSpeedKmh: 0,
      isCrashed: false,
    };
  }

  /**
   * Fixed physics step with internal 4x sub-stepping (240Hz simulation resolution).
   * Ensures high-speed stability and eliminates collision tunneling or seam snagging.
   */
  update(inputs: VehicleInputs, dt = 1 / 60): void {
    if (this.state.isCrashed) {
      // In crash state, apply simple tumble physics
      this.updateCrashTumble(dt);
      return;
    }

    this.justLanded = false;
    this.landingImpactSpeed = 0;

    const subSteps = 4;
    const subDt = dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      this.physicsSubStep(inputs, subDt);
    }

    // Post-step state calculations
    const speedPixelsPerSec = Math.hypot(this.state.chassis.vx, this.state.chassis.vy);
    // Conversion: roughly 1 meter = 24 pixels, so 1 pixel/sec = (1/24) m/s = (1/24) * 3.6 km/h = 0.15 km/h
    this.state.currentSpeedKmh = Math.round(speedPixelsPerSec * 0.15);

    // Airborne & flip mechanics
    const wasAirborne = this.state.isAirborne;
    const isNowAirborne = !this.state.rearWheel.onGround && !this.state.frontWheel.onGround;
    this.state.isAirborne = isNowAirborne;

    if (isNowAirborne) {
      this.state.airTimeSeconds += dt;
      // Track angle delta for stunt flips
      let deltaAngle = this.state.chassis.angle - this.previousAngle;
      // Handle angle wrap-around
      while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
      this.totalAirRotation += deltaAngle;

      if (Math.abs(this.totalAirRotation) >= Math.PI * 1.95) {
        this.completedFlipsThisJump += 1;
        this.totalAirRotation = 0; // reset for multi-flips
      }
    } else {
      if (wasAirborne && this.state.airTimeSeconds > 0.35) {
        // Landing event!
        this.justLanded = true;
        this.landingImpactSpeed = Math.abs(this.state.chassis.vy);
      }
      this.state.airTimeSeconds = 0;
      this.totalAirRotation = 0;
    }

    this.previousAngle = this.state.chassis.angle;

    // Check crash conditions
    this.checkCrashConditions();
  }

  private physicsSubStep(inputs: VehicleInputs, dt: number): void {
    const { chassis, rearWheel, frontWheel } = this.state;
    const gravity = this.env.gravity * 38; // pixel/sec^2 conversion

    // 1. Chassis orientation vectors
    const cosA = Math.cos(chassis.angle);
    const sinA = Math.sin(chassis.angle);
    const forwardX = cosA;
    const forwardY = sinA;
    const upX = sinA;
    const upY = -cosA; // points upward in negative Y

    // 2. Wheel mount anchor positions in world coordinates
    const halfBase = this.config.wheelBase / 2;
    const rearMountX = chassis.x - forwardX * halfBase;
    const rearMountY = chassis.y - forwardY * halfBase;

    const frontMountX = chassis.x + forwardX * halfBase;
    const frontMountY = chassis.y + forwardY * halfBase;

    // 3. Resolve Suspension & Ground Collision for REAR Wheel
    this.resolveWheelPhysics(
      rearWheel,
      rearMountX,
      rearMountY,
      upX,
      upY,
      inputs,
      true, // is drive wheel
      dt,
      gravity
    );

    // 4. Resolve Suspension & Ground Collision for FRONT Wheel
    this.resolveWheelPhysics(
      frontWheel,
      frontMountX,
      frontMountY,
      upX,
      upY,
      inputs,
      this.config.isFourWheelDrive, // 4WD front drive
      dt,
      gravity
    );

    // 5. Calculate forces on Chassis from suspension struts
    // Suspension pushes chassis away from wheel along suspension strut
    const rearDeltaX = rearMountX - rearWheel.x;
    const rearDeltaY = rearMountY - rearWheel.y;
    const frontDeltaX = frontMountX - frontWheel.x;
    const frontDeltaY = frontMountY - frontWheel.y;

    const rearForceX = -this.springStiffness * rearDeltaX * 0.45;
    const rearForceY = -this.springStiffness * rearDeltaY * 0.45;

    const frontForceX = -this.springStiffness * frontDeltaX * 0.45;
    const frontForceY = -this.springStiffness * frontDeltaY * 0.45;

    // Chassis linear acceleration
    const totalForceX = rearForceX + frontForceX;
    const totalForceY = rearForceY + frontForceY + this.config.mass * gravity * 0.001;

    const invMass = 1.0 / (this.config.mass * 0.05);
    chassis.vx += totalForceX * invMass * dt;
    chassis.vy += totalForceY * invMass * dt;

    // Apply air drag
    chassis.vx *= 0.9995;
    chassis.vy *= 0.9995;

    chassis.x += chassis.vx * dt;
    chassis.y += chassis.vy * dt;

    // 6. Chassis Torque & Angular Velocity
    // Torque from suspension attachments around chassis center of mass
    const rRearX = rearMountX - chassis.x;
    const rRearY = rearMountY - chassis.y;
    const torqueRear = rRearX * rearForceY - rRearY * rearForceX;

    const rFrontX = frontMountX - chassis.x;
    const rFrontY = frontMountY - chassis.y;
    const torqueFront = rFrontX * frontForceY - rFrontY * frontForceX;

    let totalTorque = torqueRear + torqueFront;

    // Airborne pitch control input
    if (this.state.isAirborne) {
      if (inputs.accelerate) {
        // Gas rotates counter-clockwise (nose up, flips backward)
        totalTorque -= this.config.airControlTorque * 2200;
      }
      if (inputs.brake) {
        // Brake rotates clockwise (nose down, flips forward)
        totalTorque += this.config.airControlTorque * 2200;
      }
    }

    const rotationalInertia = (1 / 12) * this.config.mass * (this.config.chassisWidth ** 2 + this.config.chassisHeight ** 2) * 0.008;
    const angularAcc = totalTorque / rotationalInertia;
    chassis.angularVelocity += angularAcc * dt;

    // Angular damping
    chassis.angularVelocity *= 0.985;
    chassis.angle += chassis.angularVelocity * dt;

    // Keep wheels attached within suspension bounds to chassis
    this.constrainWheelToChassis(rearWheel, rearMountX, rearMountY);
    this.constrainWheelToChassis(frontWheel, frontMountX, frontMountY);
  }

  private resolveWheelPhysics(
    wheel: WheelPhysicsState,
    mountX: number,
    mountY: number,
    upX: number,
    upY: number,
    inputs: VehicleInputs,
    isDriveWheel: boolean,
    dt: number,
    gravity: number
  ): void {
    // 1. Gravity on wheel
    wheel.vy += gravity * dt;
    wheel.x += wheel.vx * dt;
    wheel.y += wheel.vy * dt;

    // 2. Ground collision against continuous terrain surface
    const groundY = this.terrain.getHeight(wheel.x);
    const penetration = (wheel.y + wheel.radius) - groundY;

    if (penetration > 0) {
      // Wheel is contacting or penetrating ground
      wheel.onGround = true;
      wheel.y = groundY - wheel.radius; // Rest on surface

      const { nx, ny } = this.terrain.getNormal(wheel.x);
      wheel.groundNormalX = nx;
      wheel.groundNormalY = ny;

      // Relative velocity into ground normal
      const normalVel = wheel.vx * nx + wheel.vy * ny;
      if (normalVel < 0) {
        // Cancel velocity into ground + slight restitution
        wheel.vx -= normalVel * nx * 1.1;
        wheel.vy -= normalVel * ny * 1.1;
      }

      // Ground tangent vector: perpendicular to normal (pointing forward)
      const tx = -ny;
      const ty = nx;

      // Tangential velocity along surface
      const tangentVel = wheel.vx * tx + wheel.vy * ty;

      // Engine Drive Force / Traction
      let driveForce = 0;
      if (isDriveWheel && inputs.accelerate) {
        driveForce = this.enginePower;
      } else if (inputs.brake) {
        driveForce = -this.enginePower * 0.75;
      }

      // Apply tractive force along ground slope
      const maxGrip = this.tireGrip * 900;
      const appliedForce = Math.max(-maxGrip, Math.min(maxGrip, driveForce));

      wheel.vx += appliedForce * tx * dt;
      wheel.vy += appliedForce * ty * dt;

      // Rolling friction & traction damping
      wheel.vx *= 0.982;
      wheel.vy *= 0.982;

      // Wheel rotation visual angle
      wheel.angularVelocity = tangentVel / wheel.radius;
      wheel.angle += wheel.angularVelocity * dt;
    } else {
      wheel.onGround = false;
      // Free wheel in air
      if (inputs.accelerate) {
        wheel.angularVelocity += 35 * dt;
      } else if (inputs.brake) {
        wheel.angularVelocity *= 0.92;
      } else {
        wheel.angularVelocity *= 0.995;
      }
      wheel.angle += wheel.angularVelocity * dt;
    }
  }

  private constrainWheelToChassis(wheel: WheelPhysicsState, mountX: number, mountY: number): void {
    const dx = wheel.x - mountX;
    const dy = wheel.y - mountY;
    const dist = Math.hypot(dx, dy);
    const maxLen = this.config.suspensionRestLength + this.config.maxSuspensionTravel;
    const minLen = Math.max(10, this.config.suspensionRestLength - this.config.maxSuspensionTravel);

    if (dist > maxLen) {
      const factor = maxLen / dist;
      wheel.x = mountX + dx * factor;
      wheel.y = mountY + dy * factor;
      wheel.compression = 0;
    } else if (dist < minLen) {
      const factor = minLen / dist;
      wheel.x = mountX + dx * factor;
      wheel.y = mountY + dy * factor;
      wheel.compression = 1.0;
    } else {
      wheel.compression = Math.max(0, Math.min(1, (this.config.suspensionRestLength - dist + this.config.maxSuspensionTravel) / (this.config.maxSuspensionTravel * 2)));
    }
  }

  private checkCrashConditions(): void {
    const { chassis } = this.state;
    // Driver head position: top center of chassis
    const cosA = Math.cos(chassis.angle);
    const sinA = Math.sin(chassis.angle);
    // Head offset: upwards (negative Y)
    const headX = chassis.x + sinA * (this.config.chassisHeight * 0.7);
    const headY = chassis.y - cosA * (this.config.chassisHeight * 0.7);

    const terrainYAtHead = this.terrain.getHeight(headX);

    // If driver's head hits ground while vehicle is upside down (angle roughly inverted)
    const normalizedAngle = Math.abs(Math.atan2(Math.sin(chassis.angle), Math.cos(chassis.angle)));
    const isUpsideDown = normalizedAngle > Math.PI * 0.55;

    if (headY >= terrainYAtHead && isUpsideDown) {
      this.state.isCrashed = true;
      this.state.crashReason = 'driver_hit';
    }
  }

  private updateCrashTumble(dt: number): void {
    // Tumble to a stop
    const { chassis, rearWheel, frontWheel } = this.state;
    const gravity = this.env.gravity * 38;

    chassis.vy += gravity * dt;
    chassis.x += chassis.vx * dt;
    chassis.y += chassis.vy * dt;

    const groundY = this.terrain.getHeight(chassis.x);
    if (chassis.y > groundY - 10) {
      chassis.y = groundY - 10;
      chassis.vx *= 0.85;
      chassis.vy *= -0.3;
      chassis.angularVelocity *= 0.8;
    }

    chassis.angle += chassis.angularVelocity * dt;

    rearWheel.x += rearWheel.vx * dt;
    rearWheel.y += rearWheel.vy * dt;
    frontWheel.x += frontWheel.vx * dt;
    frontWheel.y += frontWheel.vy * dt;
  }

  triggerOutOfFuelCrash(): void {
    this.state.isCrashed = true;
    this.state.crashReason = 'out_of_fuel';
  }

  reset(spawnX = 60): void {
    this.recalculateUpgrades();
    this.state = this.createInitialState(spawnX);
    this.previousAngle = 0;
    this.totalAirRotation = 0;
    this.completedFlipsThisJump = 0;
    this.justLanded = false;
    this.landingImpactSpeed = 0;
  }
}
