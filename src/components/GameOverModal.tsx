import React, { useState } from "react";
import { GameScoreState } from "@/game/types";
import { getDifficultyConfig } from "@/game/difficulty";
import { RotateCcw, Sliders, Trophy, Send, CheckCircle2, Home } from "lucide-react";

interface GameOverModalProps {
  scoreState: GameScoreState;
  personalBest: number;
  isNewPersonalBest: boolean;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
  onMainMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  scoreState,
  personalBest,
  isNewPersonalBest,
  onPlayAgain,
  onChangeDifficulty,
  onMainMenu,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const diffConfig = getDifficultyConfig(scoreState.difficulty);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || submitting || submitted) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName.trim(),
          score: scoreState.score,
          wave: scoreState.wave,
          difficulty: scoreState.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit score");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error submitting score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-rose-500 font-bold mb-1">
            CRITICAL HULL FAILURE // SIGNAL TERMINATED
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
            MISSION TERMINATED
          </h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border border-slate-700 bg-slate-800">
            <span style={{ color: diffConfig.accentColor }}>{diffConfig.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Multiplier x{diffConfig.scoreMultiplier}</span>
          </div>
        </div>

        {/* New PB Banner */}
        {isNewPersonalBest && (
          <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 flex items-center justify-center gap-2 text-amber-300 text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Trophy className="w-5 h-5 text-amber-400" />
            NEW PERSONAL BEST!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">FINAL SCORE</div>
            <div className="text-lg font-bold text-cyan-400">{scoreState.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">WAVE REACHED</div>
            <div className="text-lg font-bold text-white">{scoreState.wave}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">FOES ELIMINATED</div>
            <div className="text-lg font-bold text-rose-400">{scoreState.enemiesKilled}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">TIME SURVIVED</div>
            <div className="text-lg font-bold text-amber-400">
              {formatTime(scoreState.timeSurvivedSeconds)}
            </div>
          </div>
        </div>

        {/* Global Leaderboard Submission Form */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
            <span>TRANSMIT TO GLOBAL LEADERBOARD</span>
            <span className="text-[10px] text-slate-400 font-normal">PB: {personalBest.toLocaleString()}</span>
          </div>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Score recorded in the Galactic Registry!
            </div>
          ) : (
            <form onSubmit={handleSubmitScore} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter callsign (1-20 chars)"
                maxLength={20}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
              <button
                type="submit"
                disabled={submitting || !playerName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wider transition"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "SENDING..." : "SUBMIT"}
              </button>
            </form>
          )}

          {submitError && <div className="text-[11px] text-rose-400 mt-2">{submitError}</div>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" />
            PLAY AGAIN
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={onChangeDifficulty}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              CHANGE DIFFICULTY
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              LEADERBOARD
            </button>

            <button
              onClick={onMainMenu}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <Home className="w-3.5 h-3.5 text-rose-400" />
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
