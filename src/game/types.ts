import { DifficultyLevel } from "./difficulty";

export type GameState = "menu" | "playing" | "upgrade" | "paused" | "gameover";

export type EnemyType = "chaser" | "tank" | "shooter" | "boss";

export type OrbType = "xp" | "heal";

export type UpgradeId =
  | "fire_rate"
  | "damage"
  | "move_speed"
  | "max_hp"
  | "shield"
  | "spread_shot"
  | "piercing"
  | "xp_magnet"
  | "drone"
  | "nano_repair";

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  tier: "common" | "rare" | "epic";
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  fireRate: number; // Attacks per second
  damage: number;
  bulletCount: number; // Projectiles per trigger
  pierce: number; // Number of enemies bullet can pass through
  magnetRadius: number; // Orb pickup radius
  hasShield: boolean;
  shieldActive: boolean;
  shieldCooldownMax: number; // Seconds to recharge shield
  shieldCooldownCurrent: number;
  hasDrone: boolean;
  droneAngle: number;
  droneFireTimer: number;
  nanoRepairTimer: number;
  invulnerabilityTimer: number; // Seconds of post-hit invulnerability
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shooting: boolean;
  mouseX: number;
  mouseY: number;
  // Mobile / virtual joystick
  joystickActive: boolean;
  joystickDirX: number;
  joystickDirY: number;
}

export interface GameScoreState {
  score: number;
  wave: number;
  enemiesKilled: number;
  timeSurvivedSeconds: number;
  currentXp: number;
  xpToNextLevel: number;
  level: number;
  difficulty: DifficultyLevel;
}

export interface GameSettings {
  soundMuted: boolean;
  soundVolume: number; // 0.0 to 1.0
  reducedMotion: boolean;
  colorblindMode: boolean;
}

