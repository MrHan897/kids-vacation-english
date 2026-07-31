import { ScheduleItem, RewardState, ProgressState, CharacterItem, StickerItem, UserProfile, DailyCompletionRecord } from '../types';
import { DEFAULT_CHARACTERS } from '../data/characterData';

const STORAGE_KEYS = {
  SCHEDULE: 'kids_vacation_schedule',
  REWARDS: 'kids_vacation_rewards',
  PROGRESS: 'kids_vacation_progress',
  CHARACTERS: 'kids_vacation_characters',
  PROFILE: 'kids_vacation_user_profile',
  MYROOM: 'kids_vacation_myroom',
  QUESTS: 'kids_vacation_daily_quests',
  DAILY_HISTORY: 'kids_vacation_daily_history',
  PARENT_PIN: 'kids_vacation_parent_pin',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '지우',
  grade: '초등 1학년',
  avatar: '🐰',
  createdAt: new Date().toISOString(),
};

/**
 * [요청 사항 2] 사용자 데이터 격리 (Data Isolation Namespace) 헬퍼
 * 현재 활성화된 프로필 이름(또는 고유 유저 아이디)을 가져와 `${userName}_${baseKey}` 형태로 키를 생성하여 믹싱 방지!
 */
export function getUserPrefix(profileName?: string): string {
  try {
    let name = profileName;
    if (!name) {
      const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        name = parsed?.name;
      }
    }
    const cleanName = (name || 'jiwoo').trim().toLowerCase().replace(/[^a-z0-9_가-힣]/g, '_');
    return cleanName || 'jiwoo';
  } catch {
    return 'jiwoo';
  }
}

export function getUserKey(baseKey: string, userName?: string): string {
  const prefix = getUserPrefix(userName);
  return `${prefix}_${baseKey}`;
}

/**
 * [요청 사항 1] 유저 격리 샌드박스에서 부모님 PIN 비밀번호 로드 & 저장
 */
export function getParentPin(userName?: string): string {
  const userKey = getUserKey(STORAGE_KEYS.PARENT_PIN, userName);
  return safeParse<string>(userKey, '0000');
}

export function saveParentPin(pin: string, userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.PARENT_PIN, userName);
  safeSet(userKey, pin);
}

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

// Safe JSON parse wrapper with fallback and legacy non-prefixed key fallback migration
function safeParse<T>(key: string, fallback: T): T {
  try {
    let raw = localStorage.getItem(key);
    // Legacy migration: if user-prefixed key not found, attempt reading global un-prefixed key
    if (!raw && key.includes('_kids_vacation_')) {
      const baseKey = key.substring(key.indexOf('_kids_vacation_') + 1);
      raw = localStorage.getItem(baseKey);
      if (raw) {
        // Automatically migrate un-prefixed data to user-isolated namespace
        localStorage.setItem(key, raw);
      }
    }
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
export function resetScheduleByGrade(grade: string, userName?: string): ScheduleItem[] {
  let selectedSchedule: ScheduleItem[] = GRADE1_SCHEDULE;
  if (grade === '초등 2학년' || grade === 'grade2') {
    selectedSchedule = GRADE2_SCHEDULE;
  } else if (grade === '초등 3학년' || grade === '초등 4학년 이상' || grade === 'grade3') {
    selectedSchedule = GRADE3_SCHEDULE;
  }
  saveSchedule(selectedSchedule, userName);
  return selectedSchedule;
}

/**
 * [요청 사항 2] 유저 격리 샌드박스에서 일일 시간표 로드 & 저장
 */
export function getSchedule(userName?: string): ScheduleItem[] {
  const userKey = getUserKey(STORAGE_KEYS.SCHEDULE, userName);
  return safeParse<ScheduleItem[]>(userKey, DEFAULT_SCHEDULE);
}

export function saveSchedule(items: ScheduleItem[], userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.SCHEDULE, userName);
  safeSet(userKey, items);
}

/**
 * Get all daily completion history records (Isolated per user)
 */
export function getDailyHistory(userName?: string): DailyCompletionRecord[] {
  const userKey = getUserKey(STORAGE_KEYS.DAILY_HISTORY, userName);
  return safeParse<DailyCompletionRecord[]>(userKey, []);
}

export function saveDailyHistory(records: DailyCompletionRecord[], userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.DAILY_HISTORY, userName);
  safeSet(userKey, records);
}

/**
 * Automatically check if date changed, save yesterday's goal history, and reset checkbox completion status for the new day!
 */
export function checkAndPerformDailyReset(): { resetPerformed: boolean; updatedSchedule: ScheduleItem[] } {
  const progress = getLearningProgress();
  const todayDate = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const lastDate = progress.lastActiveDate || todayDate;
  const currentSchedule = getSchedule();

  if (lastDate !== todayDate) {
    // 1. Record yesterday's goal completion history before reset
    const daysKR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const prevDateObj = new Date(lastDate);
    const dayOfWeek = isNaN(prevDateObj.getTime()) ? '방학날' : daysKR[prevDateObj.getDay()];

    const completedItems = currentSchedule
      .filter((s) => s.completed)
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        icon: s.icon,
        timeSlot: s.timeSlot || s.time || '09:00 - 10:00',
      }));

    const totalCount = currentSchedule.length;
    const completedCount = completedItems.length;
    const achievementRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const historyRecord: DailyCompletionRecord = {
      date: lastDate,
      dayOfWeek,
      totalCount,
      completedCount,
      achievementRate,
      completedItems,
    };

    const existingHistory = getDailyHistory();
    // Prepend new history record, avoiding duplicates for the same date
    const filteredHistory = existingHistory.filter((h) => h.date !== lastDate);
    saveDailyHistory([historyRecord, ...filteredHistory]);

    // 2. Automatically uncheck all schedule items for the new day
    const resetSchedule = currentSchedule.map((item) => ({
      ...item,
      completed: false,
    }));

    saveSchedule(resetSchedule);

    // 3. Update lastActiveDate in progress state
    saveLearningProgress({
      ...progress,
      lastActiveDate: todayDate,
    });

    return { resetPerformed: true, updatedSchedule: resetSchedule };
  }

  return { resetPerformed: false, updatedSchedule: currentSchedule };
}

/**
 * Get reward state (stickers, praise, character unlock status) - User Isolated
 */
export function getRewards(userName?: string): RewardState {
  const userKey = getUserKey(STORAGE_KEYS.REWARDS, userName);
  const parsed = safeParse<any>(userKey, INITIAL_REWARD_STATE);
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
 * Save reward state - User Isolated
 */
export function saveRewards(rewards: RewardState, userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.REWARDS, userName);
  const unlocked = rewards.unlockedCharacterIds || rewards.unlockedCharacters || ['char-bunny'];
  const payload = {
    ...rewards,
    stickers: rewards.stickersCount,
    stickersCount: rewards.stickersCount,
    unlockedCharacterIds: unlocked,
    unlockedCharacters: unlocked,
  };
  safeSet(userKey, payload);
}

/**
 * Clear recent reward trigger
 */
export function clearRecentReward(userName?: string): RewardState {
  const rewards = getRewards(userName);
  const updated: RewardState = {
    ...rewards,
    recentReward: null,
  };
  saveRewards(updated, userName);
  return updated;
}

/**
 * Get learning progress state - User Isolated
 */
export function getLearningProgress(userName?: string): ProgressState {
  const userKey = getUserKey(STORAGE_KEYS.PROGRESS, userName);
  return safeParse<ProgressState>(userKey, INITIAL_PROGRESS_STATE);
}

/**
 * Save learning progress state - User Isolated
 */
export function saveLearningProgress(progress: ProgressState, userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.PROGRESS, userName);
  safeSet(userKey, progress);
}

/**
 * Get all character items with updated unlocked state from rewards - User Isolated
 */
export function getCharacters(userName?: string): CharacterItem[] {
  const userKey = getUserKey(STORAGE_KEYS.CHARACTERS, userName);
  const savedCharacters = safeParse<CharacterItem[]>(userKey, DEFAULT_CHARACTERS);
  const rewards = getRewards(userName);
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
 * Save custom character list - User Isolated
 */
export function saveCharacters(characters: CharacterItem[], userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.CHARACTERS, userName);
  safeSet(userKey, characters);
}

/**
 * Award a new praise sticker to the user - User Isolated
 */
export function addSticker(sticker: StickerItem, userName?: string): RewardState {
  const rewards = getRewards(userName);

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

  const characters = DEFAULT_CHARACTERS;
  const newlyUnlocked = characters
    .filter((c) => c.requiredStickers <= updatedRewards.stickersCount)
    .map((c) => c.id);

  const combinedUnlocked = Array.from(new Set([...updatedRewards.unlockedCharacterIds, ...newlyUnlocked]));
  updatedRewards.unlockedCharacterIds = combinedUnlocked;
  updatedRewards.unlockedCharacters = combinedUnlocked;

  saveRewards(updatedRewards, userName);
  return updatedRewards;
}

/**
 * Unlock a specific character by ID - User Isolated
 */
export function unlockCharacter(characterId: string, userName?: string): RewardState {
  const rewards = getRewards(userName);
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
    saveRewards(updated, userName);
    return updated;
  }
  return rewards;
}

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

import { DEFAULT_MYROOM_ITEMS, DEFAULT_DAILY_QUESTS } from '../data/myRoomData';
import { MyRoomItem, DailyQuest } from '../types';

export function getMyRoomItems(userName?: string): MyRoomItem[] {
  const userKey = getUserKey(STORAGE_KEYS.MYROOM, userName);
  return safeParse<MyRoomItem[]>(userKey, DEFAULT_MYROOM_ITEMS);
}

export function saveMyRoomItems(items: MyRoomItem[], userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.MYROOM, userName);
  safeSet(userKey, items);
}

export function getDailyQuests(userName?: string): DailyQuest[] {
  const userKey = getUserKey(STORAGE_KEYS.QUESTS, userName);
  return safeParse<DailyQuest[]>(userKey, DEFAULT_DAILY_QUESTS);
}

export function saveDailyQuests(quests: DailyQuest[], userName?: string): void {
  const userKey = getUserKey(STORAGE_KEYS.QUESTS, userName);
  safeSet(userKey, quests);
}

import { AnalyticsLog, AnalyticsSummary } from '../types';

const ANALYTICS_KEY = 'kids_vacation_developer_analytics';

export function getAnalyticsData(): AnalyticsSummary {
  const defaultSummary: AnalyticsSummary = {
    totalVisits: 1,
    totalStudySessions: 3,
    totalQuizzesSolved: 12,
    totalCustomFurnitureCreated: 2,
    activeGrade: '초등 1학년',
    logs: [
      {
        id: 'log-init-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        eventType: 'page_view',
        tab: 'timetable',
        details: '방학 시간표 24시간 원형 시계 확인',
        userGrade: '초등 1학년',
      },
      {
        id: 'log-init-2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        eventType: 'timer_complete',
        tab: 'timer',
        details: '뽀모도로 타이머 25분 몰입 공부 완수',
        userGrade: '초등 1학년',
      },
      {
        id: 'log-init-3',
        timestamp: new Date().toISOString(),
        eventType: 'furniture_custom',
        tab: 'myroom',
        details: '✨ 나만의 상상 3D 가구 [우주선 책상 🛸] 생성',
        userGrade: '초등 1학년',
      },
    ],
  };
  return safeParse<AnalyticsSummary>(ANALYTICS_KEY, defaultSummary);
}

export function logAnalyticsEvent(
  eventType: AnalyticsLog['eventType'],
  tab: string,
  details: string,
  userGrade: string = '초등 1학년'
): void {
  try {
    const current = getAnalyticsData();
    const newLog: AnalyticsLog = {
      id: `analytics-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType,
      tab,
      details,
      userGrade,
    };

    let totalVisits = current.totalVisits;
    let totalStudySessions = current.totalStudySessions;
    let totalQuizzesSolved = current.totalQuizzesSolved;
    let totalCustomFurnitureCreated = current.totalCustomFurnitureCreated;

    if (eventType === 'page_view') totalVisits += 1;
    if (eventType === 'timer_complete') totalStudySessions += 1;
    if (eventType === 'quiz_solve' || eventType === 'math_solve') totalQuizzesSolved += 1;
    if (eventType === 'furniture_custom') totalCustomFurnitureCreated += 1;

    const updated: AnalyticsSummary = {
      totalVisits,
      totalStudySessions,
      totalQuizzesSolved,
      totalCustomFurnitureCreated,
      activeGrade: userGrade,
      logs: [newLog, ...current.logs.slice(0, 49)], // Keep last 50 logs
    };

    safeSet(ANALYTICS_KEY, updated);
  } catch (err) {
    console.error('[storage] Failed to log analytics event:', err);
  }
}

export function resetAllData(userName?: string): void {
  try {
    const prefix = getUserPrefix(userName);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.SCHEDULE}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.REWARDS}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.PROGRESS}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.CHARACTERS}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.MYROOM}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.QUESTS}`);
    localStorage.removeItem(`${prefix}_${STORAGE_KEYS.DAILY_HISTORY}`);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.REWARDS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CHARACTERS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MYROOM);
    localStorage.removeItem(STORAGE_KEYS.QUESTS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_HISTORY);
    localStorage.removeItem(ANALYTICS_KEY);
  } catch (err) {
    console.error('[storage] Failed to reset storage data:', err);
  }
}
