import React from "react";
import { GameScoreState, PlayerStats, UpgradeId } from "@/game/types";
import { getDifficultyConfig } from "@/game/difficulty";
import { UPGRADE_CATALOG } from "@/game/upgrades";
import {
  Heart,
  Shield,
  Zap,
  Flame,
  ChevronsRight,
  Sparkles,
  Target,
  Magnet,
  Crosshair,
  Activity,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

interface HUDProps {
  scoreState: GameScoreState;
  playerStats: PlayerStats;
  activeUpgradeLevels: Record<UpgradeId, number>;
  enemiesRemaining: number;
  boss: { hp: number; maxHp: number; phase: number } | null;
  onPause: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

const UPGRADE_ICONS: Record<UpgradeId, React.ReactNode> = {
  fire_rate: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  damage: <Flame className="w-3.5 h-3.5 text-rose-500" />,
  move_speed: <ChevronsRight className="w-3.5 h-3.5 text-sky-400" />,
  max_hp: <Heart className="w-3.5 h-3.5 text-red-400" />,
  shield: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
  spread_shot: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
  piercing: <Target className="w-3.5 h-3.5 text-emerald-400" />,
  xp_magnet: <Magnet className="w-3.5 h-3.5 text-yellow-400" />,
  drone: <Crosshair className="w-3.5 h-3.5 text-blue-400" />,
  nano_repair: <Activity className="w-3.5 h-3.5 text-green-400" />,
};

export const HUD: React.FC<HUDProps> = ({
  scoreState,
  playerStats,
  activeUpgradeLevels,
  enemiesRemaining,
  boss,
  onPause,
  muted,
  onToggleMute,
}) => {
  const diffConfig = getDifficultyConfig(scoreState.difficulty);
  const xpRatio = Math.min(1, Math.max(0, scoreState.currentXp / scoreState.xpToNextLevel));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-mono">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Hull & Shield */}
        <div className="flex flex-col gap-2">
          {/* HP Hearts */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-xs text-slate-400 mr-1 font-semibold">HULL</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: playerStats.maxHp }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    idx < playerStats.hp
                      ? "text-rose-500 fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                      : "text-slate-600 fill-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Shield Status */}
          {playerStats.hasShield && (
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-cyan-500/40 px-3 py-1 rounded-lg text-xs">
              <Shield
                className={`w-4 h-4 ${
                  playerStats.shieldActive
                    ? "text-cyan-400 fill-cyan-400/30 animate-pulse"
                    : "text-slate-500"
                }`}
              />
              <span className={playerStats.shieldActive ? "text-cyan-300 font-bold" : "text-slate-400"}>
                {playerStats.shieldActive
                  ? "BARRIER ACTIVE"
                  : `RECHARGING (${Math.ceil(playerStats.shieldCooldownCurrent)}s)`}
              </span>
            </div>
          )}
        </div>

        {/* Center: Wave & Boss Bar */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur border border-slate-700/80 px-4 py-1.5 rounded-full shadow-xl">
            <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest">
              WAVE <span className="text-white font-bold text-base sm:text-lg">{scoreState.wave}</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-rose-400">
              {enemiesRemaining > 0 ? `${enemiesRemaining} FOES` : "CLEARING"}
            </span>
          </div>

          {/* Active Boss HP Bar */}
          {boss && (
            <div className="w-64 sm:w-80 mt-2 bg-slate-950/90 border border-rose-500/60 p-2 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-rose-400 font-bold mb-1">
                <span>DREADNOUGHT TITAN</span>
                <span>{boss.phase === 2 ? "PHASE 2 (ENRAGED)" : "PHASE 1"}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-700/40">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-purple-500 transition-all duration-150"
                  style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Score, Difficulty, Controls */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              title={muted ? "Unmute" : "Mute"}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              aria-label="Toggle sound"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onPause}
              title="Pause (Esc)"
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              aria-label="Pause game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Score Box */}
          <div className="flex flex-col items-end bg-slate-900/80 backdrop-blur border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg">
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>SCORE</span>
              <span
                className="px-1 py-0.5 rounded text-[9px] font-bold"
                style={{ backgroundColor: `${diffConfig.accentColor}33`, color: diffConfig.accentColor }}
              >
                x{diffConfig.scoreMultiplier}
              </span>
            </div>
            <div className="text-base sm:text-xl font-bold text-white tracking-wider">
              {scoreState.score.toLocaleString()}
            </div>
          </div>

          {/* Difficulty Badge */}
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
            style={{
              borderColor: `${diffConfig.accentColor}66`,
              color: diffConfig.accentColor,
              backgroundColor: "rgba(15, 23, 42, 0.7)",
            }}
          >
            {diffConfig.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Active Upgrades & XP Bar */}
      <div className="flex flex-col gap-2">
        {/* Active Upgrades Tray */}
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          {Object.entries(activeUpgradeLevels)
            .filter(([, lvl]) => lvl > 0)
            .map(([id, lvl]) => {
              const upgrade = UPGRADE_CATALOG[id as UpgradeId];
              return (
                <div
                  key={id}
                  title={`${upgrade.name} (Lvl ${lvl})`}
                  className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-md text-[10px] text-slate-200 shadow"
                >
                  {UPGRADE_ICONS[id as UpgradeId]}
                  <span className="font-bold">{lvl}</span>
                </div>
              );
            })}
        </div>

        {/* XP Bar */}
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur border border-slate-800 p-2 rounded-xl shadow-xl">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold whitespace-nowrap">
            <span>LVL</span>
            <span>{scoreState.level}</span>
          </div>
          <div className="relative flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 transition-all duration-200"
              style={{ width: `${xpRatio * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 min-w-[50px] text-right">
            {scoreState.currentXp}/{scoreState.xpToNextLevel}
          </span>
        </div>
      </div>
    </div>
  );
};

