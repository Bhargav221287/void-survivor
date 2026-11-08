import { describe, it, expect } from "vitest";
import { Player } from "../entities/Player";
import { applyUpgrade } from "../upgrades";

describe("Player & Upgrades System", () => {
  it("initializes player with specified starting HP and defaults", () => {
    const player = new Player(100, 100, 5, 800, 600);
    expect(player.stats.hp).toBe(5);
    expect(player.stats.maxHp).toBe(5);
    expect(player.stats.hasShield).toBe(false);
    expect(player.stats.bulletCount).toBe(1);
    expect(player.stats.pierce).toBe(0);
  });

  it("applies upgrades correctly to player stats", () => {
    const player = new Player(100, 100, 3, 800, 600);

    // Fire rate
    const initialFireRate = player.stats.fireRate;
    applyUpgrade(player.stats, "fire_rate");
    expect(player.stats.fireRate).toBeGreaterThan(initialFireRate);

    // Damage
    const initialDamage = player.stats.damage;
    applyUpgrade(player.stats, "damage");
    expect(player.stats.damage).toBeGreaterThan(initialDamage);

    // Speed
    const initialSpeed = player.stats.speed;
    applyUpgrade(player.stats, "move_speed");
    expect(player.stats.speed).toBeGreaterThan(initialSpeed);

    // Max HP and Heal
    player.stats.hp = 2; // damaged
    applyUpgrade(player.stats, "max_hp");
    expect(player.stats.maxHp).toBe(4);
    expect(player.stats.hp).toBe(3); // healed by 1

    // Spread shot
    applyUpgrade(player.stats, "spread_shot");
    expect(player.stats.bulletCount).toBe(2);

    // Piercing
    applyUpgrade(player.stats, "piercing");
    expect(player.stats.pierce).toBe(1);

    // Shield
    applyUpgrade(player.stats, "shield");
    expect(player.stats.hasShield).toBe(true);
    expect(player.stats.shieldActive).toBe(true);
  });

  it("handles shield absorption and damage cleanly", () => {
    const player = new Player(100, 100, 3, 800, 600);
    applyUpgrade(player.stats, "shield");

    // First hit: absorbed by shield
    const firstHit = player.takeDamage();
    expect(firstHit.absorbed).toBe(true);
    expect(firstHit.died).toBe(false);
    expect(player.stats.shieldActive).toBe(false);
    expect(player.stats.hp).toBe(3); // HP untouched!

    // Wait out invulnerability
    player.stats.invulnerabilityTimer = 0;

    // Second hit: damages hull
    const secondHit = player.takeDamage();
    expect(secondHit.absorbed).toBe(false);
    expect(secondHit.died).toBe(false);
    expect(player.stats.hp).toBe(2);

    // Fatal damage
    player.stats.hp = 1;
    player.stats.invulnerabilityTimer = 0;
    const fatalHit = player.takeDamage();
    expect(fatalHit.died).toBe(true);
    expect(player.stats.hp).toBe(0);
  });
});
