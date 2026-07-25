import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Play, Award, Clock, Smile, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../../services/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'timetable' | 'timer' | 'phonics' | 'quiz' | 'math' | 'rewards') => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: '1. 나만의 방학 시간표 세우기 ⏰',
    subtitle: '공부, 놀이, 휴식, 식사 시간표 채우기',
    description: '원형 시간표에서 시간을 선택하고 아이콘을 눌러 나만의 여름방학 하루 일과를 완성해보세요! 24시간 원형 시계가 멋지게 그려집니다.',
    icon: '⏰',
    color: 'from-amber-400 to-orange-400',
    tabTarget: 'timetable' as const,
    badgeText: '시간표 탭 바로가기',
  },
  {
    step: 2,
    title: '2. 학년별 재미있는 공부 & 퀴즈 📚',
    subtitle: '영어 파닉스 & 어린이 수학 퀴즈',
    description: '1~3학년 중 내 학년을 선택하세요! 파닉스 알파벳 카드, 음성 말하기 챌린지, 신나는 어린이 수학 퀴즈를 풀면서 똑똑해져요!',
    icon: '🎤',
    color: 'from-emerald-400 to-teal-400',
    tabTarget: 'math' as const,
    badgeText: '수학 놀이 바로가기',
  },
  {
    step: 3,
    title: '3. 칭찬 스티커 & 3D 캐릭터 컬렉션 🧸',
    subtitle: '스티커 모아서 방학 친구 해금하기',
    description: '공부와 퀴즈를 성공하면 별가루 파티클과 함께 칭찬 스티커가 팡팡! 스티커를 모아 귀여운 3D 마법 토끼 캐릭터를 해금해보세요!',
    icon: '⭐',
    color: 'from-purple-400 to-pink-400',
    tabTarget: 'rewards' as const,
    badgeText: '보관함 바로가기',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const stepData = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    playSound('click');
    if (currentStep + 1 < TUTORIAL_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    playSound('click');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDirectGo = () => {
    playSound('reward');
    onClose();
    if (onNavigateTab) onNavigateTab(stepData.tabTarget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl border-3 border-purple-300 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-purple-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border-2 border-purple-200 flex items-center justify-center text-2xl shadow-sm">
            📖
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              초보자를 위한 사용법 가이드
              <Sparkles className="w-4 h-4 text-purple-500 fill-purple-300 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              3단계로 쉽게 배우는 여름방학 앱 사용 설명서
            </p>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentStep === idx ? 'w-8 bg-purple-600' : 'w-2.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step Card Content */}
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl bg-gradient-to-br ${stepData.color} text-white shadow-lg space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-4xl">{stepData.icon}</span>
              <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Step {stepData.step} / 3
              </span>
            </div>
            <h4 className="text-xl font-black">{stepData.title}</h4>
            <p className="text-xs font-extrabold text-white/90">{stepData.subtitle}</p>
            <p className="text-sm font-semibold leading-relaxed text-white/95 bg-black/10 p-3 rounded-2xl">
              {stepData.description}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            disabled={currentStep === 0}
            onClick={handlePrev}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1 transition-all ${
              currentStep === 0 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전</span>
          </button>

          <button
            onClick={handleDirectGo}
            className="px-4 py-2.5 rounded-2xl font-black text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1 border border-purple-300"
          >
            <span>{stepData.badgeText} 🚀</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-1"
          >
            <span>{currentStep + 1 === TUTORIAL_STEPS.length ? '시작하기' : '다음'}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
