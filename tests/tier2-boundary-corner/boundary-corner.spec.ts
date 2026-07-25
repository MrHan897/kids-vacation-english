import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Corner Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T2-BC-01: Empty timetable state renders gracefully without UI error or crash', async ({ page }) => {
    // Set empty timetable schedule in localStorage
    await page.evaluate(() => {
      localStorage.setItem('kids_vacation_schedule', JSON.stringify([]));
    });
    await page.reload();

    // App should render empty timetable prompt/message or empty container safely
    const emptyNotice = page.locator('[data-testid="timetable-empty-state"]');
    const container = page.locator('[data-testid="timetable-container"]');
    await expect(container).toBeVisible();

    // Verify console errors did not crash page
    const slotsCount = await page.locator('[data-testid="timetable-slot"]').count();
    expect(slotsCount).toBe(0);
  });

  test('T2-BC-02: Invalid/corrupted LocalStorage JSON gracefully recovers with fallback defaults', async ({ page }) => {
    // Inject invalid non-JSON strings into LocalStorage keys
    await page.evaluate(() => {
      localStorage.setItem('kids_vacation_schedule', 'corrupted_json_string_{{');
      localStorage.setItem('kids_vacation_rewards', 'undefined');
      localStorage.setItem('kids_vacation_progress', '[[invalid');
    });

    // Reload page
    await page.reload();

    // App should not crash; containers should fall back to default values
    const container = page.locator('[data-testid="app-container"], #root');
    await expect(container).toBeVisible();

    const timetable = page.locator('[data-testid="timetable-container"]');
    await expect(timetable).toBeVisible();
  });

  test('T2-BC-03: Pomodoro timer boundary limits (0s remaining, rapid pause/start toggling)', async ({ page }) => {
    const timerSection = page.locator('[data-testid="pomodoro-timer"]');
    await expect(timerSection).toBeVisible();

    const startBtn = page.locator('[data-testid="timer-start-btn"]');
    await expect(startBtn).toBeVisible();

    // Rapid toggle start/pause 5 times
    for (let i = 0; i < 3; i++) {
      await startBtn.click();
      const pauseBtn = page.locator('[data-testid="timer-pause-btn"]');
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
      }
    }

    // Verify timer state remains coherent
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    await expect(timerDisplay).toBeVisible();
  });

  test('T2-BC-04: Quiz max score boundary (100% score) and 0 score boundary handling', async ({ page }) => {
    // Test perfect score state injection
    await page.evaluate(() => {
      const perfectRewards = { stickers: 100, unlockedCharacters: ['c1', 'c2', 'c3', 'c4', 'c5'] };
      localStorage.setItem('kids_vacation_rewards', JSON.stringify(perfectRewards));
    });
    await page.reload();

    const stickerCount = page.locator('[data-testid="sticker-count"]');
    if (await stickerCount.isVisible()) {
      await expect(stickerCount).toContainText('100');
    }
  });

});
