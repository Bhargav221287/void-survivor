export type DifficultyLevel = "easy" | "normal" | "hard" | "insane";

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  tagline: string;
  description: string;
  enemySpeedMultiplier: number;
  enemyHpMultiplier: number;
  spawnIntervalMultiplier: number;
  playerStartingHp: number;
  autoAim: boolean;
  healDropChance: number;
  scoreMultiplier: number;
  eliteEnemiesFromWave: number | null;
  bossIntervalWaves: number;
  accentColor: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: "easy",
    name: "Cadet (Easy)",
    tagline: "Assisted combat & forgiving hull",
    description: "Enemy speed 0.7x, enemy HP 0.7x, slow spawns, 5 HP, auto-aim, frequent heal drops.",
    enemySpeedMultiplier: 0.7,
    enemyHpMultiplier: 0.7,
    spawnIntervalMultiplier: 1.4, // Slower spawn rate
    playerStartingHp: 5,
    autoAim: true,
    healDropChance: 0.2, // 20% drop rate
    scoreMultiplier: 1.0,
    eliteEnemiesFromWave: null,
    bossIntervalWaves: 10,
    accentColor: "#10b981", // Emerald
  },
  normal: {
    id: "normal",
    name: "Survivor (Normal)",
    tagline: "The standard void trial",
    description: "Standard parameters (1x), player HP 3, score x1.5.",
    enemySpeedMultiplier: 1.0,
    enemyHpMultiplier: 1.0,
    spawnIntervalMultiplier: 1.0,
    playerStartingHp: 3,
    autoAim: false,
    healDropChance: 0.06, // 6% drop rate
    scoreMultiplier: 1.5,
    eliteEnemiesFromWave: null,
    bossIntervalWaves: 10,
    accentColor: "#38bdf8", // Sky blue
  },
  hard: {
    id: "hard",
    name: "Veteran (Hard)",
    tagline: "Relentless swarms & elite threats",
    description: "Enemy speed 1.3x, enemy HP 1.5x, fast spawns, 3 HP, elite enemies from wave 5, score x2.",
    enemySpeedMultiplier: 1.3,
    enemyHpMultiplier: 1.5,
    spawnIntervalMultiplier: 0.75, // 25% faster spawns
    playerStartingHp: 3,
    autoAim: false,
    healDropChance: 0.03, // 3% drop rate
    scoreMultiplier: 2.0,
    eliteEnemiesFromWave: 5,
    bossIntervalWaves: 5,
    accentColor: "#f59e0b", // Amber
  },
  insane: {
    id: "insane",
    name: "Void Nightmare (Insane)",
    tagline: "One mistake means total annihilation",
    description: "Enemy speed 1.6x, enemy HP 2.0x, very fast spawns, 1 HP, boss every 5 waves, no heals, score x3.",
    enemySpeedMultiplier: 1.6,
    enemyHpMultiplier: 2.0,
    spawnIntervalMultiplier: 0.55, // 45% faster spawns
    playerStartingHp: 1,
    autoAim: false,
    healDropChance: 0.0, // No heal drops
    scoreMultiplier: 3.0,
    eliteEnemiesFromWave: 3,
    bossIntervalWaves: 5,
    accentColor: "#ef4444", // Crimson
  },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level] || DIFFICULTY_CONFIGS.normal;
}

/**
 * Calculates scaled enemy stats taking into account difficulty and current wave progression.
 */
export function scaleEnemyStats(
  baseHp: number,
  baseSpeed: number,
  difficulty: DifficultyLevel,
  wave: number,
  isElite: boolean = false
): { hp: number; speed: number; xpValue: number } {
  const config = getDifficultyConfig(difficulty);
  const waveScalingHp = 1 + (wave - 1) * 0.18;
  const waveScalingSpeed = 1 + Math.min(0.5, (wave - 1) * 0.03);

  let hp = Math.round(baseHp * config.enemyHpMultiplier * waveScalingHp);
  let speed = baseSpeed * config.enemySpeedMultiplier * waveScalingSpeed;
  let xpValue = 1;

  if (isElite) {
    hp = Math.round(hp * 2.2);
    speed *= 1.15;
    xpValue = 5;
  }

  return {
    hp: Math.max(1, hp),
    speed: Math.max(0.5, speed),
    xpValue,
  };
}

/**
 * Calculates total score awarded from an action or wave completion.
 */
export function calculateScore(
  basePoints: number,
  difficulty: DifficultyLevel,
  waveBonus: number = 0
): number {
  const config = getDifficultyConfig(difficulty);
  const total = (basePoints + waveBonus) * config.scoreMultiplier;
  return Math.round(total);
}

