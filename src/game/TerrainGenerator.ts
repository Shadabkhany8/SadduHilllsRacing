import { Collectible, EnvironmentConfig } from '@/types/game';

export interface TerrainPoint {
  x: number;
  y: number;
}

export interface TerrainSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  slope: number;
}

export class TerrainGenerator {
  private env: EnvironmentConfig;
  private seed: number;
  private collectibles: Map<string, Collectible> = new Map();
  private lastGeneratedChunkIndex = -1;
  private chunkSize = 600; // in world coordinate units

  constructor(env: EnvironmentConfig, seed = 42) {
    this.env = env;
    this.seed = seed;
    this.initStartingChunks();
  }

  setEnvironment(env: EnvironmentConfig, seed = Math.floor(Math.random() * 10000)): void {
    this.env = env;
    this.seed = seed;
    this.collectibles.clear();
    this.lastGeneratedChunkIndex = -1;
    this.initStartingChunks();
  }

  private initStartingChunks(): void {
    // Pre-generate initial 4 chunks (0 to 2400 units)
    for (let c = 0; c < 4; c++) {
      this.generateChunkCollectibles(c);
    }
    this.lastGeneratedChunkIndex = 3;
  }

  /**
   * Continuous smooth height function y(x) in game coordinate space.
   * Game coordinates: X goes positive to the right, Y goes positive DOWNWARDS.
   * Higher Y values mean lower terrain (valleys), lower Y values mean higher terrain (peaks/hills).
   */
  getHeight(x: number): number {
    if (x < 0) {
      // Gentle flat starting zone for first 60 units
      return this.env.baseHeight;
    }

    const { wavelength, amplitude, steepnessFactor, roughness, baseHeight } = this.env;
    
    // Distance-based difficulty multiplier (increases up to 1.6x over 2500m)
    const distFactor = 1.0 + Math.min(x / 2500, 0.6);
    const amp = amplitude * steepnessFactor * distFactor;

    // Harmonic wave components
    const w1 = wavelength;
    const w2 = wavelength * 0.48;
    const w3 = wavelength * 0.22;
    const w4 = wavelength * 0.08;

    const s = this.seed;
    const wave1 = Math.sin((x + s * 17) / w1) * amp * 0.65;
    const wave2 = Math.sin((x + s * 31) / w2 + 1.2) * amp * 0.28;
    const wave3 = Math.cos((x + s * 47) / w3 + 2.1) * amp * 0.12 * roughness * 5;
    const wave4 = Math.sin((x + s * 73) / w4) * amp * 0.05 * roughness * 5;

    // Smooth entry transition from flat spawn plateau (x = 0..80)
    const entryBlend = Math.min(1.0, Math.max(0, (x - 40) / 80));

    return baseHeight + (wave1 + wave2 + wave3 + wave4) * entryBlend;
  }

  /**
   * Analytical derivative y'(x) for exact slope angle and continuous normal vector.
   */
  getSlope(x: number): number {
    const delta = 1.0;
    const y1 = this.getHeight(x - delta);
    const y2 = this.getHeight(x + delta);
    return (y2 - y1) / (delta * 2);
  }

  /**
   * Returns outward surface normal unit vector pointing UP into the air.
   * Since Y is down, upward normal has negative Y component!
   */
  getNormal(x: number): { nx: number; ny: number; angle: number } {
    const slope = this.getSlope(x);
    // Tangent vector: (1, slope)
    // Upward normal vector: (-slope, -1) normalized
    const len = Math.sqrt(slope * slope + 1);
    const nx = -slope / len;
    const ny = -1 / len;
    const angle = Math.atan2(slope, 1);
    return { nx, ny, angle };
  }

  /**
   * Ensures chunks ahead of vehicle are generated and cleans up distant behind chunks.
   */
  updateChunks(vehicleX: number): void {
    const currentChunk = Math.floor(vehicleX / this.chunkSize);
    const targetChunk = currentChunk + 3;

    while (this.lastGeneratedChunkIndex < targetChunk) {
      this.lastGeneratedChunkIndex += 1;
      this.generateChunkCollectibles(this.lastGeneratedChunkIndex);
    }

    // Cleanup collectibles more than 1200 units behind vehicle
    const minX = vehicleX - 1200;
    for (const [id, item] of this.collectibles.entries()) {
      if (item.x < minX) {
        this.collectibles.delete(id);
      }
    }
  }

  private generateChunkCollectibles(chunkIndex: number): void {
    if (chunkIndex === 0) {
      // First chunk: spawn a few beginner coins, no fuel needed yet
      this.spawnCoinArc(120, 4, 30);
      this.spawnCoinArc(320, 5, 28);
      return;
    }

    const chunkStartX = chunkIndex * this.chunkSize;
    const chunkEndX = chunkStartX + this.chunkSize;

    // 1. Guaranteed Fuel Canister in every chunk (spaced 450 - 650 units apart)
    const fuelX = chunkStartX + 180 + ((this.seed * 23 + chunkIndex * 71) % 220);
    const fuelY = this.getHeight(fuelX) - 34; // floats just above surface
    const fuelId = `fuel_${chunkIndex}`;
    this.collectibles.set(fuelId, {
      id: fuelId,
      type: 'fuel',
      x: fuelX,
      y: fuelY,
      value: 100, // Restores fuel
      radius: 18,
      collected: false,
      collectionProgress: 0,
    });

    // 2. Coin patterns: 2-3 arcs or lines per chunk
    const coinPattern1X = chunkStartX + 60;
    this.spawnCoinArc(coinPattern1X, 4, 25);

    const coinPattern2X = fuelX + 130;
    if (coinPattern2X + 120 < chunkEndX) {
      this.spawnCoinArc(coinPattern2X, 5, 26);
    }
  }

  private spawnCoinArc(startX: number, count: number, spacing: number): void {
    for (let i = 0; i < count; i++) {
      const cx = startX + i * spacing;
      // Arc height: coins follow hill surface with parabolic jump arch
      const arcOffset = Math.sin((i / (count - 1)) * Math.PI) * 28;
      const cy = this.getHeight(cx) - 24 - arcOffset;
      const coinId = `coin_${Math.round(cx)}_${Math.round(cy)}`;
      
      this.collectibles.set(coinId, {
        id: coinId,
        type: 'coin',
        x: cx,
        y: cy,
        value: 10,
        radius: 12,
        collected: false,
        collectionProgress: 0,
      });
    }
  }

  /**
   * Generates polyline terrain points within the requested range for rendering.
   */
  getTerrainPoints(startX: number, endX: number, step = this.env.terrainStep): TerrainPoint[] {
    const points: TerrainPoint[] = [];
    // Align start to step
    const alignedStart = Math.floor(startX / step) * step;
    for (let x = alignedStart; x <= endX + step; x += step) {
      points.push({ x, y: this.getHeight(x) });
    }
    return points;
  }

  /**
   * Returns all active collectibles in range.
   */
  getCollectiblesInRange(minX: number, maxX: number): Collectible[] {
    const list: Collectible[] = [];
    for (const item of this.collectibles.values()) {
      if (item.x >= minX && item.x <= maxX) {
        list.push(item);
      }
    }
    return list;
  }

  collectItem(id: string): Collectible | null {
    const item = this.collectibles.get(id);
    if (item && !item.collected) {
      item.collected = true;
      return item;
    }
    return null;
  }
}
