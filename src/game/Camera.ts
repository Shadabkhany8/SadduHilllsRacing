export class Camera {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 1.0;
  private targetX: number = 0;
  private targetY: number = 0;
  private targetZoom: number = 1.0;

  constructor(initialX = 60, initialY = 280) {
    this.x = initialX;
    this.y = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
  }

  update(
    vehicleX: number,
    vehicleY: number,
    vehicleVx: number,
    vehicleVy: number,
    viewportWidth: number,
    viewportHeight: number,
    dt = 1 / 60
  ): void {
    // 1. Vehicle placement: center-left (approx 28% from screen left)
    // In world coordinates, camera focus point is ahead of the vehicle
    const leadDistance = Math.min(viewportWidth * 0.22, vehicleVx * 0.35);
    this.targetX = vehicleX + leadDistance;

    // 2. Vertical tracking: keep vehicle around 62% screen height
    const verticalLead = Math.max(-120, Math.min(120, vehicleVy * 0.2));
    this.targetY = vehicleY + verticalLead;

    // 3. Dynamic zoom: subtle zoom out at high speed
    const speed = Math.hypot(vehicleVx, vehicleVy);
    const speedRatio = Math.min(1.0, speed / 650);
    this.targetZoom = 1.0 - speedRatio * 0.12; // zooms from 1.0 to 0.88

    // 4. Smooth exponential camera interpolation (lerp)
    const lerpFactor = 1.0 - Math.exp(-9.5 * dt);
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;
    this.zoom += (this.targetZoom - this.zoom) * (lerpFactor * 0.5);
  }

  /**
   * Transforms world coordinates into screen pixel coordinates.
   */
  toScreen(
    worldX: number,
    worldY: number,
    viewportWidth: number,
    viewportHeight: number
  ): { x: number; y: number } {
    // Offset vehicle to ~28% from screen left and ~62% from top
    const screenCenterX = viewportWidth * 0.28;
    const screenCenterY = viewportHeight * 0.62;

    const x = screenCenterX + (worldX - this.x) * this.zoom;
    const y = screenCenterY + (worldY - this.y) * this.zoom;
    return { x, y };
  }

  /**
   * Inverse transformation from screen pixels to world coordinates.
   */
  toWorld(
    screenX: number,
    screenY: number,
    viewportWidth: number,
    viewportHeight: number
  ): { x: number; y: number } {
    const screenCenterX = viewportWidth * 0.28;
    const screenCenterY = viewportHeight * 0.62;

    const x = this.x + (screenX - screenCenterX) / this.zoom;
    const y = this.y + (screenY - screenCenterY) / this.zoom;
    return { x, y };
  }

  reset(initialX = 60, initialY = 280): void {
    this.x = initialX;
    this.y = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }
}
