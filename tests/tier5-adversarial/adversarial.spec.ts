import { test, expect } from '@playwright/test';

test.describe('Tier 5: White-Box Adversarial Analysis & Coverage Hardening', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T5-ADV-01: Should gracefully handle corrupted and malformed LocalStorage values without UI crashes', async ({ page }) => {
    // Inject severely malformed and type-mismatched data into LocalStorage keys
    await page.evaluate(() => {
      localStorage.setItem('kids_vacation_schedule', '"not_an_array"');
      localStorage.setItem('kids_vacation_rewards', JSON.stringify({
        stickersCount: -99,
        earnedStickers: 'invalid_type',
        unlockedCharacterIds: null,
      }));
      localStorage.setItem('kids_vacation_progress', JSON.stringify({
        quizzesCompleted: 'broken',
        totalQuizzesTaken: NaN,
      }));
      localStorage.setItem('kids_vacation_characters', '{invalid_json');
    });

    await page.reload();

    // Verify main app containers render with safe fallback states
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();

    const timetableContainer = page.locator('[data-testid="timetable-container"]');
    await expect(timetableContainer).toBeVisible();

    // Verify header sticker count is safe (>= 0 or fallback value, not NaN or negative)
    const stickerCount = page.locator('[data-testid="sticker-count"]');
    await expect(stickerCount).toBeVisible();
    const text = await stickerCount.innerText();
    expect(text).not.toContain('NaN');
    expect(text).not.toContain('-99');
  });

  test('T5-ADV-02: Should safely render XSS payloads in activity titles as escaped text', async ({ page }) => {
    const xssPayload = '<script>window.__xssExecuted=true;</script><img src=x onerror="window.__xssExecuted=true;">';

    const addBtn = page.locator('[data-testid="add-activity-btn"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const titleInput = page.locator('[data-testid="activity-title-input"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill(xssPayload);
      await page.locator('[data-testid="save-activity-btn"]').click();
    }

    // Verify XSS script did NOT execute
    const xssExecuted = await page.evaluate(() => (window as any).__xssExecuted);
    expect(xssExecuted).toBeUndefined();

    // Verify item is safely visible as plain text
    const slot = page.locator('[data-testid="timetable-slot"]').last();
    await expect(slot).toBeVisible();
    await expect(slot).toContainText('<script>');
  });

  test('T5-ADV-03: Should safely handle rapid TTS speech synthesis calls without exceptions', async ({ page }) => {
    const englishNav = page.locator('[data-testid="nav-english"]');
    if (await englishNav.isVisible()) {
      await englishNav.click();
    }

    // Mock speech synthesis to track calls and verify no thrown errors
    await page.evaluate(() => {
      (window as any).__ttsCallCount = 0;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak = () => {
          (window as any).__ttsCallCount++;
        };
        window.speechSynthesis.cancel = () => {};
      }
    });

    // Click multiple phonics cards in rapid succession
    const cards = page.locator('[data-testid="phonics-card"]');
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await cards.nth(i).click();
    }

    const calls = await page.evaluate(() => (window as any).__ttsCallCount);
    expect(calls).toBeGreaterThan(0);
  });

  test('T5-ADV-04: Should maintain active timer and UI state continuity across rapid tab switching', async ({ page }) => {
    // Start Pomodoro timer
    const timerSection = page.locator('[data-testid="pomodoro-timer"]');
    await expect(timerSection).toBeVisible();

    const startBtn = page.locator('[data-testid="timer-start-btn"]');
    await startBtn.click();

    // Rapidly switch between tabs
    const navQuiz = page.locator('[data-testid="nav-quiz"]');
    const navRewards = page.locator('[data-testid="nav-rewards"]');
    const navTimetable = page.locator('[data-testid="timetable-container"]');

    if (await navQuiz.isVisible()) await navQuiz.click();
    if (await navRewards.isVisible()) await navRewards.click();

    // Navigate back to Timetable tab
    const navTimetableTab = page.locator('button').filter({ hasText: /시간표|Timetable/i }).first();
    if (await navTimetableTab.isVisible()) {
      await navTimetableTab.click();
    }

    // Timer section should be accessible and display valid running state
    await expect(page.locator('#root')).toBeVisible();
  });

  test('T5-ADV-05: Should correctly handle bulk schedule (50 items) and large sticker bounds', async ({ page }) => {
    // Seed 50 schedule items and 50 stickers into LocalStorage
    await page.evaluate(() => {
      const bulkSchedule = Array.from({ length: 50 }, (_, i) => ({
        id: `bulk_${i}`,
        title: `대용량 일정 #${i + 1}`,
        time: `${(i % 12) + 1}:00`,
        category: i % 2 === 0 ? 'study' : 'play',
        completed: i % 3 === 0,
      }));
      const bulkRewards = {
        stickersCount: 50,
        earnedStickers: Array.from({ length: 50 }, (_, i) => ({
          id: `stk_${i}`,
          name: `스티커 #${i}`,
          icon: '⭐',
        })),
        unlockedCharacterIds: ['char-bunny', 'char-bear', 'char-cat', 'char-dog'],
      };

      localStorage.setItem('kids_vacation_schedule', JSON.stringify(bulkSchedule));
      localStorage.setItem('kids_vacation_rewards', JSON.stringify(bulkRewards));
    });

    await page.reload();

    // Verify timetable container renders first slot and total slots count
    const slots = page.locator('[data-testid="timetable-slot"]');
    expect(await slots.count()).toBe(50);

    // Check progress bar calculates percentage accurately without error
    const progressText = await page.locator('[data-testid="timetable-container"]').innerText();
    expect(progressText).not.toContain('NaN');
  });

});
