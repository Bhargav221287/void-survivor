import { describe, it, expect } from "vitest";
import {
  DIFFICULTY_CONFIGS,
  getDifficultyConfig,
  scaleEnemyStats,
  calculateScore,
} from "../difficulty";

describe("Difficulty Configuration", () => {
  it("provides correct configurations for all 4 difficulty levels", () => {
    const easy = getDifficultyConfig("easy");
    const normal = getDifficultyConfig("normal");
    const hard = getDifficultyConfig("hard");
    const insane = getDifficultyConfig("insane");

    // Easy specs
    expect(easy.enemySpeedMultiplier).toBe(0.7);
    expect(easy.enemyHpMultiplier).toBe(0.7);
    expect(easy.playerStartingHp).toBe(5);
    expect(easy.autoAim).toBe(true);
    expect(easy.healDropChance).toBeGreaterThan(0.1);
    expect(easy.scoreMultiplier).toBe(1.0);

    // Normal specs
    expect(normal.enemySpeedMultiplier).toBe(1.0);
    expect(normal.enemyHpMultiplier).toBe(1.0);
    expect(normal.playerStartingHp).toBe(3);
    expect(normal.autoAim).toBe(false);
    expect(normal.scoreMultiplier).toBe(1.5);

    // Hard specs
    expect(hard.enemySpeedMultiplier).toBe(1.3);
    expect(hard.enemyHpMultiplier).toBe(1.5);
    expect(hard.playerStartingHp).toBe(3);
    expect(hard.eliteEnemiesFromWave).toBe(5);
    expect(hard.scoreMultiplier).toBe(2.0);

    // Insane specs
    expect(insane.enemySpeedMultiplier).toBe(1.6);
    expect(insane.enemyHpMultiplier).toBe(2.0);
    expect(insane.playerStartingHp).toBe(1);
    expect(insane.healDropChance).toBe(0);
    expect(insane.bossIntervalWaves).toBe(5);
    expect(insane.scoreMultiplier).toBe(3.0);
  });

  it("scales enemy stats based on difficulty and wave", () => {
    const baseHp = 10;
    const baseSpeed = 2;

    const easyWave1 = scaleEnemyStats(baseHp, baseSpeed, "easy", 1);
    expect(easyWave1.hp).toBe(7); // 10 * 0.7
    expect(easyWave1.speed).toBeCloseTo(1.4); // 2 * 0.7

    const insaneWave1 = scaleEnemyStats(baseHp, baseSpeed, "insane", 1);
    expect(insaneWave1.hp).toBe(20); // 10 * 2.0
    expect(insaneWave1.speed).toBeCloseTo(3.2); // 2 * 1.6

    // Wave progression increases HP
    const normalWave5 = scaleEnemyStats(baseHp, baseSpeed, "normal", 5);
    expect(normalWave5.hp).toBeGreaterThan(baseHp);

    // Elite modifier multiplies HP and speed
    const hardElite = scaleEnemyStats(baseHp, baseSpeed, "hard", 5, true);
    const hardRegular = scaleEnemyStats(baseHp, baseSpeed, "hard", 5, false);
    expect(hardElite.hp).toBeGreaterThan(hardRegular.hp * 2);
    expect(hardElite.speed).toBeGreaterThan(hardRegular.speed);
    expect(hardElite.xpValue).toBe(5);
  });

  it("calculates score with appropriate difficulty multipliers", () => {
    const base = 100;
    expect(calculateScore(base, "easy")).toBe(100);
    expect(calculateScore(base, "normal")).toBe(150); // 100 * 1.5
    expect(calculateScore(base, "hard")).toBe(200); // 100 * 2.0
    expect(calculateScore(base, "insane")).toBe(300); // 100 * 3.0

    // With wave bonus
    expect(calculateScore(100, "normal", 50)).toBe(225); // (100 + 50) * 1.5
  });
});
