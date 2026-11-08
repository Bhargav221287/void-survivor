import React from "react";
import { X, Navigation, ShieldAlert, Sparkles, Trophy } from "lucide-react";

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider">
                PILOT MANUAL // ARCHITECTURE
              </h2>
              <p className="text-[11px] text-slate-400">Everything you need to survive the deep void</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            aria-label="Close manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Navigation className="w-4 h-4" />
            CONTROLS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
                  DESKTOP
                </span>
              </span>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li>
                  <span className="text-cyan-400 font-bold">W A S D</span> or{" "}
                  <span className="text-cyan-400 font-bold">Arrows</span>: Steer interceptor
                </li>
                <li>
                  <span className="text-cyan-400 font-bold">Mouse Move</span>: Aim pulse turret
                </li>
                <li>
                  <span className="text-cyan-400 font-bold">Click / Hold</span>: Fire plasma cannons
                </li>
                <li>
                  <span className="text-cyan-400 font-bold">ESC</span>: Pause simulation
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
                  MOBILE / TOUCH
                </span>
              </span>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li>
                  <span className="text-cyan-400 font-bold">Left Screen Half</span>: Drag dynamic virtual joystick
                </li>
                <li>
                  <span className="text-cyan-400 font-bold">Right Screen Half / Button</span>: Aim & Fire weapons
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Threat Archetypes */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            THREAT SPECTRUM
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-rose-400 font-bold text-[11px]">CHASER</div>
              <div className="text-[10px] text-slate-400 mt-1">Fast & swarming. Weak hull. (Triangle)</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-indigo-400 font-bold text-[11px]">TANK</div>
              <div className="text-[10px] text-slate-400 mt-1">Slow, heavy mass, huge HP pool. (Hexagon)</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-emerald-400 font-bold text-[11px]">SHOOTER</div>
              <div className="text-[10px] text-slate-400 mt-1">Maintains distance & fires plasma. (Diamond)</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-purple-400 font-bold text-[11px]">BOSS</div>
              <div className="text-[10px] text-slate-400 mt-1">Multi-phase dreadnought with enraged attacks.</div>
            </div>
          </div>
        </div>

        {/* Upgrades & XP */}
        <div className="flex flex-col gap-2 bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-4 h-4" />
            AUGMENTATION & SCORING
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Eliminating threats yields <span className="text-cyan-400 font-bold">Cyan XP Orbs</span> and
            occasional <span className="text-emerald-400 font-bold">Green Nano-Heals</span>. After
            surviving each wave, choose 1 of 3 random upgrades: Fire Rate, Plasma Damage, Thruster Speed,
            Hull Capacity, Forcefield Shields, Multi-Barrel Spread, Armor-Piercing, Vacuum Magnet, Support
            Drones, or Auto-Repair.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition"
          >
            UNDERSTOOD
          </button>
        </div>
      </div>
    </div>
  );
};
