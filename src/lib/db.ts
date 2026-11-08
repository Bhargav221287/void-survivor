import { Pool } from "pg";

export interface LeaderboardEntry {
  id: string | number;
  name: string;
  score: number;
  wave: number;
  difficulty: "easy" | "normal" | "hard" | "insane";
  created_at: string;
}

let pool: Pool | null = null;

// In-memory fallback cache for development or when database is not yet provisioned
const fallbackScores: LeaderboardEntry[] = [
  { id: 1, name: "VoidWalker", score: 45200, wave: 18, difficulty: "insane", created_at: new Date().toISOString() },
  { id: 2, name: "NovaStrike", score: 32400, wave: 14, difficulty: "hard", created_at: new Date().toISOString() },
  { id: 3, name: "AstroAce", score: 28100, wave: 12, difficulty: "normal", created_at: new Date().toISOString() },
  { id: 4, name: "StarCadet", score: 19500, wave: 10, difficulty: "easy", created_at: new Date().toISOString() },
];

function getPool(): Pool | null {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

/**
 * Initializes the database schema if running against PostgreSQL.
 */
export async function initDb(): Promise<void> {
  const p = getPool();
  if (!p) return;

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS void_leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL,
        wave INTEGER NOT NULL,
        difficulty VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_void_diff_score ON void_leaderboard (difficulty, score DESC);
    `);
  } catch (err) {
    console.warn("Failed to ensure database table exists, falling back to local storage:", err);
  }
}

/**
 * Inserts a verified leaderboard score.
 */
export async function addScore(
  name: string,
  score: number,
  wave: number,
  difficulty: "easy" | "normal" | "hard" | "insane"
): Promise<LeaderboardEntry> {
  const p = getPool();
  if (p) {
    try {
      await initDb();
      const res = await p.query(
        `INSERT INTO void_leaderboard (name, score, wave, difficulty)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, score, wave, difficulty, created_at`,
        [name, score, wave, difficulty]
      );
      return res.rows[0];
    } catch (err) {
      console.warn("Postgres insert failed, falling back:", err);
    }
  }

  // Fallback in-memory store
  const newEntry: LeaderboardEntry = {
    id: Date.now() + Math.random(),
    name,
    score,
    wave,
    difficulty,
    created_at: new Date().toISOString(),
  };
  fallbackScores.push(newEntry);
  return newEntry;
}

/**
 * Retrieves top 10 leaderboard scores for the specified difficulty.
 */
export async function getTopScores(
  difficulty: "easy" | "normal" | "hard" | "insane",
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const p = getPool();
  if (p) {
    try {
      await initDb();
      const res = await p.query(
        `SELECT id, name, score, wave, difficulty, created_at
         FROM void_leaderboard
         WHERE difficulty = $1
         ORDER BY score DESC
         LIMIT $2`,
        [difficulty, limit]
      );
      return res.rows;
    } catch (err) {
      console.warn("Postgres fetch failed, using fallback:", err);
    }
  }

  // Fallback in-memory
  return fallbackScores
    .filter((s) => s.difficulty === difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

