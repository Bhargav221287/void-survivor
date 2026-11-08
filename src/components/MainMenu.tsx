import React from "react";
import { DifficultyLevel, DIFFICULTY_CONFIGS } from "@/game/difficulty";
import { GameSettings } from "@/game/types";
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Sparkles, Eye, ShieldAlert } from "lucide-react";

interface MainMenuProps {
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  personalBests: Record<DifficultyLevel, number>;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenLeaderboard,
  onOpenHowToPlay,
  personalBests,
  settings,
  onUpdateSettings,
}) => {
  const diffs: DifficultyLevel[] = ["easy", "normal", "hard", "insane"];
  const currentPB = personalBests[selectedDifficulty] || 0;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 font-mono select-none overflow-y-auto">
      {/* Top Bar: Controls & Sound */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
            SYSTEM ONLINE // V1.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateSettings({ soundMuted: !settings.soundMuted })}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs"
            title="Toggle Audio"
          >
            {settings.soundMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-8 my-auto z-10 py-6">
        {/* Title & Tagline */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
            TOP-DOWN WAVE SURVIVAL ARENA
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
            VOID SURVIVOR
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
            Pilot your interceptor through endless waves of hostile biomechanical swarmers.
            Harvest quantum XP and augment your vessel before you are overwhelmed.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              CHOOSE COMBAT PROTOCOL
            </span>
            <span className="text-xs text-amber-400 font-bold">
              PERSONAL BEST: {currentPB > 0 ? currentPB.toLocaleString() : "NONE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {diffs.map((d) => {
              const config = DIFFICULTY_CONFIGS[d];
              const isSelected = selectedDifficulty === d;
              const pb = personalBests[d] || 0;

              return (
                <button
                  key={d}
                  onClick={() => onSelectDifficulty(d)}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl text-left transition-all duration-150 border-2 ${
                    isSelected
                      ? "bg-slate-900 shadow-xl -translate-y-1"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isSelected ? config.accentColor : undefined,
                    boxShadow: isSelected ? `0 0 20px ${config.accentColor}33` : undefined,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-white">{config.name}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${config.accentColor}25`,
                          color: config.accentColor,
                        }}
                      >
                        x{config.scoreMultiplier}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-300 mb-1">{config.tagline}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{config.description}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">SECTOR PB</span>
                    <span className="font-bold text-slate-300">{pb > 0 ? pb.toLocaleString() : "-"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="w-full flex flex-col items-center gap-3">
          <button
            onClick={onStartGame}
            className="w-full sm:w-80 py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-lg tracking-wider transition-all duration-150 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:scale-105 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            INITIATE RUN
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHowToPlay}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-bold transition"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              HOW TO PLAY
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-bold transition"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              LEADERBOARD
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Settings Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-4 z-10">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Reduced Motion
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={settings.colorblindMode}
              onChange={(e) => onUpdateSettings({ colorblindMode: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Colorblind-Safe Palettes
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Created by{" "}
            <a
              href="https://github.com/Bhargav221287"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2 transition-colors"
            >
              Bhargav
            </a>
          </span>
          <span>&bull;</span>
          <span>VOID SURVIVOR</span>
        </div>
      </div>
    </div>
  );
};
