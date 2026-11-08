import { test, expect } from "@playwright/test";

test.describe("VOID SURVIVOR Smoke Test", () => {
  test("loads the page, navigates menus, initiates a run, and renders canvas & HUD", async ({
    page,
  }) => {
    // 1. Load the game page
    await page.goto("/");

    // 2. Check title and main menu header
    await expect(page).toHaveTitle(/VOID SURVIVOR/);
    const mainTitle = page.locator("h1");
    await expect(mainTitle).toContainText("VOID SURVIVOR");

    // 3. Verify difficulty selectors are present
    await expect(page.getByText("Cadet (Easy)")).toBeVisible();
    await expect(page.getByText("Survivor (Normal)")).toBeVisible();
    await expect(page.getByText("Veteran (Hard)")).toBeVisible();
    await expect(page.getByText("Void Nightmare (Insane)")).toBeVisible();

    // 4. Test opening How to Play manual
    await page.getByRole("button", { name: /HOW TO PLAY/i }).click();
    await expect(page.getByText("PILOT MANUAL // ARCHITECTURE")).toBeVisible();
    await page.getByRole("button", { name: /UNDERSTOOD/i }).click();
    await expect(page.getByText("PILOT MANUAL // ARCHITECTURE")).not.toBeVisible();

    // 5. Select a difficulty (e.g. Veteran / Hard) and start game
    await page.getByText("Veteran (Hard)").click();
    const startButton = page.getByRole("button", { name: /INITIATE RUN/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 6. Verify HTML5 canvas is rendered and active
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Ensure canvas dimensions are non-zero
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(100);
    expect(boundingBox!.height).toBeGreaterThan(100);

    // 7. Verify HUD appears during combat
    await expect(page.getByText("HULL")).toBeVisible();
    await expect(page.getByText("WAVE")).toBeVisible();
    await expect(page.getByText("SCORE")).toBeVisible();
    await expect(page.getByText("LVL")).toBeVisible();

    // 8. Test pausing simulation with Escape
    await page.keyboard.press("Escape");
    await expect(page.getByText("GAME PAUSED")).toBeVisible();

    // Test resuming simulation
    await page.keyboard.press("Escape");
    await expect(page.getByText("GAME PAUSED")).not.toBeVisible();
  });

  test("verifies Leaderboard API endpoint returns valid JSON", async ({ request }) => {
    const response = await request.get("/api/scores?difficulty=normal");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.difficulty).toBe("normal");
    expect(Array.isArray(data.scores)).toBe(true);
  });
});

