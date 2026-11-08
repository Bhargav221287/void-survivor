# VOID SURVIVOR - ARCHITECTURE & IMPLEMENTATION PLAN

## Overview
**VOID SURVIVOR** is a high-performance top-down wave-survival arena shooter built with Next.js (App Router), TypeScript, Tailwind CSS, and HTML5 Canvas. The game features 4 difficulty modes, 4 enemy types (including multi-phase bosses), 8+ upgrades, particle and screen shake effects, spatial hash grid collision detection, Web Audio procedural SFX, local personal best tracking, global leaderboard API with server-side validation and database persistence, virtual joystick touch controls for mobile, and comprehensive accessibility settings.

---

## Architecture

### 1. Game Engine Layer (`src/game/`)
Pure TypeScript classes independent of React rendering lifecycle for deterministic fixed-timestep simulation:
- **`difficulty.ts`**: Typed configuration object defining multipliers, health, auto-aim, spawn rates, elite/boss waves, and score multipliers across Easy, Normal, Hard, and Insane.
- **`types.ts`**: Core entities, vector math, weapon definitions, upgrades, particle configs, audio events.
- **`spatial-grid.ts`**: Spatial Hash Grid partitioning 2D space into discrete buckets for $O(N)$ broad-phase collision detection instead of $O(N^2)$.
- **`entities/`**:
  - `Player.ts`: Movement (WASD/arrows/touch joystick), mouse aim / auto-aim, shield system, invulnerability frames, firing mechanics.
  - `Enemy.ts`: Base class & archetypes:
    - `Chaser`: Fast, low HP, swarming behavior.
    - `Tank`: Slow, high HP, heavy mass, knockback resistance.
    - `Shooter`: Keeps perimeter distance, aims and fires plasma projectiles.
    - `Boss`: Multi-phase behavior (Phase 1: rotating radial spreads + charge; Phase 2: rapid burst lasers + summoned minions).
  - `Projectile.ts`: Player and enemy bullets with speed, damage, lifetime, pierce counter.
  - `Orb.ts`: XP and health pickups with magnetic attraction radius.
  - `Particle.ts`: Particle effects for explosions, engine thruster trails, hit sparks, level-up nova.
- **`sound.ts`**: Synthesized procedural audio using Web Audio API (OscillatorNode, GainNode, BiquadFilterNode) with zero copyrighted assets and instant mute/volume controls.
- **`engine.ts`**: Main `GameEngine` class:
  - Fixed-timestep accumulator (60Hz tick) with `requestAnimationFrame` rendering.
  - Canvas viewport management with Retina/devicePixelRatio scaling.
  - Screen shake and hit flash render passes.
  - Wave generator and difficulty scaling.
  - State event emitter (`onStateChange`, `onWaveComplete`, `onGameOver`, `onScoreUpdate`).

### 2. UI & React Integration Layer (`src/components/`, `src/app/`)
Next.js App Router with responsive Tailwind styling and accessible cyberpunk / deep space aesthetic:
- **`MainMenu.tsx`**: Difficulty selection with visual modifier stats, Start button, How to Play modal, Leaderboard modal, SFX mute toggle.
- **`GameCanvas.tsx`**: Host for the HTML5 `<canvas>`, touch joystick listeners, key/mouse event bridges, focus/visibility pause hooks.
- **`HUD.tsx`**: Real-time HP bar / hearts, shield indicator, wave counter & progress, score with multiplier, XP progress bar, current difficulty badge.
- **`UpgradeModal.tsx`**: Card selection modal presenting 3 random upgrades at the end of each wave.
- **`PauseMenu.tsx`**: Esc key triggered menu (Resume, Restart, Audio Settings, How to Play, Quit).
- **`GameOverModal.tsx`**: Stats breakdown (score, wave, enemies defeated, time survived), local personal best indicator, global leaderboard submission form.
- **`LeaderboardModal.tsx`**: Tabbed leaderboard showing Top 10 scores per difficulty.
- **`TouchControls.tsx`**: Dual touch virtual joystick (left stick movement, right touch/button aim & fire) for mobile devices.

### 3. API & Persistence Layer (`src/app/api/scores/`)
- `POST /api/scores`: Validates player name (1-20 chars, sanitized), score (> 0), wave (> 0), difficulty (valid enum). Rate-limited.
- `GET /api/scores?difficulty=...`: Returns top 10 scores sorted descending.
- Persistent backend via PostgreSQL (`POSTGRES_URL` / `DATABASE_URL` / Vercel Postgres / Neon) with graceful automatic fallback for offline/local development.
- Local personal bests synced to `localStorage`.

### 4. Accessibility & Polish
- Full keyboard navigation for all menus (`Tab`, `Enter`, `Escape`, `Space`).
- Reduced-motion toggle (disables screen shake, softens particle density).
- Colorblind-safe mode (distinct geometric silhouettes for every enemy type + high contrast palettes).

---

## Task List & Execution Phases

- [x] Phase 1: Planning (`PLAN.md`) & Scaffolding (Next.js 14, Tailwind, TypeScript, Vitest, Playwright).
- [ ] Phase 2: Difficulty Configuration (`src/game/difficulty.ts`) & Unit Tests.
- [ ] Phase 3: Spatial Hash Grid & Collision Detection with Vitest validation.
- [ ] Phase 4: Core Game Entities (Player, Enemies, Projectiles, Orbs, Particles).
- [ ] Phase 5: Web Audio Sound Manager (procedural SFX).
- [ ] Phase 6: Game Engine, Wave Manager, and Fixed-Timestep Loop.
- [ ] Phase 7: React Canvas integration, HUD, Upgrade Modal, Pause & Game Over screens.
- [ ] Phase 8: Mobile Touch Controls (Virtual Joystick).
- [ ] Phase 9: Global Leaderboard API Route & Database Integration.
- [ ] Phase 10: Local storage personal bests, Accessibility, and Settings.
- [ ] Phase 11: Unit Tests, Playwright Smoke Test, Lint & Typecheck verification.
- [ ] Phase 12: Documentation (`README.md`, `.env.example`).
- [ ] Phase 13: Git Commits, GitHub Repo Creation (`void-survivor`), and Push to `main`.
- [ ] Phase 14: Vercel Production Deployment & Live Verification.
