import { UpgradeId, UpgradeDefinition, PlayerStats } from "./types";

export const UPGRADE_CATALOG: Record<UpgradeId, UpgradeDefinition> = {
  fire_rate: {
    id: "fire_rate",
    name: "Rapid Pulse Accelerator",
    description: "+25% faster weapon firing cycle.",
    icon: "Zap",
    maxLevel: 5,
    tier: "common",
  },
  damage: {
    id: "damage",
    name: "Plasma Supercharger",
    description: "+30% projectile damage per hit.",
    icon: "Flame",
    maxLevel: 5,
    tier: "common",
  },
  move_speed: {
    id: "move_speed",
    name: "Ionic Thrusters",
    description: "+20% ship movement velocity and responsiveness.",
    icon: "ChevronsRight",
    maxLevel: 4,
    tier: "common",
  },
  max_hp: {
    id: "max_hp",
    name: "Reinforced Hull Plating",
    description: "+1 Max HP and instantly restores 1 HP.",
    icon: "Heart",
    maxLevel: 5,
    tier: "rare",
  },
  shield: {
    id: "shield",
    name: "Deflector Forcefield",
    description: "Generates an energy barrier that absorbs 1 fatal blow every 14 seconds.",
    icon: "Shield",
    maxLevel: 3,
    tier: "epic",
  },
  spread_shot: {
    id: "spread_shot",
    name: "Multi-Barrel Cannon",
    description: "Fires +1 additional spread projectile simultaneously.",
    icon: "Sparkles",
    maxLevel: 4,
    tier: "rare",
  },
  piercing: {
    id: "piercing",
    name: "Armor-Piercing Rounds",
    description: "Projectiles penetrate through +1 additional enemy target.",
    icon: "Target",
    maxLevel: 3,
    tier: "rare",
  },
  xp_magnet: {
    id: "xp_magnet",
    name: "Gravity Collector",
    description: "+100% magnetic attraction radius for XP and heal orbs.",
    icon: "Magnet",
    maxLevel: 4,
    tier: "common",
  },
  drone: {
    id: "drone",
    name: "Autonomous Escort Drone",
    description: "Deploys an orbital combat drone that auto-targets nearby hostiles.",
    icon: "Crosshair",
    maxLevel: 3,
    tier: "epic",
  },
  nano_repair: {
    id: "nano_repair",
    name: "Nanite Hull Regenerator",
    description: "Nanomachines passively repair 1 HP every 25 seconds.",
    icon: "Activity",
    maxLevel: 2,
    tier: "epic",
  },
};

/**
 * Applies an upgrade modification to current player stats.
 */
export function applyUpgrade(stats: PlayerStats, upgradeId: UpgradeId): void {
  switch (upgradeId) {
    case "fire_rate":
      stats.fireRate *= 1.25;
      break;
    case "damage":
      stats.damage = Math.round(stats.damage * 1.3 * 10) / 10;
      break;
    case "move_speed":
      stats.speed *= 1.2;
      break;
    case "max_hp":
      stats.maxHp += 1;
      stats.hp = Math.min(stats.hp + 1, stats.maxHp);
      break;
    case "shield":
      stats.hasShield = true;
      stats.shieldActive = true;
      stats.shieldCooldownMax = Math.max(8, stats.shieldCooldownMax - 2);
      break;
    case "spread_shot":
      stats.bulletCount += 1;
      break;
    case "piercing":
      stats.pierce += 1;
      break;
    case "xp_magnet":
      stats.magnetRadius = Math.round(stats.magnetRadius * 1.8);
      break;
    case "drone":
      stats.hasDrone = true;
      break;
    case "nano_repair":
      stats.nanoRepairTimer = 0;
      break;
  }
}

/**
 * Returns up to count unique upgrades that have not reached their maximum level.
 */
export function getRandomUpgrades(
  currentLevels: Record<UpgradeId, number>,
  count: number = 3
): UpgradeDefinition[] {
  const allIds = Object.keys(UPGRADE_CATALOG) as UpgradeId[];
  const available = allIds.filter((id) => {
    const level = currentLevels[id] || 0;
    return level < UPGRADE_CATALOG[id].maxLevel;
  });

  if (available.length <= count) {
    return available.map((id) => UPGRADE_CATALOG[id]);
  }

  // Shuffle and pick
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((id) => UPGRADE_CATALOG[id]);
}
