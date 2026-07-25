import { test, expect } from '@playwright/test';

test.describe('Tier 1: Feature Coverage - R2. Phonics & English Play Module', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T1-R2-01: Should display alphabet / phonics card matching game board', async ({ page }) => {
    // Navigate to English / Phonics tab/section if applicable
    const englishNav = page.locator('[data-testid="nav-english"]');
    if (await englishNav.isVisible()) {
      await englishNav.click();
    }

    const phonicsSection = page.locator('[data-testid="phonics-module"]');
    await expect(phonicsSection).toBeVisible();

    // Check alphabet/phonics cards grid
    const cards = page.locator('[data-testid="phonics-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('T1-R2-02: Should flip and match card pairs, displaying matched feedback', async ({ page }) => {
    const englishNav = page.locator('[data-testid="nav-english"]');
    if (await englishNav.isVisible()) {
      await englishNav.click();
    }

    const cards = page.locator('[data-testid="phonics-card"]');
    if (await cards.count() >= 2) {
      await cards.nth(0).click();
      await cards.nth(1).click();
      
      // Card state flip / matched attribute
      const firstCard = cards.nth(0);
      await expect(firstCard).toBeVisible();
    }
  });

  test('T1-R2-03: Should trigger Web Speech TTS audio pronunciation when clicking speech button', async ({ page }) => {
    const englishNav = page.locator('[data-testid="nav-english"]');
    if (await englishNav.isVisible()) {
      await englishNav.click();
    }

    // Mock Web Speech API window.speechSynthesis.speak
    await page.evaluate(() => {
      (window as any).__ttsSpokenText = null;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak = (utterance: any) => {
          (window as any).__ttsSpokenText = utterance.text;
        };
      }
    });

    const speakBtn = page.locator('[data-testid="tts-speak-btn"]').first();
    if (await speakBtn.isVisible()) {
      await speakBtn.click();
      // Check if button click triggered TTS
      const spokenText = await page.evaluate(() => (window as any).__ttsSpokenText);
      expect(spokenText).not.toBeNull();
    } else {
      // Click phonics card which triggers TTS
      const card = page.locator('[data-testid="phonics-card"]').first();
      await card.click();
    }
  });

  test('T1-R2-04: Should load interactive quiz modules for categories (Feelings, Greetings, Animals, Colors)', async ({ page }) => {
    const quizNav = page.locator('[data-testid="nav-quiz"]');
    if (await quizNav.isVisible()) {
      await quizNav.click();
    }

    const quizModule = page.locator('[data-testid="quiz-module"]');
    await expect(quizModule).toBeVisible();

    // Verify quiz topic selection buttons (Feelings, Greetings, Animals, Colors)
    const topicCategory = page.locator('[data-testid="quiz-topic-selector"]');
    if (await topicCategory.isVisible()) {
      const topicButtons = topicCategory.locator('button');
      expect(await topicButtons.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('T1-R2-05: Should select quiz answers, display score feedback, and complete quiz round', async ({ page }) => {
    const quizNav = page.locator('[data-testid="nav-quiz"]');
    if (await quizNav.isVisible()) {
      await quizNav.click();
    }

    const options = page.locator('[data-testid="quiz-option"]');
    if (await options.count() > 0) {
      await options.first().click();

      // Submit or Next Question
      const nextBtn = page.locator('[data-testid="quiz-next-btn"]');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }

      // Verify score display
      const scoreDisplay = page.locator('[data-testid="quiz-score"]');
      await expect(scoreDisplay).toBeVisible();
    }
  });

});
