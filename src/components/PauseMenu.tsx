import React from "react";
import { GameSettings } from "@/game/types";
import { Play, RotateCcw, Home, HelpCircle, Volume2, VolumeX, Eye, Sparkles } from "lucide-react";

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenHowToPlay: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  onOpenHowToPlay,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-md w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">
            SIMULATION SUSPENDED
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-wider">GAME PAUSED</h2>
          <p className="text-xs text-slate-400 mt-1">Press [Esc] to resume immediately</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            RESUME (ESC)
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            RESTART MISSION
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            HOW TO PLAY
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-200 border border-slate-700 hover:border-rose-700/60 transition"
          >
            <Home className="w-4 h-4 text-rose-400" />
            QUIT TO MAIN MENU
          </button>
        </div>

        {/* Quick Settings Toggles */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            ACCESSIBILITY & AUDIO
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onUpdateSettings({ soundMuted: !settings.soundMuted })}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                settings.soundMuted
                  ? "bg-slate-900 border-slate-700 text-slate-400"
                  : "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {settings.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                Sound
              </span>
              <span className="font-bold">{settings.soundMuted ? "OFF" : "ON"}</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                settings.reducedMotion
                  ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Reduced Motion
              </span>
              <span className="font-bold">{settings.reducedMotion ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ colorblindMode: !settings.colorblindMode })}
              className={`sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg border transition ${
                settings.colorblindMode
                  ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Colorblind-Safe Silhouettes & Contrast
              </span>
              <span className="font-bold">{settings.colorblindMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-[11px] text-slate-500 pt-1">
          Created by{" "}
          <a
            href="https://github.com/Bhargav221287"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2 transition-colors"
          >
            Bhargav
          </a>{" "}
          &bull; VOID SURVIVOR
        </div>
      </div>
    </div>
  );
};

