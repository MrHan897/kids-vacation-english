## 2026-07-24T14:53:23Z

You are Worker M4 for project '초등 1학년 맞춤 방학 시간표 & 기초 영어 놀이 학습 웹 앱'.
Your working directory is `f:/summer vacation/.agents/worker_m4`.
Your mission is to implement Milestone M4: Phonics & English Play Learning Module.

Step 1: Read `f:/summer vacation/PROJECT.md`, `f:/summer vacation/TEST_INFRA.md`, and `f:/summer vacation/.agents/ORIGINAL_REQUEST.md`.
Step 2: Implement Alphabet & Phonics Card Matching Module in `src/components/english/`:
  - `AlphabetBoard.tsx`: A-Z alphabet grid with cards showing upper/lower case letters, sample words, illustrations, and pronunciation buttons.
  - `PhonicsCardGame.tsx`: Interactive matching game (match alphabet card to target word/picture).
  - Audio integration: Call `speakText(word, 'en-US')` from `src/services/audio.ts` when cards or TTS buttons are clicked.
  - Add `data-testid` attributes (`data-testid="phonics-card-grid"`, `data-testid="phonics-card"`, `data-testid="tts-speak-btn"`, `data-testid="phonics-game-container"`).
Step 3: Implement Interactive English Quiz Module in `src/components/english/`:
  - `CategorySelector.tsx`: Category selector for Feelings (기분), Greetings (인사), Animals (동물), Colors (색상).
  - `QuizModule.tsx` & `QuizCard.tsx`: Multiple choice & audio-driven quizzes tailored for 1st grade level.
  - Interactive quiz controls (`data-testid="quiz-category-*"` or category cards, `data-testid="tts-speak-btn"`, `data-testid="quiz-score"`, `data-testid="quiz-option-*"`).
  - Award praise stickers upon quiz completion (`addSticker`), play success sound/confetti (`playSound('success')`), update learning progress in storage (`saveLearningProgress`).
Step 4: Connect components into `src/components/english/PhonicsModule.tsx` and `src/components/english/QuizModule.tsx`.
Step 5: Run `npm run build` and `tsc --noEmit` to verify clean build with 0 errors.
Step 6: Write handoff report in `f:/summer vacation/.agents/worker_m4/handoff.md` and update `progress.md`.
