import { SpatialEntity } from "../spatial-grid";
import { EnemyType } from "../types";
import { Projectile } from "./Projectile";

export class Enemy implements SpatialEntity {
  public id: number;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public type: EnemyType;
  public isElite: boolean;
  public xpValue: number;
  public hitFlashTimer: number = 0;
  public shootTimer: number = 0;
  public rotation: number = 0;

  // Boss specific
  public bossPhase: 1 | 2 = 1;
  public bossAttackTimer: number = 0;
  public bossRadialAngle: number = 0;

  constructor(
    id: number,
    x: number,
    y: number,
    type: EnemyType,
    hp: number,
    speed: number,
    xpValue: number = 1,
    isElite: boolean = false
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.xpValue = xpValue;
    this.isElite = isElite;

    // Define radius and shoot cadence by type
    switch (type) {
      case "chaser":
        this.radius = isElite ? 16 : 11;
        break;
      case "tank":
        this.radius = isElite ? 26 : 20;
        break;
      case "shooter":
        this.radius = isElite ? 18 : 13;
        this.shootTimer = 1.2 + Math.random() * 0.8;
        break;
      case "boss":
        this.radius = 42;
        this.bossAttackTimer = 1.5;
        break;
    }
  }

  public takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.hitFlashTimer = 0.12;

    if (this.type === "boss" && this.bossPhase === 1 && this.hp <= this.maxHp * 0.5) {
      this.bossPhase = 2; // Transition to Enraged phase
      this.speed *= 1.25;
    }

    return this.hp <= 0;
  }

  /**
   * Updates enemy position and AI behaviors. Returns new projectiles or minion requests if fired.
   */
  public update(
    dt: number,
    playerX: number,
    playerY: number,
    createProjectile: (p: Projectile) => void,
    spawnMinion?: (x: number, y: number) => void
  ): void {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.rotation = Math.atan2(dy, dx);

    if (this.type === "chaser") {
      // Direct aggressive swarm
      if (dist > 0.001) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      }
    } else if (this.type === "tank") {
      // Slow relentless juggernaut with slight steering inertia
      if (dist > 0.001) {
        const targetVx = (dx / dist) * this.speed;
        const targetVy = (dy / dist) * this.speed;
        this.vx += (targetVx - this.vx) * Math.min(1, dt * 2);
        this.vy += (targetVy - this.vy) * Math.min(1, dt * 2);
      }
    } else if (this.type === "shooter") {
      // Maintain distance ~240px from player and orbit
      const desiredDist = 240;
      if (dist > desiredDist + 30) {
        // Approach
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      } else if (dist < desiredDist - 30) {
        // Back away
        this.vx = -(dx / dist) * this.speed;
        this.vy = -(dy / dist) * this.speed;
      } else {
        // Orbit perpendicularly
        this.vx = (-dy / dist) * this.speed * 0.7;
        this.vy = (dx / dist) * this.speed * 0.7;
      }

      // Firing timer
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 2.0;
        const projSpeed = 190;
        const angle = Math.atan2(dy, dx);
        const proj = new Projectile(
          Math.random() * 1000000,
          this.x + Math.cos(angle) * (this.radius + 6),
          this.y + Math.sin(angle) * (this.radius + 6),
          Math.cos(angle) * projSpeed,
          Math.sin(angle) * projSpeed,
          1,
          0,
          true,
          5,
          "#f43f5e", // Crimson enemy laser
          3.5
        );
        createProjectile(proj);
      }
    } else if (this.type === "boss") {
      // Multi-phase boss logic
      this.bossRadialAngle += dt * (this.bossPhase === 2 ? 2.5 : 1.2);

      // Follow player slowly
      if (dist > 180) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      } else {
        this.vx *= 0.9;
        this.vy *= 0.9;
      }

      this.bossAttackTimer -= dt;
      if (this.bossAttackTimer <= 0) {
        if (this.bossPhase === 1) {
          this.bossAttackTimer = 2.0;
          // 5-way aimed spread barrage
          const baseAngle = Math.atan2(dy, dx);
          const spreadAngles = [-0.35, -0.17, 0, 0.17, 0.35];
          const projSpeed = 210;

          spreadAngles.forEach((offset) => {
            const angle = baseAngle + offset;
            createProjectile(
              new Projectile(
                Math.random() * 1000000,
                this.x + Math.cos(angle) * (this.radius + 10),
                this.y + Math.sin(angle) * (this.radius + 10),
                Math.cos(angle) * projSpeed,
                Math.sin(angle) * projSpeed,
                1,
                0,
                true,
                6,
                "#ec4899", // Magenta plasma
                4.0
              )
            );
          });
        } else {
          // Phase 2: Enraged radial spiral attack + spawn minions
          this.bossAttackTimer = 1.4;
          const bulletCount = 8;
          const projSpeed = 230;

          for (let i = 0; i < bulletCount; i++) {
            const angle = this.bossRadialAngle + (i * Math.PI * 2) / bulletCount;
            createProjectile(
              new Projectile(
                Math.random() * 1000000,
                this.x + Math.cos(angle) * (this.radius + 10),
                this.y + Math.sin(angle) * (this.radius + 10),
                Math.cos(angle) * projSpeed,
                Math.sin(angle) * projSpeed,
                1,
                0,
                true,
                6,
                "#a855f7", // Deep purple rage plasma
                4.0
              )
            );
          }

          if (spawnMinion && Math.random() < 0.4) {
            spawnMinion(this.x + (Math.random() - 0.5) * 60, this.y + (Math.random() - 0.5) * 60);
          }
        }
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  /**
   * Renders enemy with distinct geometric silhouette and hit flash.
   */
  public render(ctx: CanvasRenderingContext2D, colorblindMode: boolean = false): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const isFlashing = this.hitFlashTimer > 0;

    if (this.isElite) {
      // Golden / cyan elite aura
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = colorblindMode ? "#38bdf8" : "#fbbf24";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isFlashing) {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#ffffff";
    } else {
      if (this.type === "chaser") {
        ctx.fillStyle = colorblindMode ? "#e11d48" : "#ef4444"; // Triangle
        ctx.strokeStyle = "#fda4af";
      } else if (this.type === "tank") {
        ctx.fillStyle = colorblindMode ? "#4f46e5" : "#6366f1"; // Hexagon / Box
        ctx.strokeStyle = "#c7d2fe";
      } else if (this.type === "shooter") {
        ctx.fillStyle = colorblindMode ? "#d97706" : "#10b981"; // Diamond
        ctx.strokeStyle = "#a7f3d0";
      } else {
        // Boss
        ctx.fillStyle = this.bossPhase === 2 ? "#b91c1c" : "#7c3aed";
        ctx.strokeStyle = "#f472b6";
      }
    }

    ctx.lineWidth = 2;

    // Distinct silhouettes
    if (this.type === "chaser") {
      // Sharp sleek triangle pointing right
      ctx.beginPath();
      ctx.moveTo(this.radius * 1.3, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.85);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.lineTo(-this.radius, this.radius * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === "tank") {
      // Heavy armored hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = Math.cos(angle) * this.radius;
        const hy = Math.sin(angle) * this.radius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Armor plating lines
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === "shooter") {
      // Diamond sniper
      ctx.beginPath();
      ctx.moveTo(this.radius * 1.2, 0);
      ctx.lineTo(0, -this.radius);
      ctx.lineTo(-this.radius * 0.8, 0);
      ctx.lineTo(0, this.radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sniper eye
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else if (this.type === "boss") {
      // Massive dreadnought fortress with rotating ring
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const bx = Math.cos(angle) * this.radius;
        const by = Math.sin(angle) * this.radius;
        if (i === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rotating spikes / shields
      ctx.save();
      ctx.rotate(this.bossRadialAngle);
      ctx.strokeStyle = this.bossPhase === 2 ? "#ef4444" : "#ec4899";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.setLineDash([12, 12]);
      ctx.stroke();
      ctx.restore();

      // Central core
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = this.bossPhase === 2 ? "#ff0044" : "#06b6d4";
      ctx.fill();
    }

    ctx.restore();

    // Floating HP bar for Boss and Tank
    if ((this.type === "boss" || this.type === "tank" || this.isElite) && this.hp < this.maxHp) {
      this.renderHpBar(ctx);
    }
  }

  private renderHpBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = this.radius * 2.2;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.radius - 12;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? "#10b981" : hpRatio > 0.25 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.restore();
  }
}

