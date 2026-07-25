# Project: 초등 1학년 맞춤 방학 시간표 & 기초 영어 놀이 학습 웹 앱

## Architecture
- **Tech Stack**: React + Vite + Tailwind CSS + Lucide React + Framer Motion (pastel UI theme, modern typography, child-friendly micro-animations).
- **Persistence**: LocalStorage Service (`src/services/storage.ts`) auto-saving timetable, praise stickers, character collection, and learning progress.
- **Audio & Speech**: Web Speech API (`SpeechSynthesis`) for TTS phonics/word pronunciation + Web Audio API / synth sound effects for feedback.
- **Visual Timetable & Timer**: Icon-click & drag-and-drop visual timetable builder (`src/components/timetable/`) + Pomodoro timer with character animations (`src/components/timer/`).
- **Phonics & English Play**: Alphabet/Phonics card matching, Web Speech TTS, interactive quizzes (Feelings, Greetings, Animals, Colors) (`src/components/english/`).
- **Rewards**: Praise stickers + collectible character vault unlocked by timetable completion and quiz scores (`src/components/rewards/`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M_TEST | E2E Testing Suite | Playwright E2E tests for Tiers 1-4 | none | DONE |
| M1 | Foundation & Core Services | Vite/React/Tailwind setup, storage, audio/speech services, state hooks | none | DONE |
| M2 | Timetable & Pomodoro Timer | Timetable builder with drag&drop, Pomodoro timer with character animations | M1 | DONE |
| M3 | Reward & Collection System | Sticker rewards system, character collection vault, badge popups | M1 | DONE |
| M4 | Phonics & English Learning Module | Alphabet cards matching, Web Speech TTS, interactive quizzes | M1, M3 | DONE |
| M5 | E2E Verification & Hardening | E2E test execution, Tier 5 white-box hardening, Forensic audit | M_TEST, M2, M3, M4 | IN_PROGRESS |

## Interface Contracts

### Storage Contract (`src/services/storage.ts`)
- `getSchedule(): ScheduleItem[]`
- `saveSchedule(items: ScheduleItem[]): void`
- `getRewards(): RewardState`
- `saveRewards(rewards: RewardState): void`
- `getLearningProgress(): ProgressState`
- `saveLearningProgress(progress: ProgressState): void`

### Audio / Speech Contract (`src/services/audio.ts`)
- `speakText(text: string, lang?: string): void`
- `playSound(type: 'success' | 'click' | 'reward' | 'timer_alarm'): void`

## Code Layout
- `src/`
  - `components/`
    - `common/` (Header, Nav, Modal, Card, Button)
    - `timetable/` (TimetableBuilder, TimeSlot, ActivityIconPicker, CharacterGuide)
    - `timer/` (PomodoroTimer, CharacterAnimation, TimerControls)
    - `english/` (PhonicsCardGame, AlphabetBoard, QuizModule, PronunciationButton)
    - `rewards/` (StickerBoard, CharacterVault, RewardModal, PraiseAnimation)
  - `services/` (storage.ts, audio.ts, speech.ts)
  - `types/` (index.ts)
  - `data/` (phonicsData.ts, quizData.ts, characterData.ts, defaultSchedule.ts)
  - `App.tsx`
  - `index.css`
  - `main.tsx`
