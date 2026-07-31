import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Trophy, CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import { getDailyHistory, saveDailyHistory, getSchedule } from '../../services/storage';
import { DailyCompletionRecord } from '../../types';
import { renderScheduleIcon } from '../../utils/iconHelper';
import { playSound } from '../../services/audio';

interface DailyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyHistoryModal: React.FC<DailyHistoryModalProps> = ({ isOpen, onClose }) => {
  const historyRecords = getDailyHistory();
  const currentSchedule = getSchedule();

  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('happy');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manual trigger to record current day's progress for testing/demonstration
  const handleRecordTodayForDemo = () => {
    playSound('reward');
    setShowConfetti(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const daysKR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = daysKR[new Date().getDay()];

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

    const demoRecord: DailyCompletionRecord = {
      date: todayStr,
      dayOfWeek,
      totalCount,
      completedCount,
      achievementRate,
      completedItems,
    };

    const filtered = historyRecords.filter((h) => h.date !== todayStr);
    saveDailyHistory([demoRecord, ...filtered]);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay Backdrop Layer (Flexbox Center Alignment & high z-index) */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            playSound('click');
            onClose();
          }
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn"
      >
        {/* Confetti Animation Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 flex justify-around">
            {['🎉', '⭐', '✨', '🎈', '🎊', '💮', '🥳'].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ y: -50, opacity: 1, rotate: 0 }}
                animate={{ y: 600, opacity: 0, rotate: 360 }}
                transition={{ duration: 2.5, delay: i * 0.2, ease: 'easeOut' }}
                className="text-3xl"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Dialog Card (Centered, Max-width 90% / 440px) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#fffdfa] rounded-[28px] border-4 border-amber-300 shadow-2xl max-w-[440px] w-[90%] overflow-hidden flex flex-col max-h-[85vh] relative my-auto z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-200 via-amber-100 to-orange-100 p-5 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 text-white rounded-2xl shadow-md animate-bounce">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  🏆 오늘의 칭찬 일기장 📜
                </h3>
                <p className="text-xs text-amber-800/80 font-bold">
                  매일 완수한 일정이 달성 기록 일기장에 차곡차곡 보관돼요!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body (Diary Paper Texture) */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* 오늘의 기분 선택 기능 */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-xs font-black text-amber-900 block mb-2">
                오늘 나의 기분은 어땠나요? 💭
              </span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMood('happy');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                    mood === 'happy'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105 shadow-xs'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  😍 최고야
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMood('neutral');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                    mood === 'neutral'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105 shadow-xs'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  😐 보통
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMood('sad');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                    mood === 'sad'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105 shadow-xs'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  😢 힘들었어
                </button>
              </div>
            </div>

            {historyRecords.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-3xl border-2 border-dashed border-amber-200 p-6">
                <BookOpen className="w-12 h-12 text-amber-300 mx-auto mb-2" />
                <h4 className="text-sm font-black text-slate-600">아직 저장된 일기장 기록이 없어요!</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  오늘 할 일을 완료하고 아래 버튼을 누르면 일기장에 스티커와 함께 기록돼요! ⭐
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((record) => (
                  <motion.div
                    key={record.date}
                    layout
                    className="p-4 rounded-3xl border-2 border-amber-200 bg-white shadow-xs transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl font-bold text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.date} ({record.dayOfWeek})
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {record.achievementRate === 100 ? '👑 ALL CLEAR' : `${record.achievementRate}% 달성`}
                        </span>
                      </div>

                      <div className="text-xs font-extrabold text-amber-700">
                        {record.completedCount} / {record.totalCount}개 완수
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full"
                        style={{ width: `${record.achievementRate}%` }}
                      />
                    </div>

                    {/* Completed Items Badges with '참 잘했어요' 💮 Stamps */}
                    {record.completedItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {record.completedItems.map((item) => (
                          <span
                            key={`${record.date}-${item.id}`}
                            className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="text-xs">{renderScheduleIcon(item.icon, item.category, 'w-3.5 h-3.5')}</span>
                            <span>{item.title}</span>
                            <span className="text-xs">💮</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold text-slate-400 italic">완수한 일정이 없는 날이에요.</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* 메인 저장 버튼: ✨ 오늘 기록 저장하고 10코인 받기 */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleRecordTodayForDemo}
                className="w-full py-3.5 px-6 bg-[#ff6f0f] hover:bg-orange-600 text-white font-black text-sm rounded-full shadow-orange transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>✨ 오늘 기록 저장하고 10코인 받기 🪙</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
