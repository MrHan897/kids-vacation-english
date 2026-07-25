export type ActivityCategory = 'study' | 'play' | 'meal' | 'rest';

export interface TimetableItem {
  id: string;
  timeSlot: string; // e.g. "09:00 - 10:00"
  time?: string; // optional single time string e.g. "09:00"
  title: string;
  category: ActivityCategory;
  icon: string;
  color?: string;
  completed?: boolean;
  notes?: string;
}

// Alias for contract compatibility
export type ScheduleItem = TimetableItem;

export type TimerMode = 'work' | 'break';

export interface PomodoroState {
  mode: TimerMode;
  duration: number; // in seconds
  timeLeft: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  completedSessions: number;
  activeCharacterId: string;
}

export interface PhonicsCard {
  id: string;
  letter: string; // e.g. "A"
  uppercase: string;
  lowercase: string;
  phonicsSound: string; // e.g. "/æ/ (애)"
  word: string; // e.g. "Apple"
  translation: string; // e.g. "사과"
  icon: string;
  exampleSentence: string;
  color: string;
}

export type QuizCategory = 'feelings' | 'greetings' | 'animals' | 'colors';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  englishText?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  audioPrompt?: string;
  hint?: string;
  icon?: string;
}

export interface StickerItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  category?: 'star' | 'crown' | 'trophy' | 'medal' | 'heart' | 'spark' | string;
  unlockedAt?: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  requiredStickers: number;
  unlocked: boolean;
  category: 'timetable' | 'quiz' | 'phonics' | 'special';
  badge?: string;
}

export interface RewardState {
  stickersCount: number;
  earnedStickers: StickerItem[];
  unlockedCharacterIds: string[];
  dailyPraiseCount: number;
  lastPraiseDate?: string;
  activeCharacterId?: string;
  recentReward?: {
    title: string;
    description?: string;
    icon: string;
    type?: 'sticker' | 'character' | 'milestone';
    characterId?: string;
  } | null;
  // Fallbacks for test compatibility
  stickers?: number;
  unlockedCharacters?: string[];
}

export interface ProgressState {
  phonicsMastered: string[];
  quizzesCompleted: Record<QuizCategory, number>;
  totalQuizzesTaken: number;
  totalStudyMinutes: number;
  streakDays: number;
  lastActiveDate: string;
}

export type GradeLevel = 'grade1' | 'grade2' | 'grade3';

export type MathCategory = 'addition' | 'subtraction' | 'multiplication' | 'shapes';

export interface MathQuestion {
  id: string;
  grade: GradeLevel;
  category: MathCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  icon: string;
}

export type ActiveTab = 'timetable' | 'timer' | 'phonics' | 'quiz' | 'math' | 'rewards' | 'myroom';

export interface UserProfile {
  name: string;
  grade: GradeLevel | string;
  avatar: string;
  createdAt: string;
}

export interface MyRoomItem {
  id: string;
  name: string;
  icon: string;
  category: 'furniture' | 'decor' | 'toy' | 'special';
  costStickers: number;
  unlocked: boolean;
  position?: { x: number; y: number };
}

export interface DailyQuest {
  id: string;
  title: string;
  category: 'routine' | 'study' | 'timer';
  rewardStickerId: string;
  completed: boolean;
  parentApproved: boolean;
}

export interface VoiceEvaluationResult {
  wordId: string;
  recognizedText: string;
  score: number;
  crownTier: 'gold' | 'silver' | 'bronze' | 'try_again';
  praiseAudioMessage: string;
  timestamp: string;
}


