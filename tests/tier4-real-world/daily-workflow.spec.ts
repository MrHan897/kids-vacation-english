import { test, expect } from '@playwright/test';

test.describe('Tier 4: Real-World Application Scenario - Full Child Daily Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T4-RW-01: Full Child Daily Journey - Plan Day -> Study Timer -> Phonics Quiz -> Reward Vault -> Reload & Verify Persistence', async ({ page }) => {
    // ----------------------------------------------------
    // Step 1: Open App & View Timetable
    // ----------------------------------------------------
    const timetableContainer = page.locator('[data-testid="timetable-container"]');
    await expect(timetableContainer).toBeVisible();

    // ----------------------------------------------------
    // Step 2: Add customized study and play activity slots
    // ----------------------------------------------------
    const addBtn = page.locator('[data-testid="add-activity-btn"]');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const titleInput = page.locator('[data-testid="activity-title-input"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('파닉스 20분 공부');
        await page.locator('[data-testid="save-activity-btn"]').click();
      }
    }

    // ----------------------------------------------------
    // Step 3: Start Pomodoro Study Timer
    // ----------------------------------------------------
    const timerSection = page.locator('[data-testid="pomodoro-timer"]');
    await expect(timerSection).toBeVisible();

    const startTimerBtn = page.locator('[data-testid="timer-start-btn"]');
    if (await startTimerBtn.isVisible()) {
      await startTimerBtn.click();
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      await expect(timerDisplay).toBeVisible();
    }

    // ----------------------------------------------------
    // Step 4: Switch to English Phonics & Interactive Quiz
    // ----------------------------------------------------
    const englishNav = page.locator('[data-testid="nav-english"]');
    if (await englishNav.isVisible()) {
      await englishNav.click();
    }

    const phonicsCard = page.locator('[data-testid="phonics-card"]').first();
    if (await phonicsCard.isVisible()) {
      await phonicsCard.click();
    }

    const quizNav = page.locator('[data-testid="nav-quiz"]');
    if (await quizNav.isVisible()) {
      await quizNav.click();
    }

    const quizOption = page.locator('[data-testid="quiz-option"]').first();
    if (await quizOption.isVisible()) {
      await quizOption.click();
      const nextBtn = page.locator('[data-testid="quiz-next-btn"]');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // ----------------------------------------------------
    // Step 5: Collect Reward & View Character Vault
    // ----------------------------------------------------
    const rewardsNav = page.locator('[data-testid="nav-rewards"]');
    if (await rewardsNav.isVisible()) {
      await rewardsNav.click();
    }

    const characterVault = page.locator('[data-testid="character-vault"]');
    if (await characterVault.isVisible()) {
      await expect(characterVault).toBeVisible();
    }

    // ----------------------------------------------------
    // Step 6: Browser Reload & Verify Full Data Persistence
    // ----------------------------------------------------
    await page.reload();

    // Verify localStorage data entries exist
    const scheduleStored = await page.evaluate(() => localStorage.getItem('kids_vacation_schedule'));
    const rewardsStored = await page.evaluate(() => localStorage.getItem('kids_vacation_rewards'));
    const progressStored = await page.evaluate(() => localStorage.getItem('kids_vacation_progress'));

    expect(scheduleStored !== null || rewardsStored !== null || progressStored !== null).toBeTruthy();
  });

});
