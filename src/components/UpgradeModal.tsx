import React, { useEffect } from "react";
import { UpgradeDefinition, UpgradeId } from "@/game/types";
import {
  Zap,
  Flame,
  ChevronsRight,
  Heart,
  Shield,
  Sparkles,
  Target,
  Magnet,
  Crosshair,
  Activity,
} from "lucide-react";

interface UpgradeModalProps {
  upgrades: UpgradeDefinition[];
  activeUpgradeLevels: Record<UpgradeId, number>;
  onSelect: (upgradeId: UpgradeId) => void;
}

const UPGRADE_ICONS: Record<UpgradeId, React.ReactNode> = {
  fire_rate: <Zap className="w-6 h-6 text-amber-400" />,
  damage: <Flame className="w-6 h-6 text-rose-500" />,
  move_speed: <ChevronsRight className="w-6 h-6 text-sky-400" />,
  max_hp: <Heart className="w-6 h-6 text-red-400" />,
  shield: <Shield className="w-6 h-6 text-cyan-400" />,
  spread_shot: <Sparkles className="w-6 h-6 text-purple-400" />,
  piercing: <Target className="w-6 h-6 text-emerald-400" />,
  xp_magnet: <Magnet className="w-6 h-6 text-yellow-400" />,
  drone: <Crosshair className="w-6 h-6 text-blue-400" />,
  nano_repair: <Activity className="w-6 h-6 text-green-400" />,
};

const TIER_STYLES = {
  common: {
    border: "border-slate-600 hover:border-slate-400",
    badge: "bg-slate-800 text-slate-300",
    label: "COMMON",
  },
  rare: {
    border: "border-sky-500/70 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]",
    badge: "bg-sky-950 text-sky-300 border border-sky-600/50",
    label: "RARE",
  },
  epic: {
    border: "border-purple-500/80 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    badge: "bg-purple-950 text-purple-300 border border-purple-600/50",
    label: "EPIC",
  },
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  upgrades,
  activeUpgradeLevels,
  onSelect,
}) => {
  // Listen for keyboard hotkeys (1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1" && upgrades[0]) {
        onSelect(upgrades[0].id);
      } else if (e.key === "2" && upgrades[1]) {
        onSelect(upgrades[1].id);
      } else if (e.key === "3" && upgrades[2]) {
        onSelect(upgrades[2].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [upgrades, onSelect]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col items-center gap-6 font-mono">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">
            WAVE CLEARED // QUANTUM AUGMENTATION READY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            SELECT SHIP UPGRADE
          </h2>
          <p className="text-xs text-slate-400 mt-1">Press keys [1], [2], [3] or click an upgrade card</p>
        </div>

        {/* 3 Upgrade Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {upgrades.map((upgrade, idx) => {
            const currentLevel = activeUpgradeLevels[upgrade.id] || 0;
            const tier = TIER_STYLES[upgrade.tier];

            return (
              <button
                key={upgrade.id}
                onClick={() => onSelect(upgrade.id)}
                className={`group relative flex flex-col justify-between p-5 rounded-xl bg-slate-900/90 border-2 ${tier.border} transition-all duration-150 hover:-translate-y-1 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400`}
              >
                <div>
                  {/* Top Header: Key Hotkey & Tier Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:border-cyan-400 group-hover:text-cyan-300">
                      {idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>
                      {tier.label}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      {UPGRADE_ICONS[upgrade.id]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {upgrade.name}
                      </h3>
                      <div className="text-xs text-slate-400">
                        Level {currentLevel} &rarr;{" "}
                        <span className="text-cyan-400 font-bold">{currentLevel + 1}</span> / {upgrade.maxLevel}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">{upgrade.description}</p>
                </div>

                {/* Level Progress pips */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: upgrade.maxLevel }).map((_, pIdx) => (
                      <div
                        key={pIdx}
                        className={`w-3.5 h-1.5 rounded-sm ${
                          pIdx < currentLevel + 1 ? "bg-cyan-400 shadow-[0_0_5px_#38bdf8]" : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    INSTALL &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
