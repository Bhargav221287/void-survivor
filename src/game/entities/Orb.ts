import { SpatialEntity } from "../spatial-grid";
import { OrbType } from "../types";

export class Orb implements SpatialEntity {
  public id: number;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number;
  public type: OrbType;
  public value: number;
  public pulseTimer: number = Math.random() * Math.PI * 2;

  constructor(id: number, x: number, y: number, type: OrbType = "xp", value: number = 1) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value;
    this.radius = type === "xp" ? 5 : 7;
  }

  public update(dt: number, playerX: number, playerY: number, magnetRadius: number): boolean {
    this.pulseTimer += dt * 4;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distSq = dx * dx + dy * dy;

    // Attract to player if within magnetic collection radius
    if (distSq < magnetRadius * magnetRadius) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.001) {
        // Accelerate smoothly towards player
        const speed = Math.min(500, (1 - dist / magnetRadius) * 450 + 150);
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
      }
    } else {
      // Natural dampening when out of range
      this.vx *= Math.max(0, 1 - dt * 4);
      this.vy *= Math.max(0, 1 - dt * 4);
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    return true;
  }

  public render(ctx: CanvasRenderingContext2D, colorblindMode: boolean = false): void {
    ctx.save();
    const pulse = Math.sin(this.pulseTimer) * 1.5;
    const currentRadius = Math.max(2, this.radius + pulse);

    if (this.type === "xp") {
      const color = colorblindMode ? "#38bdf8" : "#06b6d4"; // Cyan / Sky
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fill();

      // Gleam core
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      // Heal drop (distinct cross icon inside green / high-contrast emerald orb)
      const color = colorblindMode ? "#fbbf24" : "#10b981"; // Gold or Emerald
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius + 1, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fill();

      // White cross inside
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(this.x - 3, this.y);
      ctx.lineTo(this.x + 3, this.y);
      ctx.moveTo(this.x, this.y - 3);
      ctx.lineTo(this.x, this.y + 3);
      ctx.stroke();
    }

    ctx.restore();
  }
}
