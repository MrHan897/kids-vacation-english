import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../../types';
import { renderScheduleIcon, getScheduleIconStyle } from '../../utils/iconHelper';
import { getUserProfile, addSticker } from '../../services/storage';
import { playSound } from '../../services/audio';
import { Clock, Play, ArrowRight, CheckCircle, Sparkles, Zap, Trophy, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NowNextFocusViewProps {
  schedule: ScheduleItem[];
  onSelectSlot?: (item: ScheduleItem) => void;
  onCompleteSlot?: (item: ScheduleItem) => void;
}

export const NowNextFocusView: React.FC<NowNextFocusViewProps> = ({ schedule, onSelectSlot, onCompleteSlot }) => {
  const userProfile = getUserProfile();
  const [elapsedPercent, setElapsedPercent] = useState<number>(10);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(6);
  const [totalMinutes, setTotalMinutes] = useState<number>(60);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showFlySticker, setShowFlySticker] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Find currently active item or first incomplete item
  const activeItem = schedule.find((s) => !s.completed) || schedule[0];
  const activeIndex = schedule.findIndex((s) => s.id === activeItem?.id);
  const nextItem = schedule[activeIndex + 1] || null;

  // Calculate duration in minutes from timeSlot (e.g. "09:00 - 10:00")
  useEffect(() => {
    if (!activeItem) return;
    const timeStr = activeItem.timeSlot || activeItem.time || '09:00 - 10:00';
    const parts = timeStr.split('-');
    if (parts.length >= 2) {
      const [sH, sM] = parts[0].trim().split(':').map((n) => parseInt(n, 10) || 0);
      const [eH, eM] = parts[1].trim().split(':').map((n) => parseInt(n, 10) || 0);
      const diff = (eH * 60 + eM) - (sH * 60 + sM);
      if (diff > 0) setTotalMinutes(diff);
      else setTotalMinutes(60);
    } else {
      setTotalMinutes(60);
    }
  }, [activeItem]);

  // Real-time progress ticker (increasing percentage formula)
  useEffect(() => {
    if (isDemoActive || showSuccessModal) return;

    const timer = setInterval(() => {
      setElapsedMinutes((prev) => {
        const nextVal = prev + 1;
        if (nextVal >= totalMinutes) {
          triggerCompletionSuccess();
          return totalMinutes;
        }
        return nextVal;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [totalMinutes, isDemoActive, showSuccessModal]);

  // Update percentage from elapsed minutes
  useEffect(() => {
    if (!isDemoActive) {
      const pct = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalMinutes) * 100)));
      setElapsedPercent(pct);
    }
  }, [elapsedMinutes, totalMinutes, isDemoActive]);

  // 10-Second Demo Simulation Trigger
  const handleStart10sDemo = () => {
    playSound('click');
    setIsDemoActive(true);
    setElapsedPercent(0);
    setElapsedMinutes(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 10;
      setElapsedPercent(step);
      setElapsedMinutes(Math.round((step / 100) * totalMinutes));

      if (step >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDemoActive(false);
          triggerCompletionSuccess();
        }, 400);
      }
    }, 1000);
  };

  // Trigger 100% Completion Celebration Modal & Award Sticker
  const triggerCompletionSuccess = () => {
    playSound('reward');
    setShowConfetti(true);
    setShowFlySticker(true);
    setShowSuccessModal(true);

    addSticker({
      id: `stk-mission-100-${Date.now()}`,
      name: `${activeItem?.title || '미션 완수'} 스티커 ⭐`,
      icon: '⭐',
      description: `NOW 집중 미션 100% 완성 보상!`,
      category: 'star',
    });

    if (onCompleteSlot && activeItem) {
      onCompleteSlot(activeItem);
    }

    setTimeout(() => {
      setShowFlySticker(false);
    }, 2500);

    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  if (!activeItem) {
    return (
      <div className="card-pastel text-center py-8 bg-white border-2 border-orange-200">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-lg font-black text-slate-800">오늘의 모든 미션을 달성했어요!</h3>
      </div>
    );
  }

  const iconStyle = getScheduleIconStyle(activeItem.icon, activeItem.category);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (elapsedPercent / 100) * circumference;
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);

  return (
    <div className="space-y-4 relative">
      {/* Flying Sticker Animation trajectory */}
      <AnimatePresence>
        {showFlySticker && (
          <motion.div
            initial={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, scale: 1.8, y: -220, x: 120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-base rounded-full shadow-2xl border-2 border-yellow-300 ring-4 ring-amber-200"
          >
            <Star className="w-6 h-6 fill-yellow-200 text-yellow-100 animate-spin" />
            <span>스티커 +1 ⭐ 보상 획득!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Fireworks Overlay Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden flex items-center justify-center">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: (Math.random() - 0.5) * 400,
                y: -100,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight,
                rotate: Math.random() * 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
              style={{
                backgroundColor: ['#ff6f0f', '#ffcc00', '#ff4081', '#00e676', '#2979ff'][i % 5],
              }}
              className="absolute w-3 h-4 rounded-xs shadow-xs"
            />
          ))}
        </div>
      )}

      {/* 1. [NOW] 현재 진행 중인 미션 게이미피케이션 퀘스트 카드 (28px 둥근 모서리 & 입체 펄스 효과) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-pastel bg-gradient-to-br from-amber-50 via-orange-50/50 to-pink-50 border-4 border-amber-300 rounded-[28px] p-6 sm:p-8 shadow-[0_12px_36px_rgba(255,111,15,0.18)] relative overflow-hidden space-y-6 break-keep"
      >
        {/* NOW Header Badge & 10s Demo Button (Touch Friendly 1.5x Spacing) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1.5 bg-[#ff6f0f] text-white font-black text-xs sm:text-sm rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
              <Play className="w-3.5 h-3.5 fill-white" /> NOW (지금 할 일)
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" /> {activeItem.timeSlot || activeItem.time}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleStart10sDemo}
              disabled={isDemoActive}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-full border-2 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isDemoActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse ring-2 ring-amber-200'
                  : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
              }`}
              title="10초 만에 100% 에너지 달성 팝업 체험해보기"
            >
              <Zap className="w-4 h-4 fill-current text-amber-500" />
              <span>{isDemoActive ? '⚡ 10초 체험 중...' : '⚡ 10초 체험 모드'}</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-[#ff6f0f] bg-orange-100/90 px-3 py-1 rounded-full border border-orange-200">
              남은 시간 약 {remainingMinutes}분
            </span>
          </div>
        </div>

        {/* Hero Quest Center Content & Increasing SVG Energy Gauge (1.5x Spacing & Touch Chunking) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 my-2">
          {/* Item Details with "🔥 현재 미션:" Badge Header */}
          <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left flex-1 min-w-0">
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center text-3xl font-black shrink-0 ${iconStyle.bg} ${iconStyle.color} ${iconStyle.border} border-3 shadow-md`}
            >
              {renderScheduleIcon(activeItem.icon, activeItem.category, 'w-10 h-10')}
            </div>
            <div className="min-w-0 space-y-1">
              <span className="inline-block text-xs sm:text-sm font-black text-orange-600 bg-orange-100 px-3 py-0.5 rounded-full border border-orange-200">
                🔥 현재 미션
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#212124] tracking-tight leading-tight truncate">
                {activeItem.title}
              </h2>
              {activeItem.notes ? (
                <p className="text-xs sm:text-sm text-slate-500 font-bold truncate">
                  {activeItem.notes}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-[#868b94] font-bold">집중해서 퀘스트를 완성해보세요! 🚀</p>
              )}
            </div>
          </div>

          {/* [요청 사항 1 & 2] 0% -> 100% 차오르는 퀘스트 에너지 게이지 SVG & Glow Pulse */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track Circle */}
              <circle cx="60" cy="60" r={radius} className="text-orange-100 stroke-current" strokeWidth="12" fill="none" />
              
              {/* Active Filling Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="text-[#ff6f0f] stroke-current"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#212124] tracking-tight">{elapsedPercent}%</span>
              <span className="text-xs font-black text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full mt-0.5 border border-orange-200">
                에너지 달성!
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. [NEXT] 다음 일정 예고 바 */}
      {nextItem && (
        <div className="p-3.5 bg-white rounded-2xl border border-[#eaebee] shadow-2xs flex items-center justify-between gap-3 transition-all hover:border-orange-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-extrabold text-[11px] rounded-full shrink-0 flex items-center gap-1">
              NEXT <ArrowRight className="w-3 h-3 text-slate-400" />
            </span>
            <span className="text-xs font-extrabold text-[#212124] truncate">
              {nextItem.title}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {nextItem.timeSlot || nextItem.time}
          </span>
        </div>
      )}

      {/* [요청 사항 1, 2, 3] 100% 달성 완료 팝업 모달 [우와! 미션 완벽 성공! 👑] */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center space-y-5 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Popup Header & Crown */}
              <div className="space-y-2 pt-2">
                <div className="text-6xl animate-bounce">👑</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                  <span>우와! 미션 완벽 성공!</span>
                  <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400 animate-pulse" />
                </h3>
              </div>

              {/* 100% Glowing Display Badge */}
              <div className="py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl text-white shadow-lg border-2 border-yellow-300 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-3xl" />
                <div className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                  100% Achieved! 👑
                </div>
                <p className="text-xs font-bold text-amber-100">
                  집중 에너지가 100% 가득 차올랐어요!
                </p>
              </div>

              {/* Friendly Korean Time Record Statement */}
              <div className="p-4 bg-orange-100/70 rounded-2xl border border-orange-200 text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed">
                "우와! 총 {totalMinutes}분 중 {totalMinutes}분 집중했어요!<br />
                <span className="text-orange-600">(남은 시간: 0분)</span> 참 잘했어요, {userProfile.name}야! 💕"
              </div>

              {/* Rewards Summary */}
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-md border border-yellow-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-slate-950" /> 스티커 +1 ⭐ 획득
                </span>
                <span className="px-4 py-2 bg-purple-500 text-white font-black text-xs sm:text-sm rounded-full shadow-md border border-purple-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 fill-white" /> 집중왕 달성 🏆
                </span>
              </div>

              {/* Call to Action Button */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setShowSuccessModal(false);
                  if (onSelectSlot && nextItem) onSelectSlot(nextItem);
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base rounded-2xl shadow-xl border-2 border-yellow-300 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ring-4 ring-orange-200"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>🎉 다음 미션 도전하기! 🎯</span>
                {nextItem && (
                  <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-full text-slate-900 font-extrabold ml-1">
                    NEXT ➡️ {nextItem.title}
                  </span>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

