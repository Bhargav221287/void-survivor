# VOID SURVIVOR

> A high-performance, single-player retro-futuristic wave-survival arena shooter built with Next.js (App Router), TypeScript, HTML5 Canvas, and Web Audio API.

🎮 **[Play Live on Vercel: https://void-survivor-eta.vercel.app](https://void-survivor-eta.vercel.app)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black.svg?style=for-the-badge&logo=vercel)](https://void-survivor-eta.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-729B1B.svg)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/e2e-Playwright-45ba4b.svg)](https://playwright.dev/)

---

## 🌌 Overview

In **VOID SURVIVOR**, you pilot an interceptor through hostile deep space sectors swarming with relentless biomechanical entities. Dodge incoming fire, eliminate enemy swarms, collect quantum XP orbs, and select tactical vessel augmentations between waves to survive as long as possible.

- **Zero Heavy Game Engines**: Custom delta-time fixed-timestep game loop rendered directly to HTML5 Canvas.
- **Spatial Hash Grid Collision Detection**: Fast $O(N)$ broad-phase collision detection handles hundreds of simultaneous entities smoothly at 60 FPS.
- **Procedural Audio Engine**: 100% synthesized sound effects powered by the Web Audio API (`OscillatorNode`, `GainNode`, and `BiquadFilterNode`) with zero external assets or copyright concerns.
- **Global Leaderboard & Local Personal Bests**: Server-side validated leaderboard powered by Next.js API routes with PostgreSQL / Supabase / Neon persistence and automatic graceful fallback.
- **Full Mobile Support**: Dynamic virtual analog joystick on the left screen and touch aim & fire controls on the right.
- **Accessibility Modes**: Full keyboard navigation, screen shake reduction (Reduced Motion), and Colorblind-safe palette silhouettes.

---

## 🎮 Controls

### Desktop
| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Interceptor** | `W`, `A`, `S`, `D` | `Arrow Keys` (↑, ←, ↓, →) |
| **Aim Weapon** | Mouse Movement | Auto-aim (Cadet mode) |
| **Fire Plasma Cannons** | `Left Click` (Click or Hold) | `Spacebar` |
| **Pause / Resume** | `Escape` | Pause HUD button |
| **Select Upgrade** | Keys `[1]`, `[2]`, `[3]` | Mouse Click / Tap |

### Mobile / Touch
- **Movement**: Touch and drag on the **left half** of the screen to activate the floating virtual joystick.
- **Aim & Fire**: Touch/hold anywhere on the **right half** of the screen or press the dedicated glowing **FIRE** button.

---

## ⚡ Difficulty Levels

Difficulty balance is centralized in [`src/game/difficulty.ts`](file:///c:/Users/bharg/OneDrive/Desktop/CODE/void-survivor/src/game/difficulty.ts):

| Mode | Enemy Speed | Enemy HP | Spawn Cadence | Player Hull | Auto-Aim | Heal Drop Rate | Score Multiplier | Special Threat |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Cadet (Easy)** | `0.7x` | `0.7x` | Slow (`1.4x`) | 5 HP | Enabled | 20% | **x1.0** | Boss every 10 waves |
| **Survivor (Normal)** | `1.0x` | `1.0x` | Standard (`1.0x`) | 3 HP | Disabled | 6% | **x1.5** | Standard swarms |
| **Veteran (Hard)** | `1.3x` | `1.5x` | Fast (`0.75x`) | 3 HP | Disabled | 3% | **x2.0** | Elite foes from Wave 5, Boss every 5 waves |
| **Void Nightmare (Insane)** | `1.6x` | `2.0x` | Very Fast (`0.55x`) | 1 HP | Disabled | **0% (None)** | **x3.0** | Elite foes from Wave 3, Dreadnought Boss every 5 waves |

---

## 👾 Enemy Archetypes

1. **Chaser** *(Sharp Triangle)*: Fast, nimble swarming units that charge directly towards the vessel. Weak individually, lethal in packs.
2. **Tank** *(Armored Hexagon)*: Heavily plated juggernauts with massive HP pools and high mass. Resist knockback.
3. **Shooter** *(Precision Diamond)*: Maintains a perimeter distance (~240px) while orbiting and launching high-velocity plasma bolts.
4. **Boss Dreadnought** *(Titan Fortress)*: Multi-phase leviathan.
   - **Phase 1**: Sweeping 5-way spread cannons and direct charges.
   - **Phase 2 (Enraged)**: Triggered at 50% HP. Emits spinning radial spiral bullet rings, increased movement speed, and deploys minion escorts.

---

## 🛠️ Upgrades Catalog

Surviving each wave allows you to pick 1 of 3 randomly chosen ship augments:
- **Rapid Pulse Accelerator**: +25% firing cycle speed.
- **Plasma Supercharger**: +30% projectile damage per hit.
- **Ionic Thrusters**: +20% ship movement velocity and agility.
- **Reinforced Hull Plating**: +1 Max HP capacity and instantly repairs 1 HP.
- **Deflector Forcefield**: Generates an energy shield that absorbs 1 fatal blow every 14 seconds.
- **Multi-Barrel Cannon**: Fires +1 additional spread projectile simultaneously.
- **Armor-Piercing Rounds**: Projectiles pierce through +1 additional enemy before dissipating.
- **Gravity Collector**: +100% magnetic attraction radius for XP and heal orbs.
- **Autonomous Escort Drone**: Deploys an orbiting automated combat drone that fires at nearby targets.
- **Nanite Hull Regenerator**: Nanomachines passively restore 1 HP every 25 seconds.

---

## 🧱 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: Strict TypeScript 5
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 2D Canvas with devicePixelRatio Retina scaling
- **Game Architecture**: Decoupled pure TypeScript classes in [`src/game/`](file:///c:/Users/bharg/OneDrive/Desktop/CODE/void-survivor/src/game/)
- **Audio**: Web Audio API (Synthesized Oscillators & Gain Nodes)
- **Database / API**: Next.js Serverless Route Handlers (`/api/scores`), PostgreSQL (`pg` pool) / Neon / Supabase with in-memory resilient fallback
- **Testing**:
  - **Unit Testing**: Vitest (Difficulty scaling, spatial hash grid collisions, scoring, player & upgrades, API route validation)
  - **E2E & Smoke Testing**: Playwright (Full browser session, difficulty verification, canvas rendering, modal flows)

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/Bhargav221287/void-survivor.git
cd void-survivor
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local` to enable PostgreSQL global leaderboard persistence:
```bash
cp .env.example .env.local
```
*(If no database connection string is provided, the application automatically runs in resilient in-memory fallback mode).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suites
```bash
# Run Vitest unit tests
npm test

# Run Playwright end-to-end smoke & difficulty tests
npm run test:e2e

# Run linting
npm run lint

# Run production build
npm run build
```

---

## 🌐 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `POSTGRES_URL` | PostgreSQL connection string (Vercel Postgres, Supabase, Neon) | In-memory fallback |
| `DATABASE_URL` | Alternate PostgreSQL connection string | In-memory fallback |

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository into your **[Vercel Dashboard](https://vercel.com/new)**.
3. In **Project Settings > Storage**, attach a **Vercel Postgres** or **Neon / Supabase** database.
4. Vercel automatically populates `POSTGRES_URL`.
5. Click **Deploy**. The table `void_leaderboard` is automatically created on first query!

---

## 👤 Author
Created with 🚀 by **[Bhargav (Bhargav221287)](https://github.com/Bhargav221287)**

---

## 📜 License
MIT License. Created for the VOID SURVIVOR challenge.
