import React, { useState, useEffect } from "react";
import { DifficultyLevel, DIFFICULTY_CONFIGS } from "@/game/difficulty";
import { LeaderboardEntry } from "@/lib/db";
import { Trophy, X, RotateCw, Medal } from "lucide-react";

interface LeaderboardModalProps {
  initialDifficulty?: DifficultyLevel;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  initialDifficulty = "normal",
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async (diff: DifficultyLevel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scores?difficulty=${diff}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load leaderboard");
      }
      setScores(data.scores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(selectedDifficulty);
  }, [selectedDifficulty]);

  const diffs: DifficultyLevel[] = ["easy", "normal", "hard", "insane"];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider">
                GALACTIC LEADERBOARD
              </h2>
              <p className="text-[11px] text-slate-400">Top 10 void survivors across recorded sectors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            aria-label="Close leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {diffs.map((d) => {
            const config = DIFFICULTY_CONFIGS[d];
            const isSelected = selectedDifficulty === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                  isSelected
                    ? "bg-slate-800 text-white shadow-lg"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
                style={{
                  borderColor: isSelected ? config.accentColor : undefined,
                  boxShadow: isSelected ? `0 0 10px ${config.accentColor}40` : undefined,
                }}
              >
                <div>{config.name.split(" ")[0]}</div>
                <div className="text-[9px] text-slate-500 font-normal">x{config.scoreMultiplier}</div>
              </button>
            );
          })}
        </div>

        {/* Scores Table */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden min-h-[280px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <RotateCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Querying sector telemetry...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-rose-400 text-xs p-4 text-center">
              <span>{error}</span>
              <button
                onClick={() => fetchScores(selectedDifficulty)}
                className="mt-2 px-3 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700 hover:bg-slate-700"
              >
                Retry
              </button>
            </div>
          ) : scores.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-4">
              No recorded records for this difficulty yet. Be the first to conquer the void!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Callsign</th>
                    <th className="py-2.5 px-3 text-right">Wave</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scores.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        idx === 0
                          ? "bg-amber-500/5 text-amber-200"
                          : idx === 1
                          ? "bg-slate-400/5 text-slate-200"
                          : idx === 2
                          ? "bg-amber-700/5 text-amber-300"
                          : "text-slate-300"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                        {idx === 0 ? (
                          <Medal className="w-4 h-4 text-amber-400" />
                        ) : idx === 1 ? (
                          <Medal className="w-4 h-4 text-slate-400" />
                        ) : idx === 2 ? (
                          <Medal className="w-4 h-4 text-amber-600" />
                        ) : (
                          <span className="w-4 text-center text-slate-500 text-[11px]">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{entry.name}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{entry.wave}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider transition border border-slate-700"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

