import { DifficultyLevel, getDifficultyConfig, scaleEnemyStats, calculateScore } from "./difficulty";
import { GameState, InputState, GameScoreState, UpgradeDefinition, UpgradeId, GameSettings } from "./types";
import { SpatialHashGrid } from "./spatial-grid";
import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { Projectile } from "./entities/Projectile";
import { Orb } from "./entities/Orb";
import { ParticleSystem } from "./entities/Particle";
import { soundManager } from "./sound";
import { getRandomUpgrades, applyUpgrade, UPGRADE_CATALOG } from "./upgrades";

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public state: GameState = "menu";
  public difficulty: DifficultyLevel = "normal";

  // Simulation entities
  public player: Player;
  public enemies: Enemy[] = [];
  public playerProjectiles: Projectile[] = [];
  public enemyProjectiles: Projectile[] = [];
  public orbs: Orb[] = [];
  public particles: ParticleSystem = new ParticleSystem();
  public spatialGrid: SpatialHashGrid<Enemy>;

  // Wave & Spawning
  public wave: number = 1;
  public enemiesRemainingToSpawn: number = 0;
  public spawnTimer: number = 0;
  public activeBoss: Enemy | null = null;
  public waveCompleted: boolean = false;

  // Upgrades
  public activeUpgradeLevels: Record<UpgradeId, number> = {
    fire_rate: 0,
    damage: 0,
    move_speed: 0,
    max_hp: 0,
    shield: 0,
    spread_shot: 0,
    piercing: 0,
    xp_magnet: 0,
    drone: 0,
    nano_repair: 0,
  };
  public pendingUpgrades: UpgradeDefinition[] = [];

  // Progression & Score
  public score: number = 0;
  public enemiesKilled: number = 0;
  public timeSurvived: number = 0;
  public currentXp: number = 0;
  public xpToNextLevel: number = 10;
  public level: number = 1;

  // Visual effects
  public screenShake: number = 0;
  public hitFlashTimer: number = 0;
  private stars: Star[] = [];

  // Game Loop Timing
  private lastFrameTime: number = 0;
  private accumulator: number = 0;
  private readonly TIMESTEP: number = 1 / 60; // 60Hz fixed simulation
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  // Input & Settings
  public input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shooting: false,
    mouseX: 0,
    mouseY: 0,
    joystickActive: false,
    joystickDirX: 0,
    joystickDirY: 0,
  };

  public settings: GameSettings = {
    soundMuted: false,
    soundVolume: 0.5,
    reducedMotion: false,
    colorblindMode: false,
  };

  // Event Callbacks
  public onStateChange?: (state: GameState) => void;
  public onScoreUpdate?: (state: GameScoreState) => void;
  public onUpgradeReady?: (upgrades: UpgradeDefinition[]) => void;
  public onBossUpdate?: (boss: { hp: number; maxHp: number; phase: number } | null) => void;

  constructor(canvas: HTMLCanvasElement, difficulty: DifficultyLevel = "normal") {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not acquire 2D context");
    this.ctx = context;

    this.difficulty = difficulty;
    const diffConfig = getDifficultyConfig(difficulty);
    this.player = new Player(canvas.width / 2, canvas.height / 2, diffConfig.playerStartingHp, canvas.width, canvas.height);
    this.spatialGrid = new SpatialHashGrid<Enemy>(70);

    this.initStars();
    this.bindWindowEvents();
  }

  private initStars(): void {
    const starCount = 80;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 25 + 10,
        brightness: Math.random() * 0.7 + 0.3,
      });
    }
  }

  private bindWindowEvents(): void {
    if (typeof window === "undefined") return;

    // Pause cleanly when tab loses focus
    const handleVisibility = () => {
      if (document.hidden && this.state === "playing") {
        this.pauseGame();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    window.addEventListener("blur", () => {
      if (this.state === "playing") {
        this.pauseGame();
      }
    });
  }

  public setDifficulty(diff: DifficultyLevel): void {
    this.difficulty = diff;
  }

  public updateSettings(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (settings.soundMuted !== undefined) {
      soundManager.setMuted(this.settings.soundMuted);
    }
    if (settings.soundVolume !== undefined) {
      soundManager.setVolume(this.settings.soundVolume);
    }
    if (settings.reducedMotion !== undefined) {
      this.particles.setReducedMotion(this.settings.reducedMotion);
    }
  }

  public resize(width: number, height: number): void {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.player.resizeArena(width, height);
  }

  public startGame(): void {
    soundManager.init();
    const config = getDifficultyConfig(this.difficulty);

    this.state = "playing";
    this.wave = 1;
    this.score = 0;
    this.enemiesKilled = 0;
    this.timeSurvived = 0;
    this.currentXp = 0;
    this.level = 1;
    this.xpToNextLevel = 10;
    this.activeBoss = null;
    this.waveCompleted = false;

    // Reset upgrade levels
    for (const key of Object.keys(this.activeUpgradeLevels)) {
      this.activeUpgradeLevels[key as UpgradeId] = 0;
    }

    // Reset player
    this.player = new Player(
      this.canvas.width / (2 * (window.devicePixelRatio || 1)),
      this.canvas.height / (2 * (window.devicePixelRatio || 1)),
      config.playerStartingHp,
      this.canvas.width / (window.devicePixelRatio || 1),
      this.canvas.height / (window.devicePixelRatio || 1)
    );

    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.orbs = [];
    this.particles.clear();
    this.spatialGrid.clear();

    this.startWave(this.wave);
    this.emitScoreUpdate();
    this.onStateChange?.(this.state);

    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.startLoop();
  }

  public pauseGame(): void {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.onStateChange?.(this.state);
  }

  public resumeGame(): void {
    if (this.state !== "paused") return;
    soundManager.init();
    this.state = "playing";
    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.onStateChange?.(this.state);
    this.startLoop();
  }

  public startWave(waveNumber: number): void {
    this.wave = waveNumber;
    this.waveCompleted = false;
    const config = getDifficultyConfig(this.difficulty);

    // Calculate wave total enemies
    const baseCount = 8 + waveNumber * 4;
    this.enemiesRemainingToSpawn = Math.round(baseCount / config.spawnIntervalMultiplier);
    this.spawnTimer = 0.5;

    // Check if this wave features a Boss
    const isBossWave = waveNumber % config.bossIntervalWaves === 0;
    if (isBossWave) {
      soundManager.playBossAlert();
      this.spawnBoss();
    }
  }

  private spawnBoss(): void {
    const config = getDifficultyConfig(this.difficulty);
    const arenaW = this.canvas.width / (window.devicePixelRatio || 1);
    const arenaH = this.canvas.height / (window.devicePixelRatio || 1);

    const baseHp = 180 + this.wave * 40;
    const scaled = scaleEnemyStats(baseHp, 70, this.difficulty, this.wave);

    const boss = new Enemy(
      Date.now() + Math.random(),
      arenaW / 2,
      -60, // Enters from top
      "boss",
      scaled.hp,
      scaled.speed,
      30
    );

    this.enemies.push(boss);
    this.activeBoss = boss;
    this.onBossUpdate?.({ hp: boss.hp, maxHp: boss.maxHp, phase: boss.bossPhase });
  }

  private spawnNextEnemy(): void {
    if (this.enemiesRemainingToSpawn <= 0) return;
    this.enemiesRemainingToSpawn--;

    const arenaW = this.canvas.width / (window.devicePixelRatio || 1);
    const arenaH = this.canvas.height / (window.devicePixelRatio || 1);
    const config = getDifficultyConfig(this.difficulty);

    // Pick random screen edge (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const margin = 35;

    switch (edge) {
      case 0:
        x = Math.random() * arenaW;
        y = -margin;
        break;
      case 1:
        x = arenaW + margin;
        y = Math.random() * arenaH;
        break;
      case 2:
        x = Math.random() * arenaW;
        y = arenaH + margin;
        break;
      case 3:
        x = -margin;
        y = Math.random() * arenaH;
        break;
    }

    // Determine type by wave progression
    let type: "chaser" | "tank" | "shooter" = "chaser";
    const roll = Math.random();

    if (this.wave >= 3 && roll < 0.35) {
      type = "shooter";
    } else if (roll < 0.6) {
      type = "tank";
    }

    // Elite check
    const isElite =
      config.eliteEnemiesFromWave !== null &&
      this.wave >= config.eliteEnemiesFromWave &&
      Math.random() < 0.22;

    const baseStats = {
      chaser: { hp: 12, speed: 170 },
      tank: { hp: 36, speed: 85 },
      shooter: { hp: 20, speed: 110 },
    }[type];

    const scaled = scaleEnemyStats(baseStats.hp, baseStats.speed, this.difficulty, this.wave, isElite);
    const enemy = new Enemy(
      Date.now() + Math.random(),
      x,
      y,
      type,
      scaled.hp,
      scaled.speed,
      scaled.xpValue,
      isElite
    );

    this.enemies.push(enemy);
  }

  public selectUpgrade(upgradeId: UpgradeId): void {
    applyUpgrade(this.player.stats, upgradeId);
    this.activeUpgradeLevels[upgradeId] = (this.activeUpgradeLevels[upgradeId] || 0) + 1;
    this.pendingUpgrades = [];

    // Trigger visual celebration
    this.particles.spawnNova(this.player.x, this.player.y, "#38bdf8");
    soundManager.playHeal();

    // Start next wave
    this.state = "playing";
    this.startWave(this.wave + 1);
    this.onStateChange?.(this.state);
    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.startLoop();
  }

  private triggerUpgradeSelection(): void {
    this.state = "upgrade";
    soundManager.playLevelUp();
    this.pendingUpgrades = getRandomUpgrades(this.activeUpgradeLevels, 3);
    this.onUpgradeReady?.(this.pendingUpgrades);
    this.onStateChange?.(this.state);
  }

  private handleGameOver(): void {
    this.state = "gameover";
    soundManager.playGameOver();
    this.onStateChange?.(this.state);
    this.emitScoreUpdate();
  }

  private emitScoreUpdate(): void {
    this.onScoreUpdate?.({
      score: this.score,
      wave: this.wave,
      enemiesKilled: this.enemiesKilled,
      timeSurvivedSeconds: Math.floor(this.timeSurvived),
      currentXp: this.currentXp,
      xpToNextLevel: this.xpToNextLevel,
      level: this.level,
      difficulty: this.difficulty,
    });
  }

  public startLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    const loop = (time: number) => {
      if (this.isDestroyed) return;

      const deltaSeconds = (time - this.lastFrameTime) / 1000;
      this.lastFrameTime = time;

      // Clamp delta time to avoid large jumps if tab was backgrounded
      const clampedDt = Math.min(deltaSeconds, 0.1);

      if (this.state === "playing") {
        this.accumulator += clampedDt;
        while (this.accumulator >= this.TIMESTEP) {
          this.update(this.TIMESTEP);
          this.accumulator -= this.TIMESTEP;
        }
      }

      this.render();

      if (this.state === "playing" || this.state === "paused" || this.state === "upgrade") {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public update(dt: number): void {
    this.timeSurvived += dt;

    // 1. Screen shake & hit flash dampening
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }

    // 2. Stars scrolling animation
    const arenaH = this.canvas.height / (window.devicePixelRatio || 1);
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.y += star.speed * dt;
      if (star.y > arenaH) {
        star.y = 0;
        star.x = Math.random() * (this.canvas.width / (window.devicePixelRatio || 1));
      }
    }

    // 3. Spawning cadence
    const config = getDifficultyConfig(this.difficulty);
    if (this.enemiesRemainingToSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = 0.8 * config.spawnIntervalMultiplier;
        this.spawnNextEnemy();
      }
    }

    // 4. Auto-aim target resolution (when on Easy or auto-aim enabled)
    let autoAimTarget: { x: number; y: number } | null = null;
    let closestEnemyDistSq = Infinity;
    let droneTarget: { x: number; y: number } | null = null;
    let droneDistSq = 320 * 320;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      const dSq = SpatialHashGrid.distanceSq(this.player.x, this.player.y, e.x, e.y);
      if (dSq < closestEnemyDistSq) {
        closestEnemyDistSq = dSq;
        autoAimTarget = e;
      }
      if (this.player.stats.hasDrone && dSq < droneDistSq) {
        droneDistSq = dSq;
        droneTarget = e;
      }
    }

    // 5. Update Player
    this.player.update(
      dt,
      this.input,
      config.autoAim ? autoAimTarget : null,
      (p: Projectile, isDrone = false) => {
        this.playerProjectiles.push(p);
        if (isDrone) {
          soundManager.playDroneShoot();
        } else {
          soundManager.playShoot();
        }
      },
      droneTarget
    );

    // 6. Update Projectiles
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      if (!p.update(dt)) {
        this.playerProjectiles.splice(i, 1);
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      if (!p.update(dt)) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 7. Update Enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      enemy.update(
        dt,
        this.player.x,
        this.player.y,
        (p) => this.enemyProjectiles.push(p),
        (mx, my) => {
          const scaled = scaleEnemyStats(10, 160, this.difficulty, this.wave);
          this.enemies.push(new Enemy(Date.now() + Math.random(), mx, my, "chaser", scaled.hp, scaled.speed, 1));
        }
      );
    }

    // 8. Update Orbs
    for (let i = 0; i < this.orbs.length; i++) {
      this.orbs[i].update(dt, this.player.x, this.player.y, this.player.stats.magnetRadius);
    }

    // 9. Update Particle system
    this.particles.update(dt);

    // 10. Broadphase Collision with Spatial Hash Grid
    this.spatialGrid.clear();
    this.spatialGrid.insertMany(this.enemies);

    // Bullet-Enemy Collisions
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      const candidates = this.spatialGrid.query(p.x, p.y, p.radius);

      for (let j = 0; j < candidates.length; j++) {
        const enemy = candidates[j];
        if (SpatialHashGrid.checkCollision(p, enemy)) {
          // Damage enemy
          const died = enemy.takeDamage(p.damage);
          this.particles.spawnSparks(p.x, p.y, Math.atan2(p.vy, p.vx) + Math.PI, 5);
          soundManager.playHit();

          if (died) {
            this.handleEnemyDefeated(enemy);
          }

          p.pierceRemaining--;
          if (p.pierceRemaining < 0) {
            this.playerProjectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    // Enemy Projectile - Player Collision
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      if (SpatialHashGrid.checkCollision(p, this.player)) {
        this.enemyProjectiles.splice(i, 1);
        this.damagePlayer();
      }
    }

    // Enemy Body - Player Collision
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (SpatialHashGrid.checkCollision(enemy, this.player)) {
        this.damagePlayer();
        // Repel enemy slightly
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.001) {
          enemy.x += (dx / dist) * 20;
          enemy.y += (dy / dist) * 20;
        }
      }
    }

    // Orb - Player Collection Collision
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      if (SpatialHashGrid.checkCollision(orb, this.player)) {
        this.orbs.splice(i, 1);
        if (orb.type === "xp") {
          this.collectXp(orb.value);
        } else {
          this.player.heal(1);
          soundManager.playHeal();
          this.particles.spawnNova(this.player.x, this.player.y, "#10b981");
        }
      }
    }

    // Clean up dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        if (this.enemies[i] === this.activeBoss) {
          this.activeBoss = null;
          this.onBossUpdate?.(null);
        }
        this.enemies.splice(i, 1);
      }
    }

    // Boss HUD sync
    if (this.activeBoss) {
      this.onBossUpdate?.({
        hp: this.activeBoss.hp,
        maxHp: this.activeBoss.maxHp,
        phase: this.activeBoss.bossPhase,
      });
    }

    // 11. Wave Cleared Check
    if (this.enemiesRemainingToSpawn === 0 && this.enemies.length === 0 && !this.waveCompleted) {
      this.waveCompleted = true;
      const waveBonus = calculateScore(500, this.difficulty, this.wave * 100);
      this.score += waveBonus;
      this.emitScoreUpdate();
      this.triggerUpgradeSelection();
    }
  }

  private damagePlayer(): void {
    const result = this.player.takeDamage();
    if (result.absorbed) {
      soundManager.playShieldDeflect();
      this.particles.spawnExplosion(this.player.x, this.player.y, "#38bdf8", 14);
      if (!this.settings.reducedMotion) {
        this.screenShake = 6;
      }
    } else if (result.died) {
      this.particles.spawnExplosion(this.player.x, this.player.y, "#ef4444", 35, true);
      this.handleGameOver();
    } else {
      soundManager.playPlayerHit();
      this.hitFlashTimer = 0.15;
      if (!this.settings.reducedMotion) {
        this.screenShake = 12;
      }
      this.emitScoreUpdate();
    }
  }

  private handleEnemyDefeated(enemy: Enemy): void {
    this.enemiesKilled++;
    const config = getDifficultyConfig(this.difficulty);

    // Score awarded
    const basePoints = enemy.type === "boss" ? 1500 : enemy.isElite ? 250 : 50;
    this.score += calculateScore(basePoints, this.difficulty);
    this.emitScoreUpdate();

    // Sound and particles
    const isLarge = enemy.type === "boss" || enemy.type === "tank";
    soundManager.playExplosion(isLarge);
    this.particles.spawnExplosion(
      enemy.x,
      enemy.y,
      enemy.type === "boss" ? "#ec4899" : enemy.isElite ? "#fbbf24" : "#f43f5e",
      isLarge ? 28 : 14,
      isLarge
    );

    // Drop XP Orbs
    if (enemy.type === "boss") {
      for (let i = 0; i < 12; i++) {
        this.orbs.push(
          new Orb(
            Date.now() + Math.random(),
            enemy.x + (Math.random() - 0.5) * 40,
            enemy.y + (Math.random() - 0.5) * 40,
            "xp",
            3
          )
        );
      }
      // Guaranteed heal drop from Boss
      if (config.healDropChance > 0) {
        this.orbs.push(new Orb(Date.now() + Math.random(), enemy.x, enemy.y, "heal", 1));
      }
    } else {
      this.orbs.push(new Orb(Date.now() + Math.random(), enemy.x, enemy.y, "xp", enemy.xpValue));

      // Heal drop chance
      if (Math.random() < config.healDropChance) {
        this.orbs.push(new Orb(Date.now() + Math.random(), enemy.x + 8, enemy.y, "heal", 1));
      }
    }
  }

  private collectXp(amount: number): void {
    soundManager.playXpPickup();
    this.currentXp += amount;

    if (this.currentXp >= this.xpToNextLevel) {
      this.level++;
      this.currentXp -= this.xpToNextLevel;
      this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.35);
      soundManager.playLevelUp();
      this.particles.spawnNova(this.player.x, this.player.y, "#38bdf8");
    }

    this.emitScoreUpdate();
  }

  public render(): void {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const arenaW = this.canvas.width / dpr;
    const arenaH = this.canvas.height / dpr;

    this.ctx.save();

    // Screen Shake Offset
    if (this.screenShake > 0 && !this.settings.reducedMotion) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Deep space void clear
    this.ctx.fillStyle = "#020617";
    this.ctx.fillRect(0, 0, arenaW, arenaH);

    // 2. Neon arena grid
    this.renderGrid(arenaW, arenaH);

    // 3. Starfield
    this.renderStars();

    // 4. Orbs
    for (let i = 0; i < this.orbs.length; i++) {
      this.orbs[i].render(this.ctx, this.settings.colorblindMode);
    }

    // 5. Enemies
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].render(this.ctx, this.settings.colorblindMode);
    }

    // 6. Projectiles
    for (let i = 0; i < this.playerProjectiles.length; i++) {
      this.playerProjectiles[i].render(this.ctx);
    }
    for (let i = 0; i < this.enemyProjectiles.length; i++) {
      this.enemyProjectiles[i].render(this.ctx);
    }

    // 7. Player
    if (this.state !== "gameover") {
      this.player.render(this.ctx, this.settings.colorblindMode);
    }

    // 8. Particles
    this.particles.render(this.ctx);

    // 9. Hit Flash Overlay
    if (this.hitFlashTimer > 0) {
      this.ctx.fillStyle = `rgba(239, 68, 68, ${this.hitFlashTimer * 1.8})`;
      this.ctx.fillRect(0, 0, arenaW, arenaH);
    }

    this.ctx.restore();
  }

  private renderGrid(width: number, height: number): void {
    const gridSize = 60;
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderStars(): void {
    this.ctx.save();
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    this.ctx.restore();
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
