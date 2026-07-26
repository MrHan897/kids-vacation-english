import React from 'react';
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

  // Manual trigger to record current day's progress for testing/demonstration
  const handleRecordTodayForDemo = () => {
    playSound('reward');
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
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[32px] border-4 border-pink-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-100 via-pink-100 to-emerald-100 p-5 border-b border-pink-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 text-white rounded-2xl shadow-md animate-bounce">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  방학 달성 기록 일기장 📜
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  매일 자정에 자동으로 기록되고 체크가 해제돼요!
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

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {/* Today manual record hint button */}
            <div className="flex items-center justify-between p-3.5 bg-pink-50/80 rounded-2xl border-2 border-pink-200">
              <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                오늘 완수한 기록을 일기장에 남기기
              </span>
              <button
                type="button"
                onClick={handleRecordTodayForDemo}
                className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                오늘 기록 저장
              </button>
            </div>

            {historyRecords.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-black text-slate-600">아직 저장된 날짜별 기록이 없어요!</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  오늘 방학 시간표 할 일을 완수하고 '오늘 기록 저장'을 누르거나 자정이 지나면 일기장에 차곡차곡 쌓여요! ⭐
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((record) => (
                  <motion.div
                    key={record.date}
                    layout
                    className="p-4 rounded-3xl border-2 border-pink-100 bg-gradient-to-r from-amber-50/50 via-white to-emerald-50/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.date} ({record.dayOfWeek})
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {record.achievementRate === 100 ? '👑 ALL CLEAR' : `${record.achievementRate}% 달성`}
                        </span>
                      </div>

                      <div className="text-xs font-extrabold text-pink-600">
                        {record.completedCount} / {record.totalCount}개 완수
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-emerald-400 rounded-full"
                        style={{ width: `${record.achievementRate}%` }}
                      />
                    </div>

                    {/* Completed Items Badges */}
                    {record.completedItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {record.completedItems.map((item) => (
                          <span
                            key={`${record.date}-${item.id}`}
                            className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="text-xs">{renderScheduleIcon(item.icon, item.category, 'w-3.5 h-3.5')}</span>
                            <span>{item.title}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
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
          </div>

          {/* Footer Close Button */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-2xl shadow-md transition-all"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
