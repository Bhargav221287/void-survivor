import { test, expect } from "@playwright/test";

test.describe("VOID SURVIVOR - Difficulty Balancing & Playtest", () => {
  test("Cadet (Easy) starts with 5 HP and x1 multiplier", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Cadet (Easy)").click();
    await page.getByRole("button", { name: /INITIATE RUN/i }).click();

    // Verify 5 HP hearts
    const hearts = page.locator("svg.text-rose-500");
    await expect(hearts).toHaveCount(5);

    // Verify x1 multiplier badge in HUD
    await expect(page.getByText("x1", { exact: true })).toBeVisible();
    await expect(page.getByText("CADET")).toBeVisible();
  });

  test("Survivor (Normal) starts with 3 HP and x1.5 multiplier", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Survivor (Normal)").click();
    await page.getByRole("button", { name: /INITIATE RUN/i }).click();

    const hearts = page.locator("svg.text-rose-500");
    await expect(hearts).toHaveCount(3);

    await expect(page.getByText("x1.5")).toBeVisible();
    await expect(page.getByText("SURVIVOR")).toBeVisible();
  });

  test("Veteran (Hard) starts with 3 HP and x2 multiplier", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Veteran (Hard)").click();
    await page.getByRole("button", { name: /INITIATE RUN/i }).click();

    const hearts = page.locator("svg.text-rose-500");
    await expect(hearts).toHaveCount(3);

    await expect(page.getByText("x2")).toBeVisible();
    await expect(page.getByText("VETERAN")).toBeVisible();
  });

  test("Void Nightmare (Insane) starts with 1 HP and x3 multiplier", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Void Nightmare (Insane)").click();
    await page.getByRole("button", { name: /INITIATE RUN/i }).click();

    // 1 HP only
    const hearts = page.locator("svg.text-rose-500");
    await expect(hearts).toHaveCount(1);

    await expect(page.getByText("x3")).toBeVisible();
    await expect(page.getByText("VOID")).toBeVisible();
  });
});

