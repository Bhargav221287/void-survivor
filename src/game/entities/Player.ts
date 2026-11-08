import { SpatialEntity } from "../spatial-grid";
import { PlayerStats, InputState } from "../types";
import { Projectile } from "./Projectile";

export class Player implements SpatialEntity {
  public id: string = "player";
  public x: number;
  public y: number;
  public radius: number = 14;
  public stats: PlayerStats;
  public aimAngle: number = 0;
  public fireTimer: number = 0;
  public blinkTimer: number = 0;
  public arenaWidth: number;
  public arenaHeight: number;

  constructor(startX: number, startY: number, initialHp: number, arenaWidth: number, arenaHeight: number) {
    this.x = startX;
    this.y = startY;
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;

    this.stats = {
      hp: initialHp,
      maxHp: initialHp,
      speed: 240, // Base pixels per second
      fireRate: 4.0, // 4 shots per second
      damage: 10,
      bulletCount: 1,
      pierce: 0,
      magnetRadius: 100,
      hasShield: false,
      shieldActive: false,
      shieldCooldownMax: 14,
      shieldCooldownCurrent: 0,
      hasDrone: false,
      droneAngle: 0,
      droneFireTimer: 0,
      nanoRepairTimer: 0,
      invulnerabilityTimer: 0,
    };
  }

  public resizeArena(width: number, height: number): void {
    this.arenaWidth = width;
    this.arenaHeight = height;
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
  }

  public takeDamage(): { absorbed: boolean; died: boolean } {
    if (this.stats.invulnerabilityTimer > 0) {
      return { absorbed: false, died: false };
    }

    if (this.stats.shieldActive) {
      this.stats.shieldActive = false;
      this.stats.shieldCooldownCurrent = this.stats.shieldCooldownMax;
      this.stats.invulnerabilityTimer = 0.8;
      return { absorbed: true, died: false };
    }

    this.stats.hp -= 1;
    this.stats.invulnerabilityTimer = 1.0;

    if (this.stats.hp <= 0) {
      return { absorbed: false, died: true };
    }

    return { absorbed: false, died: false };
  }

  public heal(amount: number = 1): void {
    this.stats.hp = Math.min(this.stats.hp + amount, this.stats.maxHp);
  }

  public update(
    dt: number,
    input: InputState,
    autoAimTarget: { x: number; y: number } | null,
    spawnProjectile: (p: Projectile, isDrone?: boolean) => void,
    droneTarget: { x: number; y: number } | null
  ): void {
    // 1. Invulnerability timer countdown
    if (this.stats.invulnerabilityTimer > 0) {
      this.stats.invulnerabilityTimer -= dt;
      this.blinkTimer += dt * 20;
    }

    // 2. Shield recharge
    if (this.stats.hasShield && !this.stats.shieldActive) {
      this.stats.shieldCooldownCurrent -= dt;
      if (this.stats.shieldCooldownCurrent <= 0) {
        this.stats.shieldActive = true;
        this.stats.shieldCooldownCurrent = 0;
      }
    }

    // 3. Nano repair
    if (this.stats.nanoRepairTimer >= 0 && this.stats.hp < this.stats.maxHp) {
      this.stats.nanoRepairTimer += dt;
      if (this.stats.nanoRepairTimer >= 25) {
        this.heal(1);
        this.stats.nanoRepairTimer = 0;
      }
    }

    // 4. Movement handling
    let moveX = 0;
    let moveY = 0;

    if (input.joystickActive && (input.joystickDirX !== 0 || input.joystickDirY !== 0)) {
      moveX = input.joystickDirX;
      moveY = input.joystickDirY;
    } else {
      if (input.up) moveY -= 1;
      if (input.down) moveY += 1;
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;

      // Normalize keyboard vector
      const mag = Math.sqrt(moveX * moveX + moveY * moveY);
      if (mag > 0.001) {
        moveX /= mag;
        moveY /= mag;
      }
    }

    this.x += moveX * this.stats.speed * dt;
    this.y += moveY * this.stats.speed * dt;

    // Clamp inside arena bounds
    this.x = Math.max(this.radius, Math.min(this.arenaWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(this.arenaHeight - this.radius, this.y));

    // 5. Aiming
    if (autoAimTarget) {
      this.aimAngle = Math.atan2(autoAimTarget.y - this.y, autoAimTarget.x - this.x);
    } else {
      this.aimAngle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
    }

    // 6. Firing
    this.fireTimer -= dt;
    const fireInterval = 1 / this.stats.fireRate;

    if (input.shooting && this.fireTimer <= 0) {
      this.fireTimer = fireInterval;
      this.fireWeapons(spawnProjectile);
    }

    // 7. Support Drone logic
    if (this.stats.hasDrone) {
      this.stats.droneAngle += dt * 3.0; // Rotate orbit
      this.stats.droneFireTimer -= dt;

      if (this.stats.droneFireTimer <= 0 && droneTarget) {
        this.stats.droneFireTimer = 0.65;
        const droneX = this.x + Math.cos(this.stats.droneAngle) * 36;
        const droneY = this.y + Math.sin(this.stats.droneAngle) * 36;
        const targetAngle = Math.atan2(droneTarget.y - droneY, droneTarget.x - droneX);
        const droneSpeed = 480;

        spawnProjectile(
          new Projectile(
            Math.random() * 1000000,
            droneX,
            droneY,
            Math.cos(targetAngle) * droneSpeed,
            Math.sin(targetAngle) * droneSpeed,
            this.stats.damage * 0.65,
            0,
            false,
            3.5,
            "#38bdf8",
            2.0
          ),
          true
        );
      }
    }
  }

  private fireWeapons(spawnProjectile: (p: Projectile) => void): void {
    const projSpeed = 520;
    const baseDamage = this.stats.damage;
    const count = this.stats.bulletCount;

    // Calculate spread angle distribution
    const spreadStep = 0.16; // ~9 degrees
    const startAngle = this.aimAngle - ((count - 1) * spreadStep) / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadStep;
      const muzzleDist = this.radius + 6;
      const spawnX = this.x + Math.cos(this.aimAngle) * muzzleDist;
      const spawnY = this.y + Math.sin(this.aimAngle) * muzzleDist;

      spawnProjectile(
        new Projectile(
          Math.random() * 1000000,
          spawnX,
          spawnY,
          Math.cos(angle) * projSpeed,
          Math.sin(angle) * projSpeed,
          baseDamage,
          this.stats.pierce,
          false,
          4.5,
          "#38bdf8",
          2.2
        )
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D, colorblindMode: boolean = false): void {
    ctx.save();

    // Blinking during invulnerability
    if (this.stats.invulnerabilityTimer > 0 && Math.sin(this.blinkTimer) > 0) {
      ctx.globalAlpha = 0.35;
    }

    ctx.translate(this.x, this.y);

    // Shield forcefield bubble
    if (this.stats.shieldActive) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 9, 0, Math.PI * 2);
      ctx.strokeStyle = colorblindMode ? "#60a5fa" : "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#38bdf8";
      ctx.stroke();

      ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
      ctx.fill();
    }

    // Support drone
    if (this.stats.hasDrone) {
      const droneDist = 36;
      const droneX = Math.cos(this.stats.droneAngle) * droneDist;
      const droneY = Math.sin(this.stats.droneAngle) * droneDist;

      ctx.save();
      ctx.translate(droneX, droneY);
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#38bdf8";
      ctx.fill();

      // Drone orbit trail
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    }

    // Ship body rotation
    ctx.rotate(this.aimAngle);

    // Sleek fighter hull
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.4, 0); // Nose tip
    ctx.lineTo(-this.radius * 0.9, -this.radius * 0.9); // Left wing
    ctx.lineTo(-this.radius * 0.4, 0); // Engine recess
    ctx.lineTo(-this.radius * 0.9, this.radius * 0.9); // Right wing
    ctx.closePath();

    ctx.fillStyle = "#0f172a"; // Deep space hull
    ctx.fill();

    ctx.strokeStyle = colorblindMode ? "#93c5fd" : "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#38bdf8";
    ctx.stroke();

    // Cockpit glow
    ctx.beginPath();
    ctx.arc(this.radius * 0.2, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Twin weapon barrels
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(this.radius * 0.8, -this.radius * 0.6, 5, 2);
    ctx.fillRect(this.radius * 0.8, this.radius * 0.6 - 2, 5, 2);

    ctx.restore();
  }
}
