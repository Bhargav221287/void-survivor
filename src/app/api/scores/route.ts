import { NextRequest, NextResponse } from "next/server";
import { getTopScores, addScore } from "@/lib/db";
import { DifficultyLevel } from "@/game/difficulty";

// In-memory IP rate limiter (5 submissions per 60s window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

const VALID_DIFFICULTIES: Set<DifficultyLevel> = new Set<DifficultyLevel>(["easy", "normal", "hard", "insane"]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get("difficulty") as DifficultyLevel | null;

    const difficulty: DifficultyLevel =
      difficultyParam && VALID_DIFFICULTIES.has(difficultyParam) ? difficultyParam : "normal";

    const scores = await getTopScores(difficulty, 10);
    return NextResponse.json({ success: true, difficulty, scores });
  } catch (error) {
    console.error("GET /api/scores error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Basic IP rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, score, wave, difficulty } = body;

    // 1. Name validation
    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const sanitizedName = name.trim().replace(/[<>]/g, ""); // Strip potential HTML tags
    if (sanitizedName.length < 1 || sanitizedName.length > 20) {
      return NextResponse.json(
        { success: false, error: "Name must be between 1 and 20 characters long" },
        { status: 400 }
      );
    }

    // 2. Score bounds validation
    if (typeof score !== "number" || !Number.isFinite(score) || score <= 0 || score > 10000000) {
      return NextResponse.json({ success: false, error: "Invalid score value" }, { status: 400 });
    }

    // 3. Wave validation
    if (typeof wave !== "number" || !Number.isInteger(wave) || wave < 1 || wave > 500) {
      return NextResponse.json({ success: false, error: "Invalid wave value" }, { status: 400 });
    }

    // 4. Difficulty validation
    if (!difficulty || !VALID_DIFFICULTIES.has(difficulty as DifficultyLevel)) {
      return NextResponse.json(
        { success: false, error: "Difficulty must be one of: easy, normal, hard, insane" },
        { status: 400 }
      );
    }

    const savedEntry = await addScore(
      sanitizedName,
      Math.round(score),
      wave,
      difficulty as DifficultyLevel
    );

    return NextResponse.json({ success: true, entry: savedEntry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/scores error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
