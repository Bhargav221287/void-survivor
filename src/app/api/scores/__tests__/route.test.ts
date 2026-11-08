import { describe, it, expect } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

describe("Leaderboard API Route", () => {
  it("GET returns scores for valid difficulty", async () => {
    const req = new NextRequest("http://localhost:3000/api/scores?difficulty=normal");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.difficulty).toBe("normal");
    expect(Array.isArray(data.scores)).toBe(true);
  });

  it("POST rejects missing or invalid fields", async () => {
    // Missing name
    const req1 = new NextRequest("http://localhost:3000/api/scores", {
      method: "POST",
      body: JSON.stringify({ score: 100, wave: 2, difficulty: "normal" }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);

    // Name too long (> 20 chars)
    const req2 = new NextRequest("http://localhost:3000/api/scores", {
      method: "POST",
      body: JSON.stringify({ name: "A".repeat(25), score: 100, wave: 2, difficulty: "normal" }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);

    // Negative score
    const req3 = new NextRequest("http://localhost:3000/api/scores", {
      method: "POST",
      body: JSON.stringify({ name: "PlayerOne", score: -50, wave: 2, difficulty: "normal" }),
    });
    const res3 = await POST(req3);
    expect(res3.status).toBe(400);

    // Invalid difficulty
    const req4 = new NextRequest("http://localhost:3000/api/scores", {
      method: "POST",
      body: JSON.stringify({ name: "PlayerOne", score: 1200, wave: 2, difficulty: "super-easy" }),
    });
    const res4 = await POST(req4);
    expect(res4.status).toBe(400);
  });

  it("POST saves valid score submission successfully", async () => {
    const req = new NextRequest("http://localhost:3000/api/scores", {
      method: "POST",
      body: JSON.stringify({ name: "VoidCaptain", score: 15400, wave: 5, difficulty: "hard" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.entry.name).toBe("VoidCaptain");
    expect(data.entry.score).toBe(15400);
  });
});
