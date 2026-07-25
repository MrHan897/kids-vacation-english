# E2E Test Infrastructure Specification — 초등 1학년 맞춤 방학 시간표 & 기초 영어 놀이 학습 웹 앱

## 1. Overview & Architecture
This document details the Playwright End-to-End (E2E) testing framework established for the **Kids Vacation Timetable & English Learning Web App**. The test suite verifies functionality across 4 tiers of test depth using standard contract-based `data-testid` selectors.

- **Framework**: Playwright (`@playwright/test`)
- **Configuration**: `playwright.config.ts`
- **Base URL**: `http://localhost:5173`
- **Dev Server Auto-Start**: Configured via `webServer` option (`npm run dev`)

---

## 2. Test Suite Directory Layout

```
f:/summer vacation/
├── playwright.config.ts
├── package.json
├── TEST_INFRA.md
├── TEST_READY.md
└── tests/
    ├── tier1-feature-coverage/
    │   ├── r1-timetable-timer.spec.ts
    │   ├── r2-phonics-english.spec.ts
    │   ├── r3-reward-system.spec.ts
    │   └── r4-data-persistence.spec.ts
    ├── tier2-boundary-corner/
    │   └── boundary-corner.spec.ts
    ├── tier3-cross-feature/
    │   └── cross-feature.spec.ts
    └── tier4-real-world/
        └── daily-workflow.spec.ts
```

---

## 3. Test Tier Breakdown

| Tier | Focus | Test Files | Target Coverage |
|------|-------|------------|-----------------|
| **Tier 1** | Feature Coverage | `r1-timetable-timer.spec.ts`, `r2-phonics-english.spec.ts`, `r3-reward-system.spec.ts`, `r4-data-persistence.spec.ts` | ≥5 test cases per feature (R1, R2, R3, R4) |
| **Tier 2** | Boundary & Corner Cases | `boundary-corner.spec.ts` | Empty timetable, corrupted JSON in LocalStorage, pomodoro timer limits, quiz max score limits |
| **Tier 3** | Cross-Feature Combinations | `cross-feature.spec.ts` | Timetable completion -> Sticker reward -> Character unlock -> LocalStorage verification |
| **Tier 4** | Real-World Application Scenario | `daily-workflow.spec.ts` | Full child daily journey: schedule creation -> timer execution -> phonics quiz -> sticker reward -> browser reload persistence |

---

## 4. Interface & Data Selector Contracts (`data-testid`)

All components implemented in subsequent milestones (M1, M2, M3, M4) MUST include the following `data-testid` attributes:

### R1: Timetable & Pomodoro Timer
- `data-testid="timetable-container"`: Timetable main container
- `data-testid="timetable-slot"`: Individual activity item/slot
- `data-testid="add-activity-btn"`: Button to open activity builder/picker
- `data-testid="activity-title-input"`: Activity title input field
- `data-testid="activity-category-select"`: Activity category dropdown/select
- `data-testid="save-activity-btn"`: Save activity button
- `data-testid="complete-activity-btn"`: Complete activity checkbox/button
- `data-testid="delete-slot-btn"` / `data-testid="edit-slot-btn"`: Delete / edit slot actions
- `data-testid="pomodoro-timer"`: Pomodoro timer section
- `data-testid="timer-character"`: Character animation container
- `data-testid="timer-display"`: Digital clock display (`mm:ss`)
- `data-testid="timer-start-btn"` / `data-testid="timer-pause-btn"` / `data-testid="timer-reset-btn"`: Timer control buttons
- `data-testid="timer-mode-break"` / `data-testid="timer-mode-label"`: Mode toggling

### R2: Phonics & English Module
- `data-testid="phonics-module"`: Phonics card game section
- `data-testid="phonics-card"`: Individual interactive alphabet/word card
- `data-testid="tts-speak-btn"`: SpeechSynthesis pronunciation trigger button
- `data-testid="quiz-module"`: Interactive quiz container
- `data-testid="quiz-topic-selector"`: Topic selector (Feelings, Greetings, Animals, Colors)
- `data-testid="quiz-option"`: Quiz multiple-choice answer option
- `data-testid="quiz-next-btn"` / `data-testid="complete-quiz-btn"`: Navigation / submission buttons
- `data-testid="quiz-score"`: Quiz score & feedback display

### R3: Reward System
- `data-testid="sticker-board"`: Praise sticker board
- `data-testid="sticker-count"`: Total praise sticker count element
- `data-testid="character-vault"`: Collectible character vault container
- `data-testid="character-vault-item"`: Character card in vault (locked/unlocked)
- `data-testid="reward-modal"` / `data-testid="close-reward-modal"`: Badge popup modal

### R4: Navigation & Data Persistence
- `data-testid="nav-english"` / `data-testid="nav-quiz"` / `data-testid="nav-rewards"`: Navigation tabs
- `data-testid="reset-data-btn"` / `data-testid="confirm-reset-btn"`: Data reset trigger and confirmation
- **LocalStorage Keys**:
  - `kids_vacation_schedule`
  - `kids_vacation_rewards`
  - `kids_vacation_progress`

---

## 5. Execution Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run Playwright UI mode
npm run test:e2e:ui

# View HTML Test Report
npm run test:e2e:report
```
