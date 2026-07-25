import { ScheduleItem, RewardState, ProgressState, CharacterItem, StickerItem, UserProfile } from '../types';
import { DEFAULT_CHARACTERS } from '../data/characterData';

const STORAGE_KEYS = {
  SCHEDULE: 'kids_vacation_schedule',
  REWARDS: 'kids_vacation_rewards',
  PROGRESS: 'kids_vacation_progress',
  CHARACTERS: 'kids_vacation_characters',
  PROFILE: 'kids_vacation_user_profile',
};

const INITIAL_REWARD_STATE: RewardState = {
  stickersCount: 1,
  earnedStickers: [
    {
      id: 'stk-welcome',
      name: '방학 시작!',
      icon: '🎉',
      description: '여름방학 학습을 시작했어요!',
      unlockedAt: new Date().toISOString(),
    },
  ],
  unlockedCharacterIds: ['char-bunny'],
  dailyPraiseCount: 1,
  lastPraiseDate: new Date().toISOString().split('T')[0],
};

const INITIAL_PROGRESS_STATE: ProgressState = {
  phonicsMastered: [],
  quizzesCompleted: {
    feelings: 0,
    greetings: 0,
    animals: 0,
    colors: 0,
  },
  totalQuizzesTaken: 0,
  totalStudyMinutes: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

// Safe JSON parse wrapper
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[storage] Failed to parse item for key "${key}":`, err);
    return fallback;
  }
}

// Safe JSON stringify wrapper
function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storage] Failed to save item for key "${key}":`, err);
  }
}

import { GRADE1_SCHEDULE, GRADE2_SCHEDULE, GRADE3_SCHEDULE, DEFAULT_SCHEDULE } from '../data/defaultSchedule';

/**
 * Reset and load default timetable schedule according to grade selection
 */
export function resetScheduleByGrade(grade: string): ScheduleItem[] {
  let selectedSchedule: ScheduleItem[] = GRADE1_SCHEDULE;
  if (grade === '초등 2학년' || grade === 'grade2') {
    selectedSchedule = GRADE2_SCHEDULE;
  } else if (grade === '초등 3학년' || grade === '초등 4학년 이상' || grade === 'grade3') {
    selectedSchedule = GRADE3_SCHEDULE;
  }
  saveSchedule(selectedSchedule);
  return selectedSchedule;
}

/**
 * Get current timetable schedule items
 */
export function getSchedule(): ScheduleItem[] {
  return safeParse<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
}

/**
 * Save timetable schedule items
 */
export function saveSchedule(items: ScheduleItem[]): void {
  safeSet(STORAGE_KEYS.SCHEDULE, items);
}

/**
 * Get reward state (stickers, praise, character unlock status)
 */
export function getRewards(): RewardState {
  const parsed = safeParse<any>(STORAGE_KEYS.REWARDS, INITIAL_REWARD_STATE);
  if (!parsed || typeof parsed !== 'object') return INITIAL_REWARD_STATE;

  const stickersCount = typeof parsed.stickersCount === 'number'
    ? parsed.stickersCount
    : typeof parsed.stickers === 'number'
      ? parsed.stickers
      : (Array.isArray(parsed.earnedStickers) ? parsed.earnedStickers.length : INITIAL_REWARD_STATE.stickersCount);

  let unlockedCharacterIds: string[] = [];
  if (Array.isArray(parsed.unlockedCharacterIds)) {
    unlockedCharacterIds = parsed.unlockedCharacterIds;
  } else if (Array.isArray(parsed.unlockedCharacters)) {
    unlockedCharacterIds = parsed.unlockedCharacters;
  } else {
    unlockedCharacterIds = INITIAL_REWARD_STATE.unlockedCharacterIds;
  }

  let earnedStickers: StickerItem[] = Array.isArray(parsed.earnedStickers) ? parsed.earnedStickers : [];
  if (earnedStickers.length === 0 && stickersCount > 0) {
    const categories: ('star' | 'crown' | 'trophy' | 'medal' | 'heart' | 'spark')[] = ['star', 'crown', 'trophy', 'medal', 'heart', 'spark'];
    const icons = ['🌟', '👑', '🏆', '🥇', '❤️', '✨'];
    for (let i = 0; i < stickersCount; i++) {
      const idx = i % categories.length;
      earnedStickers.push({
        id: `stk-gen-${i + 1}`,
        name: `칭찬 스티커 #${i + 1}`,
        icon: icons[idx],
        description: '학습 활동 완료 보상 스티커!',
        category: categories[idx],
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return {
    ...INITIAL_REWARD_STATE,
    ...parsed,
    stickersCount,
    stickers: stickersCount,
    earnedStickers,
    unlockedCharacterIds,
    unlockedCharacters: unlockedCharacterIds,
    recentReward: parsed.recentReward || null,
  };
}

/**
 * Save reward state
 */
export function saveRewards(rewards: RewardState): void {
  const unlocked = rewards.unlockedCharacterIds || rewards.unlockedCharacters || ['char-bunny'];
  const payload = {
    ...rewards,
    stickers: rewards.stickersCount,
    stickersCount: rewards.stickersCount,
    unlockedCharacterIds: unlocked,
    unlockedCharacters: unlocked,
  };
  safeSet(STORAGE_KEYS.REWARDS, payload);
}

/**
 * Clear recent reward trigger
 */
export function clearRecentReward(): RewardState {
  const rewards = getRewards();
  const updated: RewardState = {
    ...rewards,
    recentReward: null,
  };
  saveRewards(updated);
  return updated;
}

/**
 * Get learning progress state
 */
export function getLearningProgress(): ProgressState {
  return safeParse<ProgressState>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS_STATE);
}

/**
 * Save learning progress state
 */
export function saveLearningProgress(progress: ProgressState): void {
  safeSet(STORAGE_KEYS.PROGRESS, progress);
}

/**
 * Get all character items with updated unlocked state from rewards
 */
export function getCharacters(): CharacterItem[] {
  const savedCharacters = safeParse<CharacterItem[]>(STORAGE_KEYS.CHARACTERS, DEFAULT_CHARACTERS);
  const rewards = getRewards();
  const unlocked = rewards.unlockedCharacterIds || rewards.unlockedCharacters || [];

  return savedCharacters.map((char) => {
    const isUnlockedById = unlocked.some((id) =>
      id === char.id ||
      char.id.includes(id) ||
      id.includes(char.id.replace('char-', '')) ||
      char.id.replace('char-', '') === id.replace('char_', '').replace('_1', '')
    );

    const isUnlockedByStickers = char.requiredStickers <= rewards.stickersCount;

    return {
      ...char,
      unlocked: char.unlocked || isUnlockedById || isUnlockedByStickers,
    };
  });
}

/**
 * Save custom character list
 */
export function saveCharacters(characters: CharacterItem[]): void {
  safeSet(STORAGE_KEYS.CHARACTERS, characters);
}

/**
 * Award a new praise sticker to the user
 */
export function addSticker(sticker: StickerItem): RewardState {
  const rewards = getRewards();

  // Prevent duplicate sticker IDs if already awarded
  const existingIdx = rewards.earnedStickers.findIndex((s) => s.id === sticker.id);
  const updatedStickers = [...rewards.earnedStickers];

  if (existingIdx >= 0) {
    updatedStickers[existingIdx] = {
      ...sticker,
      unlockedAt: sticker.unlockedAt || new Date().toISOString(),
    };
  } else {
    updatedStickers.push({
      ...sticker,
      unlockedAt: sticker.unlockedAt || new Date().toISOString(),
    });
  }

  const updatedRewards: RewardState = {
    ...rewards,
    stickersCount: updatedStickers.length,
    stickers: updatedStickers.length,
    earnedStickers: updatedStickers,
    recentReward: {
      title: '칭찬 스티커 획득!',
      description: sticker.name,
      icon: sticker.icon || '🌟',
      type: 'sticker',
    },
  };

  // Check if new characters can be auto-unlocked by total stickers
  const characters = DEFAULT_CHARACTERS;
  const newlyUnlocked = characters
    .filter((c) => c.requiredStickers <= updatedRewards.stickersCount)
    .map((c) => c.id);

  const combinedUnlocked = Array.from(new Set([...updatedRewards.unlockedCharacterIds, ...newlyUnlocked]));
  updatedRewards.unlockedCharacterIds = combinedUnlocked;
  updatedRewards.unlockedCharacters = combinedUnlocked;

  saveRewards(updatedRewards);
  return updatedRewards;
}

/**
 * Unlock a specific character by ID
 */
export function unlockCharacter(characterId: string): RewardState {
  const rewards = getRewards();
  const unlocked = rewards.unlockedCharacterIds || rewards.unlockedCharacters || [];
  if (!unlocked.includes(characterId)) {
    const updatedUnlocked = [...unlocked, characterId];
    const char = DEFAULT_CHARACTERS.find((c) => c.id === characterId);
    const updated: RewardState = {
      ...rewards,
      unlockedCharacterIds: updatedUnlocked,
      unlockedCharacters: updatedUnlocked,
      recentReward: {
        title: '새로운 캐릭터 해금!',
        description: char ? `${char.name} 친구를 만났어요!` : '새로운 친구가 모험에 합류했어요!',
        icon: char ? char.avatar : '🎉',
        type: 'character',
        characterId,
      },
    };
    saveRewards(updated);
    return updated;
  }
  return rewards;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '지우',
  grade: '초등 1학년',
  avatar: '🐰',
  createdAt: new Date().toISOString(),
};

/**
 * Get user profile (child's name, grade, avatar)
 */
export function getUserProfile(): UserProfile {
  return safeParse<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

/**
 * Save user profile
 */
export function saveUserProfile(profile: UserProfile): void {
  safeSet(STORAGE_KEYS.PROFILE, profile);
}

/**
 * Reset all storage data back to defaults
 */
export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.REWARDS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CHARACTERS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (err) {
    console.error('[storage] Failed to reset storage data:', err);
  }
}
