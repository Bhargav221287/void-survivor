export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 400;

  public setReducedMotion(reduced: boolean): void {
    this.maxParticles = reduced ? 120 : 400;
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      // Decelerate slightly
      p.vx *= Math.max(0, 1 - dt * 2);
      p.vy *= Math.max(0, 1 - dt * 2);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * p.alpha), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public spawnExplosion(x: number, y: number, color: string, count: number = 16, isLarge: boolean = false): void {
    const finalCount = Math.min(count, this.maxParticles - this.particles.length);
    const speedBase = isLarge ? 280 : 180;
    const sizeBase = isLarge ? 5 : 3.5;

    for (let i = 0; i < finalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedBase + 40;
      const life = Math.random() * 0.4 + (isLarge ? 0.4 : 0.25);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * sizeBase + 1.5,
        color,
        alpha: 1,
        life,
        maxLife: life,
      });
    }
  }

  public spawnSparks(x: number, y: number, normalAngle: number, count: number = 6): void {
    const finalCount = Math.min(count, this.maxParticles - this.particles.length);
    for (let i = 0; i < finalCount; i++) {
      const angle = normalAngle + (Math.random() - 0.5) * 1.2;
      const speed = Math.random() * 140 + 60;
      const life = Math.random() * 0.18 + 0.1;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        color: "#fef08a",
        alpha: 1,
        life,
        maxLife: life,
      });
    }
  }

  public spawnTrail(x: number, y: number, vx: number, vy: number, color: string): void {
    if (this.particles.length >= this.maxParticles) return;
    const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 0.6;
    const speed = Math.random() * 40 + 20;
    const life = Math.random() * 0.18 + 0.08;

    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2.5 + 1.2,
      color,
      alpha: 0.8,
      life,
      maxLife: life,
    });
  }

  public spawnNova(x: number, y: number, color: string): void {
    const count = Math.min(36, this.maxParticles - this.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 220;
      const life = 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3.5,
        color,
        alpha: 1,
        life,
        maxLife: life,
      });
    }
  }

  public clear(): void {
    this.particles = [];
  }
}
