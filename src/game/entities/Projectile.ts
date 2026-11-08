import { SpatialEntity } from "../spatial-grid";

export class Projectile implements SpatialEntity {
  public id: number;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public damage: number;
  public pierceRemaining: number;
  public isEnemy: boolean;
  public color: string;
  public life: number;
  public maxLife: number;

  constructor(
    id: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    pierce: number = 0,
    isEnemy: boolean = false,
    radius: number = 4,
    color: string = "#38bdf8",
    maxLife: number = 2.2
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.pierceRemaining = pierce;
    this.isEnemy = isEnemy;
    this.radius = radius;
    this.color = color;
    this.life = maxLife;
    this.maxLife = maxLife;
  }

  public update(dt: number): boolean {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.isEnemy ? 8 : 12;
    ctx.shadowColor = this.color;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(1, this.radius * 0.45), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  }
}
