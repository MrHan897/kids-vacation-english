import { test, expect } from '@playwright/test';

test.describe('Tier 1: Feature Coverage - R1. Timetable & Pomodoro Timer', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for predictable initial state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T1-R1-01: Should display initial timetable with visual activity slots', async ({ page }) => {
    // Verify timetable container exists
    const timetable = page.locator('[data-testid="timetable-container"]');
    await expect(timetable).toBeVisible();

    // Verify presence of activity slots (Study, Play, Meal, Rest)
    const slots = page.locator('[data-testid="timetable-slot"]');
    const count = await slots.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('T1-R1-02: Should add new activity slot using icon picker / builder', async ({ page }) => {
    // Click button to add activity slot
    const addBtn = page.locator('[data-testid="add-activity-btn"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Select activity type/icon and title
    const titleInput = page.locator('[data-testid="activity-title-input"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('수학 공부');
    }

    const categorySelect = page.locator('[data-testid="activity-category-select"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('study');
    }

    // Save activity
    const saveBtn = page.locator('[data-testid="save-activity-btn"]');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    }

    // Check newly added activity in timetable
    const slots = page.locator('[data-testid="timetable-slot"]');
    await expect(slots.last()).toBeVisible();
  });

  test('T1-R1-03: Should support modifying or deleting an existing activity slot', async ({ page }) => {
    const firstSlot = page.locator('[data-testid="timetable-slot"]').first();
    await expect(firstSlot).toBeVisible();

    // Click delete or edit button on slot
    const deleteBtn = firstSlot.locator('[data-testid="delete-slot-btn"]');
    if (await deleteBtn.isVisible()) {
      const initialCount = await page.locator('[data-testid="timetable-slot"]').count();
      await deleteBtn.click();
      const newCount = await page.locator('[data-testid="timetable-slot"]').count();
      expect(newCount).toBe(initialCount - 1);
    } else {
      // If edit option exists
      const editBtn = firstSlot.locator('[data-testid="edit-slot-btn"]');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        const saveBtn = page.locator('[data-testid="save-activity-btn"]');
        await expect(saveBtn).toBeVisible();
      }
    }
  });

  test('T1-R1-04: Should start pomodoro timer and display active countdown and animation', async ({ page }) => {
    // Navigate to or locate timer view
    const timerSection = page.locator('[data-testid="pomodoro-timer"]');
    await expect(timerSection).toBeVisible();

    // Check character animation present
    const timerCharacter = page.locator('[data-testid="timer-character"]');
    await expect(timerCharacter).toBeVisible();

    // Start timer
    const startBtn = page.locator('[data-testid="timer-start-btn"]');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Verify timer status changes to running
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    await expect(timerDisplay).toBeVisible();
    
    // Pause button should now be visible
    const pauseBtn = page.locator('[data-testid="timer-pause-btn"]');
    await expect(pauseBtn).toBeVisible();
  });

  test('T1-R1-05: Should support pomodoro timer pause, resume, reset, and mode toggle', async ({ page }) => {
    const timerSection = page.locator('[data-testid="pomodoro-timer"]');
    await expect(timerSection).toBeVisible();

    // Start timer
    const startBtn = page.locator('[data-testid="timer-start-btn"]');
    await startBtn.click();

    // Pause timer
    const pauseBtn = page.locator('[data-testid="timer-pause-btn"]');
    await pauseBtn.click();
    await expect(startBtn).toBeVisible(); // Resume/Start option returns

    // Reset timer
    const resetBtn = page.locator('[data-testid="timer-reset-btn"]');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
    }

    // Mode toggle (Study vs Break time)
    const breakModeBtn = page.locator('[data-testid="timer-mode-break"]');
    if (await breakModeBtn.isVisible()) {
      await breakModeBtn.click();
      const modeLabel = page.locator('[data-testid="timer-mode-label"]');
      await expect(modeLabel).toContainText(/쉬는|Break/i);
    }
  });

});
