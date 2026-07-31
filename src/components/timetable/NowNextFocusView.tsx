import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../../types';
import { renderScheduleIcon, getScheduleIconStyle } from '../../utils/iconHelper';
import { Clock, Play, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface NowNextFocusViewProps {
  schedule: ScheduleItem[];
  onSelectSlot?: (item: ScheduleItem) => void;
}

export const NowNextFocusView: React.FC<NowNextFocusViewProps> = ({ schedule, onSelectSlot }) => {
  const [progressPercent, setProgressPercent] = useState<number>(75);
  const [timeLeftMinutes, setTimeLeftMinutes] = useState<number>(25);

  // Find currently active item or first incomplete item
  const activeItem = schedule.find((s) => !s.completed) || schedule[0];
  const activeIndex = schedule.findIndex((s) => s.id === activeItem?.id);
  const nextItem = schedule[activeIndex + 1] || null;

  // Real-time progress ticker simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMinutes((prev) => {
        if (prev <= 1) return 45;
        return prev - 1;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setProgressPercent(Math.max(10, Math.min(100, Math.round((timeLeftMinutes / 45) * 100))));
  }, [timeLeftMinutes]);

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
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 1. [NOW] 현재 진행 중인 미션 히어로 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-pastel bg-gradient-to-br from-orange-50 via-white to-amber-50 border-4 border-orange-300 p-6 shadow-md relative overflow-hidden"
      >
        {/* NOW Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#ff6f0f] text-white font-black text-xs rounded-full shadow-2xs flex items-center gap-1 animate-pulse">
              <Play className="w-3 h-3 fill-white" /> NOW (지금 할 일)
            </span>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {activeItem.timeSlot || activeItem.time}
            </span>
          </div>
          <span className="text-xs font-extrabold text-[#ff6f0f] bg-orange-100 px-2.5 py-0.5 rounded-full">
            남은 시간 약 {timeLeftMinutes}분
          </span>
        </div>

        {/* Hero Card Center Content & Circular Progress Gauge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
          {/* Item Details */}
          <div className="flex items-center gap-4 text-center sm:text-left flex-1 min-w-0">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black shrink-0 ${iconStyle.bg} ${iconStyle.color} ${iconStyle.border} border-2 shadow-xs`}
            >
              {renderScheduleIcon(activeItem.icon, activeItem.category, 'w-8 h-8')}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-[#212124] tracking-tight leading-tight truncate">
                {activeItem.title}
              </h2>
              {activeItem.notes ? (
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 truncate">
                  {activeItem.notes}
                </p>
              ) : (
                <p className="text-xs text-[#868b94] font-semibold mt-1">집중해서 미션을 완수해보세요! 🚀</p>
              )}
            </div>
          </div>

          {/* Circular SVG Progress Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle cx="60" cy="60" r={radius} className="text-slate-100 stroke-current" strokeWidth="10" fill="none" />
              {/* Active Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="text-[#ff6f0f] stroke-current"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-[#212124]">{progressPercent}%</span>
              <span className="text-[10px] font-bold text-slate-400">남음</span>
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
    </div>
  );
};
