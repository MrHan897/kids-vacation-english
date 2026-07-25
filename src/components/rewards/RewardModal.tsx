import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, X, Star } from 'lucide-react';
import { playSound, speakText } from '../../services/audio';
import confetti from 'canvas-confetti';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  title = '참 잘했어요!',
  description = '새로운 칭찬 스티커와 보상을 획득했습니다!',
  icon = '🌟',
  badge = '축하합니다!',
}) => {
  useEffect(() => {
    if (isOpen) {
      playSound('reward');
      speakText(title, 'ko-KR');

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#FFB6C1', '#D8B4F8', '#7DD3FC', '#FDE047', '#6EE7B7'],
        });
      } catch (err) {
        // Fallback
      }
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        data-testid="reward-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center overflow-hidden"
        >
          {/* Decorative Background Circles */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-100 rounded-full blur-xl opacity-70" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pink-100 rounded-full blur-xl opacity-70" />

          {/* Close Icon Top-Right */}
          <button
            data-testid="close-reward-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebratory Icon Avatar */}
          <div className="relative mx-auto mb-4 w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-200 via-yellow-100 to-pink-200 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-cute animate-bounce-slow">
            {icon}
            <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-1.5 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
          </div>

          {/* Badge Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs mb-3 border border-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{badge}</span>
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Close Action Button */}
          <button
            data-testid="close-reward-modal-btn"
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 to-pink-400 hover:from-amber-500 hover:to-pink-500 text-amber-950 font-black text-base rounded-2xl shadow-cute-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5 fill-amber-950" />
            <span>멋져요! 확인했어요 👍</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
