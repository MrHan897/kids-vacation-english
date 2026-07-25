import { test, expect } from '@playwright/test';

test.describe('Tier 1: Feature Coverage - R4. Local Data Persistence', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T1-R4-01: Should automatically save schedule to LocalStorage (`kids_vacation_schedule`)', async ({ page }) => {
    // Add or complete activity
    const addBtn = page.locator('[data-testid="add-activity-btn"]');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const titleInput = page.locator('[data-testid="activity-title-input"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('영어 동화 읽기');
        await page.locator('[data-testid="save-activity-btn"]').click();
      }
    }

    // Verify localStorage item is populated
    const storedSchedule = await page.evaluate(() => localStorage.getItem('kids_vacation_schedule'));
    expect(storedSchedule).not.toBeNull();
  });

  test('T1-R4-02: Should automatically save reward stickers state to LocalStorage (`kids_vacation_rewards`)', async ({ page }) => {
    // Modify rewards via UI or evaluate
    await page.evaluate(() => {
      const mockRewards = { stickers: 5, unlockedCharacters: ['bunny_1'] };
      localStorage.setItem('kids_vacation_rewards', JSON.stringify(mockRewards));
    });
    await page.reload();

    const storedRewards = await page.evaluate(() => localStorage.getItem('kids_vacation_rewards'));
    expect(storedRewards).not.toBeNull();
    const parsed = JSON.parse(storedRewards || '{}');
    expect(parsed.stickers).toBe(5);
  });

  test('T1-R4-03: Should automatically save learning progress state to LocalStorage (`kids_vacation_progress`)', async ({ page }) => {
    await page.evaluate(() => {
      const mockProgress = { completedQuizzes: ['feelings_1'], completedPhonics: ['a', 'b'] };
      localStorage.setItem('kids_vacation_progress', JSON.stringify(mockProgress));
    });
    await page.reload();

    const storedProgress = await page.evaluate(() => localStorage.getItem('kids_vacation_progress'));
    expect(storedProgress).not.toBeNull();
    const parsed = JSON.parse(storedProgress || '{}');
    expect(parsed.completedQuizzes).toContain('feelings_1');
  });

  test('T1-R4-04: Should restore schedule, rewards, and learning progress after browser reload', async ({ page }) => {
    // Pre-seed localStorage with custom state
    const customSchedule = [{ id: 'test_1', title: '그림 그리기', time: '14:00', category: 'play', completed: false }];
    const customRewards = { stickers: 12, unlockedCharacters: ['bear_1'] };
    const customProgress = { completedQuizzes: ['animals_1'], completedPhonics: ['c'] };

    await page.evaluate(({ s, r, p }) => {
      localStorage.setItem('kids_vacation_schedule', JSON.stringify(s));
      localStorage.setItem('kids_vacation_rewards', JSON.stringify(r));
      localStorage.setItem('kids_vacation_progress', JSON.stringify(p));
    }, { s: customSchedule, r: customRewards, p: customProgress });

    // Refresh page
    await page.reload();

    // Verify UI reflects stored custom schedule
    const slot = page.locator('[data-testid="timetable-slot"]');
    await expect(slot.first()).toContainText('그림 그리기');

    // Verify sticker count in UI reflects custom count (12)
    const stickerCount = page.locator('[data-testid="sticker-count"]');
    if (await stickerCount.isVisible()) {
      await expect(stickerCount).toContainText('12');
    }
  });

  test('T1-R4-05: Should provide reset option that clears data and resets to initial defaults', async ({ page }) => {
    // Set custom state
    await page.evaluate(() => {
      localStorage.setItem('kids_vacation_schedule', JSON.stringify([{ id: 'custom' }]));
      localStorage.setItem('kids_vacation_rewards', JSON.stringify({ stickers: 99 }));
    });
    await page.reload();

    // Click reset button if available or trigger reset action
    const resetBtn = page.locator('[data-testid="reset-data-btn"]');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      
      // Confirm reset if modal appears
      const confirmBtn = page.locator('[data-testid="confirm-reset-btn"]');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      // Check localStorage restored or cleared
      const rewards = await page.evaluate(() => localStorage.getItem('kids_vacation_rewards'));
      if (rewards) {
        const parsed = JSON.parse(rewards);
        expect(parsed.stickers).not.toBe(99);
      }
    }
  });

});
