import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star, BookOpen, Coffee, Moon } from 'lucide-react';

export type MascotId = 'rabbit' | 'bear' | 'cat';

interface CharacterAnimationProps {
  mascot: MascotId;
  mode: 'work' | 'break';
  isRunning: boolean;
}

const MASCOT_CONFIGS: Record<
  MascotId,
  {
    name: string;
    avatar: string;
    workAction: string;
    breakAction: string;
    workQuote: string;
    breakQuote: string;
    color: string;
  }
> = {
  rabbit: {
    name: '토리 (Rabbit)',
    avatar: '🐰',
    workAction: '✏️ 연필 쓱싹 공부 중',
    breakAction: '🥕 당근 먹으며 휴식 중',
    workQuote: '토리와 함께 25분 동안 집중해서 열심히 공부해요!',
    breakQuote: '수고했어요! 당근 간식을 먹고 푹 쉬는 시간!',
    color: 'from-pink-100 to-rose-50 border-pink-200 text-pink-700',
  },
  bear: {
    name: '포코 (Bear)',
    avatar: '🐻',
    workAction: '📖 파닉스 책 읽는 중',
    breakAction: '🍯 꿀단지 먹으며 기지개',
    workQuote: '포코 곰 삼촌과 알파벳을 쏙쏙 익혀보아요!',
    breakQuote: '달콤한 꿀을 먹으며 차근차근 몸을 풀어요!',
    color: 'from-amber-100 to-yellow-50 border-amber-200 text-amber-800',
  },
  cat: {
    name: '네코 (Cat)',
    avatar: '🐱',
    workAction: '📝 퀴즈 문제 푸는 중',
    breakAction: '🐟 생선 먹고 낮잠 타임',
    workQuote: '네코 고양이와 영어 퀴즈왕에 도전해요!',
    breakQuote: '야옹~ 5분 동안 눈을 붙이고 새 에너지를 채워요!',
    color: 'from-sky-100 to-blue-50 border-sky-200 text-sky-800',
  },
};

export const CharacterAnimation: React.FC<CharacterAnimationProps> = ({
  mascot,
  mode,
  isRunning,
}) => {
  const config = MASCOT_CONFIGS[mascot] || MASCOT_CONFIGS.rabbit;

  return (
    <div
      data-testid="timer-character"
      className={`p-6 rounded-3xl bg-gradient-to-b ${config.color} border-2 shadow-inner relative overflow-hidden flex flex-col items-center justify-center my-4 transition-all`}
    >
      {/* Decorative floating particles */}
      <AnimatePresence>
        {isRunning && (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: -30, opacity: [0, 1, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              className="absolute top-4 left-6 text-amber-400"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: -35, opacity: [0, 1, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.8, ease: 'easeOut' }}
              className="absolute top-6 right-8 text-pink-400"
            >
              <Heart className="w-5 h-5" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: -30, opacity: [0, 1, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: 'easeOut' }}
              className="absolute bottom-6 left-10 text-yellow-400"
            >
              <Star className="w-4 h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mascot Animated Avatar Display */}
      <motion.div
        animate={
          isRunning
            ? {
                y: [0, -8, 0],
                rotate: mode === 'work' ? [0, -2, 2, 0] : [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }
            : { y: 0, scale: 1 }
        }
        transition={{
          repeat: isRunning ? Infinity : 0,
          duration: mode === 'work' ? 1.5 : 2,
          ease: 'easeInOut',
        }}
        className="text-7xl sm:text-8xl my-2 select-none relative"
      >
        <span>{config.avatar}</span>

        {/* Floating Mode Overlay Badge */}
        <div className="absolute -bottom-1 -right-2 text-2xl">
          {mode === 'work' ? (
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
              ✏️
            </motion.span>
          ) : (
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              💤
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Status Badge */}
      <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-xs font-black">
        {mode === 'work' ? (
          <>
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>{config.workAction}</span>
          </>
        ) : (
          <>
            <Coffee className="w-3.5 h-3.5 text-emerald-600" />
            <span>{config.breakAction}</span>
          </>
        )}
      </div>

      {/* Mascot Speech Bubble Quote */}
      <p className="mt-3 text-xs sm:text-sm font-bold text-slate-700 max-w-xs text-center leading-relaxed">
        "{mode === 'work' ? config.workQuote : config.breakQuote}"
      </p>
    </div>
  );
};
