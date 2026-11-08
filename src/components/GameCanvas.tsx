"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/game/engine";
import { GameState, GameScoreState, PlayerStats, UpgradeDefinition, UpgradeId, GameSettings } from "@/game/types";
import { DifficultyLevel } from "@/game/difficulty";
import { HUD } from "./HUD";
import { MainMenu } from "./MainMenu";
import { UpgradeModal } from "./UpgradeModal";
import { PauseMenu } from "./PauseMenu";
import { GameOverModal } from "./GameOverModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { HowToPlayModal } from "./HowToPlayModal";
import { TouchControls } from "./TouchControls";

const PB_STORAGE_KEY_PREFIX = "void_survivor_pb_";

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React State synced with GameEngine
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("normal");
  const [scoreState, setScoreState] = useState<GameScoreState>({
    score: 0,
    wave: 1,
    enemiesKilled: 0,
    timeSurvivedSeconds: 0,
    currentXp: 0,
    xpToNextLevel: 10,
    level: 1,
    difficulty: "normal",
  });
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 3,
    maxHp: 3,
    speed: 240,
    fireRate: 4,
    damage: 10,
    bulletCount: 1,
    pierce: 0,
    magnetRadius: 100,
    hasShield: false,
    shieldActive: false,
    shieldCooldownMax: 14,
    shieldCooldownCurrent: 0,
    hasDrone: false,
    droneAngle: 0,
    droneFireTimer: 0,
    nanoRepairTimer: 0,
    invulnerabilityTimer: 0,
  });
  const [activeUpgradeLevels, setActiveUpgradeLevels] = useState<Record<UpgradeId, number>>({
    fire_rate: 0,
    damage: 0,
    move_speed: 0,
    max_hp: 0,
    shield: 0,
    spread_shot: 0,
    piercing: 0,
    xp_magnet: 0,
    drone: 0,
    nano_repair: 0,
  });
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [bossData, setBossData] = useState<{ hp: number; maxHp: number; phase: number } | null>(null);
  const [pendingUpgrades, setPendingUpgrades] = useState<UpgradeDefinition[]>([]);

  // Modals state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundMuted: false,
    soundVolume: 0.5,
    reducedMotion: false,
    colorblindMode: false,
  });

  // Local Personal Bests
  const [personalBests, setPersonalBests] = useState<Record<DifficultyLevel, number>>({
    easy: 0,
    normal: 0,
    hard: 0,
    insane: 0,
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  // Load PBs from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaded: Record<DifficultyLevel, number> = { easy: 0, normal: 0, hard: 0, insane: 0 };
    (["easy", "normal", "hard", "insane"] as DifficultyLevel[]).forEach((diff) => {
      const val = localStorage.getItem(`${PB_STORAGE_KEY_PREFIX}${diff}`);
      if (val) loaded[diff] = parseInt(val, 10) || 0;
    });
    setPersonalBests(loaded);
  }, []);

  // Update Personal Best
  const checkAndUpdatePersonalBest = useCallback((diff: DifficultyLevel, score: number) => {
    setPersonalBests((prev) => {
      const current = prev[diff] || 0;
      if (score > current) {
        setIsNewPersonalBest(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(`${PB_STORAGE_KEY_PREFIX}${diff}`, score.toString());
        }
        return { ...prev, [diff]: score };
      }
      setIsNewPersonalBest(false);
      return prev;
    });
  }, []);

  // Initialize Canvas & Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, selectedDifficulty);
    engineRef.current = engine;

    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      engine.resize(width, height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Callbacks
    engine.onStateChange = (state) => {
      setGameState(state);
      if (state === "gameover") {
        checkAndUpdatePersonalBest(engine.difficulty, engine.score);
      }
    };

    engine.onScoreUpdate = (scoreData) => {
      setScoreState(scoreData);
      setPlayerStats({ ...engine.player.stats });
      setActiveUpgradeLevels({ ...engine.activeUpgradeLevels });
      setEnemiesRemaining(engine.enemiesRemainingToSpawn + engine.enemies.length);
    };

    engine.onUpgradeReady = (upgrades) => {
      setPendingUpgrades(upgrades);
    };

    engine.onBossUpdate = (boss) => {
      setBossData(boss);
    };

    // Render initial background menu stars
    engine.render();

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.destroy();
    };
  }, [selectedDifficulty, checkAndUpdatePersonalBest]);

  // Handle Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === "Escape") {
        if (engine.state === "playing") {
          engine.pauseGame();
        } else if (engine.state === "paused") {
          engine.resumeGame();
        }
        return;
      }

      if (e.code === "KeyW" || e.code === "ArrowUp") engine.input.up = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") engine.input.down = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") engine.input.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") engine.input.right = true;
      if (e.code === "Space") engine.input.shooting = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === "KeyW" || e.code === "ArrowUp") engine.input.up = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") engine.input.down = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") engine.input.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") engine.input.right = false;
      if (e.code === "Space") engine.input.shooting = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.input.mouseX = e.clientX;
      engine.input.mouseY = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (e.button === 0) {
        engine.input.shooting = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (e.button === 0) {
        engine.input.shooting = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.setDifficulty(selectedDifficulty);
    engineRef.current.startGame();
  };

  const handleSelectUpgrade = (upgradeId: UpgradeId) => {
    if (!engineRef.current) return;
    engineRef.current.selectUpgrade(upgradeId);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      engineRef.current?.updateSettings(updated);
      return updated;
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-mono">
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />

      {/* Main Menu */}
      {gameState === "menu" && (
        <MainMenu
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={(diff) => {
            setSelectedDifficulty(diff);
            engineRef.current?.setDifficulty(diff);
          }}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          personalBests={personalBests}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* HUD during active play / upgrade / paused */}
      {(gameState === "playing" || gameState === "paused" || gameState === "upgrade") && (
        <HUD
          scoreState={scoreState}
          playerStats={playerStats}
          activeUpgradeLevels={activeUpgradeLevels}
          enemiesRemaining={enemiesRemaining}
          boss={bossData}
          onPause={() => engineRef.current?.pauseGame()}
          muted={settings.soundMuted}
          onToggleMute={() => handleUpdateSettings({ soundMuted: !settings.soundMuted })}
        />
      )}

      {/* Touch controls for mobile */}
      {gameState === "playing" && engineRef.current && (
        <TouchControls input={engineRef.current.input} />
      )}

      {/* Upgrade Selection Modal */}
      {gameState === "upgrade" && (
        <UpgradeModal
          upgrades={pendingUpgrades}
          activeUpgradeLevels={activeUpgradeLevels}
          onSelect={handleSelectUpgrade}
        />
      )}

      {/* Pause Menu */}
      {gameState === "paused" && (
        <PauseMenu
          onResume={() => engineRef.current?.resumeGame()}
          onRestart={() => engineRef.current?.startGame()}
          onMainMenu={() => {
            engineRef.current?.destroy();
            setGameState("menu");
          }}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Game Over Modal */}
      {gameState === "gameover" && (
        <GameOverModal
          scoreState={scoreState}
          personalBest={personalBests[scoreState.difficulty] || 0}
          isNewPersonalBest={isNewPersonalBest}
          onPlayAgain={handleStartGame}
          onChangeDifficulty={() => setGameState("menu")}
          onMainMenu={() => setGameState("menu")}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          initialDifficulty={selectedDifficulty}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* How To Play Manual */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </main>
  );
};
