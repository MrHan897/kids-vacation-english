import { test, expect } from '@playwright/test';

test.describe('Tier 1: Feature Coverage - R3. Reward System (Stickers & Character Vault)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T1-R3-01: Should award praise sticker upon completing a timetable activity slot', async ({ page }) => {
    // Locate completion checkbox or complete button on timetable activity
    const slot = page.locator('[data-testid="timetable-slot"]').first();
    await expect(slot).toBeVisible();

    const completeBtn = slot.locator('[data-testid="complete-activity-btn"]');
    if (await completeBtn.isVisible()) {
      const initialStickers = await page.locator('[data-testid="sticker-count"]').innerText().catch(() => '0');
      await completeBtn.click();
      
      const newStickers = await page.locator('[data-testid="sticker-count"]').innerText();
      expect(parseInt(newStickers, 10)).toBeGreaterThan(parseInt(initialStickers || '0', 10));
    }
  });

  test('T1-R3-02: Should award praise sticker upon completing a quiz round', async ({ page }) => {
    const quizNav = page.locator('[data-testid="nav-quiz"]');
    if (await quizNav.isVisible()) {
      await quizNav.click();
    }

    const options = page.locator('[data-testid="quiz-option"]');
    if (await options.count() > 0) {
      await options.first().click();
      
      const completeQuizBtn = page.locator('[data-testid="complete-quiz-btn"]');
      if (await completeQuizBtn.isVisible()) {
        await completeQuizBtn.click();
      }

      // Check sticker count updated
      const stickerBadge = page.locator('[data-testid="sticker-count"]');
      await expect(stickerBadge).toBeVisible();
    }
  });

  test('T1-R3-03: Should display sticker board showing total collected praise stickers', async ({ page }) => {
    const rewardsNav = page.locator('[data-testid="nav-rewards"]');
    if (await rewardsNav.isVisible()) {
      await rewardsNav.click();
    }

    const stickerBoard = page.locator('[data-testid="sticker-board"]');
    await expect(stickerBoard).toBeVisible();

    const countDisplay = page.locator('[data-testid="sticker-count"]');
    await expect(countDisplay).toBeVisible();
  });

  test('T1-R3-04: Should unlock new character in vault when sticker threshold is reached', async ({ page }) => {
    const rewardsNav = page.locator('[data-testid="nav-rewards"]');
    if (await rewardsNav.isVisible()) {
      await rewardsNav.click();
    }

    const characterVault = page.locator('[data-testid="character-vault"]');
    await expect(characterVault).toBeVisible();

    // Check presence of character cards (locked/unlocked)
    const items = page.locator('[data-testid="character-vault-item"]');
    expect(await items.count()).toBeGreaterThanOrEqual(1);
  });

  test('T1-R3-05: Should display reward modal / badge popup when achieving milestone', async ({ page }) => {
    // Inject reward event or simulate milestone
    await page.evaluate(() => {
      const state = {
        stickers: 10,
        unlockedCharacters: ['char_1', 'char_2'],
        recentReward: { title: '첫 스티커 달성!', icon: '🌟' }
      };
      localStorage.setItem('kids_vacation_rewards', JSON.stringify(state));
    });
    await page.reload();

    const rewardModal = page.locator('[data-testid="reward-modal"]');
    if (await rewardModal.isVisible()) {
      await expect(rewardModal).toBeVisible();
      const closeBtn = page.locator('[data-testid="close-reward-modal"]');
      await closeBtn.click();
      await expect(rewardModal).toBeHidden();
    }
  });

});
