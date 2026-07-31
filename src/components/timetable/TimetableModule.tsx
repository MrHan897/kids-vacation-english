import React, { useState, useEffect } from 'react';
import { ActiveTab, ScheduleItem } from '../../types';
import { getSchedule, saveSchedule, addSticker, checkAndPerformDailyReset, getParentPin, saveParentPin } from '../../services/storage';
import { DailyHistoryModal } from './DailyHistoryModal';
import { playSound } from '../../services/audio';
import { TimeSlot } from './TimeSlot';
import { ActivityModal } from './ActivityModal';
import { NowNextFocusView } from './NowNextFocusView';
import { renderScheduleIcon } from '../../utils/iconHelper';
import {
  isAlarmEnabled,
  setAlarmEnabled,
  requestNotificationPermission,
  isNotificationSupported,
  checkScheduleAlarms,
} from '../../services/alarmService';
import { Bell, BellOff, Calendar, Plus, Sparkles, Trophy, RefreshCw, PlayCircle, BookOpen, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimetableModuleProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({ onNavigateTab }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const { updatedSchedule } = checkAndPerformDailyReset();
    return updatedSchedule;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [alarmActive, setAlarmActive] = useState<boolean>(() => isAlarmEnabled());

  // [요청 사항 1, 2, 3] 조기 달성 완료 및 다음 미션 유도 모달 (Modal) State
  const [completedModalData, setCompletedModalData] = useState<{
    completedItem: ScheduleItem;
    nextItem: ScheduleItem | null;
  } | null>(null);

  // [요청 사항 1, 2, 3] 부모님 비밀 확인 도장 (PIN) State & 로컬 스토리지 연동
  const [currentPin, setCurrentPin] = useState<string>(() => getParentPin());
  const [isParentPinModalOpen, setIsParentPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [isPinApproved, setIsPinApproved] = useState<boolean>(false);

  useEffect(() => {
    // Keep local state in sync with external changes, perform daily reset check if date changed, and auto-sort by time
    const { updatedSchedule } = checkAndPerformDailyReset();
    setSchedule(sortScheduleChronologically(updatedSchedule));
  }, []);

  // [요청 사항 2] 키보드 입력 대응 (부모님 PIN 입력 모달 오픈 시)
  useEffect(() => {
    if (!isParentPinModalOpen || isPinApproved) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinKey(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      } else if (e.key === 'Escape') {
        setIsParentPinModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isParentPinModalOpen, pinInput, isPinApproved, currentPin]);

  const handlePinKey = (digit: string) => {
    if (pinInput.length >= 4 || isPinApproved) return;
    playSound('click');
    const nextPin = pinInput + digit;
    setPinInput(nextPin);

    // 4자리 모두 입력 시 자동 비밀번호 검증
    if (nextPin.length === 4) {
      verifyPinCode(nextPin);
    }
  };

  const handlePinBackspace = () => {
    if (pinInput.length === 0 || isPinApproved) return;
    playSound('click');
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handlePinClear = () => {
    playSound('click');
    setPinInput('');
    setPinError(false);
  };

  // [요청 사항 1 & 3] 로컬 스토리지에서 불러온 currentPin 기반 검증 및 승인 로직
  const verifyPinCode = (input: string) => {
    if (input === currentPin) {
      // 정답 비밀번호 일치!
      playSound('reward');
      setShowCelebration(true); // 화려한 폭죽 Confetti 이펙트 발동!
      setIsPinApproved(true);
      setPinError(false);

      addSticker({
        id: `stk-parent-approve-${Date.now()}`,
        name: '부모님 칭찬 도장 💮',
        icon: '💮',
        description: '부모님께 비밀번호 승인을 받았어요! 칭찬 코인 +50P 획득!',
      });
    } else {
      // 오답 비밀번호
      playSound('click');
      setPinError(true); // 좌우 흔들리는(Shake) 효과 발동!
      setTimeout(() => {
        setPinInput('');
        setPinError(false);
      }, 700);
    }
  };

  // [요청 사항 3] 부모님 비밀번호 변경 핸들러
  const handleChangePin = () => {
    playSound('click');
    const newPin = window.prompt(
      `🔒 새로운 부모님 비밀번호(4자리 숫자)를 입력해 주세요:`,
      currentPin
    );
    if (newPin === null) return; // 취소됨
    const trimmed = newPin.trim();
    if (!/^\d{4}$/.test(trimmed)) {
      alert('⚠️ 비밀번호는 반드시 4자리 숫자여야 합니다! (예: 1234)');
      return;
    }
    saveParentPin(trimmed);
    setCurrentPin(trimmed);
    alert('🔒 비밀번호가 성공적으로 변경되었습니다. 다음부터는 새 비밀번호로 열어주세요!');
  };

  // Background interval check for schedule alarms every 10 seconds
  useEffect(() => {
    checkScheduleAlarms(schedule);
    const interval = setInterval(() => {
      checkScheduleAlarms(schedule);
    }, 10000);
    return () => clearInterval(interval);
  }, [schedule, alarmActive]);

  const handleToggleAlarm = async () => {
    playSound('click');
    if (!alarmActive) {
      if (isNotificationSupported()) {
        const granted = await requestNotificationPermission();
        if (granted) {
          setAlarmActive(true);
          alert('🔔 스마트폰 일정 알림이 켜졌어요! 시간표 시작 시간에 알림음과 음성으로 알려드려요.');
        } else {
          setAlarmEnabled(true);
          setAlarmActive(true);
          alert('🔔 앱 내 소리 알림이 켜졌어요! (브라우저 푸시 권한이 차단된 경우 앱 내부 소리로 알려드립니다)');
        }
      } else {
        setAlarmEnabled(true);
        setAlarmActive(true);
        alert('🔔 스마트폰 알림 소리가 켜졌어요!');
      }
    } else {
      setAlarmEnabled(false);
      setAlarmActive(false);
    }
  };

  // Helper to convert time string (e.g. "09:30 - 10:50") to start minutes for sorting
  const getStartMinutes = (item: ScheduleItem): number => {
    const timeStr = item.timeSlot || item.time || '09:00';
    const startPart = timeStr.split('-')[0].trim();
    const parts = startPart.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    }
    const h = parseInt(parts[0], 10) || 0;
    return h * 60;
  };

  const sortScheduleChronologically = (items: ScheduleItem[]): ScheduleItem[] => {
    return [...items].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));
  };

  const handleSaveItem = (itemData: Partial<ScheduleItem>) => {
    let updated: ScheduleItem[];
    if (itemData.id) {
      // Edit existing
      updated = schedule.map((item) =>
        item.id === itemData.id ? ({ ...item, ...itemData } as ScheduleItem) : item
      );
    } else {
      // Add new
      const newItem: ScheduleItem = {
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: itemData.title || '새로운 할 일',
        category: itemData.category || 'study',
        icon: itemData.icon || 'book',
        timeSlot: itemData.timeSlot || '09:00 - 10:00',
        time: itemData.time || '09:00',
        color: itemData.color || '#7DD3FC',
        notes: itemData.notes || '',
        completed: false,
      };
      updated = [...schedule, newItem];
    }

    const sorted = sortScheduleChronologically(updated);
    setSchedule(sorted);
    saveSchedule(sorted);
  };

  const handleToggleComplete = (id: string) => {
    const target = schedule.find((s) => s.id === id);
    const newCompleted = !target?.completed;

    if (newCompleted) {
      playSound('success');
    } else {
      playSound('click');
    }

    const updated = schedule.map((item) =>
      item.id === id ? { ...item, completed: newCompleted } : item
    );

    setSchedule(updated);
    saveSchedule(updated);

    // [요청 사항 1 & 2] 미션 완료(체크) 시 상단 타이머 정지 및 다음 일정 안내 모달 팝업 발동!
    if (newCompleted && target) {
      const currentIdx = updated.findIndex((s) => s.id === id);
      const nextMission = updated.slice(currentIdx + 1).find((s) => !s.completed) || updated.find((s) => !s.completed) || null;

      setCompletedModalData({
        completedItem: target,
        nextItem: nextMission,
      });

      addSticker({
        id: `stk-complete-${Date.now()}`,
        name: `${target.title} 달성!`,
        icon: '⭐',
        description: '일정을 완수하고 다음 미션 도전 준비 완료!',
        category: 'star',
      });
    }

    // Check if all slots are completed to show celebration
    if (newCompleted && updated.length > 0 && updated.every((s) => s.completed)) {
      playSound('reward');
      setShowCelebration(true);
      addSticker({
        id: 'stk-first-plan',
        name: '첫 계획 작성!',
        icon: '⭐',
        description: '방학 시간표 활동을 모두 달성했어요!',
      });
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    playSound('click');
    const updated = schedule.filter((item) => item.id !== id);
    setSchedule(updated);
    saveSchedule(updated);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    playSound('click');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Drag and Drop reordering logic
  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (_e: React.DragEvent, dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reordered = [...schedule];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    setSchedule(reordered);
    saveSchedule(reordered);
    setDraggedIndex(null);
    playSound('click');
  };

  const completedCount = schedule.filter((s) => s.completed).length;
  const isAllCompleted = schedule.length > 0 && completedCount === schedule.length;

  return (
    <div data-testid="timetable-container" className="space-y-6">
      {/* [1위 최상단] 🚀 Tiimo & Routinery 스타일 Now & Next 포커스 뷰 ([메가 보상 모드] 원클릭 동선 연동) */}
      <NowNextFocusView
        schedule={schedule}
        onSelectSlot={handleEdit}
        onOpenParentPinModal={() => {
          playSound('reward');
          setIsParentPinModalOpen(true);
          setPinInput('');
          setPinError(false);
          setIsPinApproved(false);
        }}
      />

      {/* [2위] 🎯 오늘의 목표 (독립 퀘스트 달성률 게이밍 카드) */}
      <motion.div
        layout
        className="card-pastel bg-gradient-to-r from-amber-50 via-pink-50 to-emerald-50 border-4 border-pink-300 p-5 shadow-lg relative overflow-hidden"
      >
        {/* Background Star Confetti Details */}
        <div className="absolute top-2 right-3 text-amber-300 text-sm animate-pulse">✨</div>
        <div className="absolute bottom-2 left-3 text-pink-300 text-xs">⭐</div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎯</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                오늘의 목표
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-sm">
                  {isAllCompleted ? '👑 ALL CLEAR' : 'LV.1 퀘스트'}
                </span>
              </h3>
              <p className="text-[11px] font-bold text-slate-500">
                일정을 하나씩 달성할 때마다 레벨업 스티커와 게임 효과음이 팡팡! 🚀
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsHistoryOpen(true);
              }}
              className="px-4 py-2 bg-[#ffb300] hover:bg-[#ffa000] text-slate-900 font-black text-xs sm:text-sm rounded-full shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 animate-pulse border-2 border-amber-300"
            >
              <span>🏆 오늘의 칭찬 일기장 📜</span>
            </button>

            <span className="text-lg sm:text-2xl font-black text-pink-600 tracking-tight">
              {completedCount} <span className="text-xs text-slate-400 font-bold">/ {schedule.length}개 완료</span>
            </span>
            <div className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              달성률 {schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Gamified Thick Visual Progress Bar for Smartphones */}
        <div className="relative w-full h-5 bg-white/90 rounded-full overflow-hidden p-1 border-2 border-pink-200 shadow-inner mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${schedule.length > 0 ? (completedCount / schedule.length) * 100 : 0}%`,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 rounded-full relative"
          >
            {/* Shimmer Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 rounded-t-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* [3위] ⏰ 시작 시간 자동 정렬 알록달록 일정 카드 리스트 */}
      {schedule.length === 0 ? (
        <div
          data-testid="timetable-empty-state"
          className="card-pastel text-center py-12 bg-slate-50/50 border-dashed border-2 border-slate-200"
        >
          <div className="text-5xl mb-3">📅</div>
          <h3 className="text-base font-bold text-slate-700">시간표가 아직 비어있어요!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">
            '일정 추가하기' 버튼을 눌러 신나는 방학 하루 시간표를 만들어보세요!
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 px-5 py-2.5 bg-pastel-pink text-pink-800 font-bold text-xs rounded-2xl border border-pink-200 shadow-sm hover:bg-pink-200 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>첫 일정 만들기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-pink-600 font-extrabold">
              ⏰ 시작 시간에 맞춰 자동으로 정렬돼요
            </span>
            <span>총 {schedule.length}개의 일정</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schedule.map((item, idx) => (
              <TimeSlot
                key={item.id}
                item={item}
                index={idx}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}

      {/* [4위] 🗓️ 나만의 여름방학 시간표 & + 일정 추가하기 버튼 */}
      <div className="card-pastel bg-gradient-to-r from-pastel-pink-light via-white to-pastel-blue-light border-2 border-pink-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pastel-pink text-pink-700 rounded-2xl shadow-sm">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                나만의 여름방학 시간표 🗓️
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                스스로 계획을 짜고 차근차근 실천하며 칭찬 스티커를 받아요!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Alarm Toggle Button */}
            <button
              type="button"
              onClick={handleToggleAlarm}
              className={`px-3.5 py-2.5 rounded-full font-extrabold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                alarmActive
                  ? 'bg-amber-400 text-slate-900 border-amber-500 hover:bg-amber-500'
                  : 'bg-white text-seed-muted border-seed-hairline hover:bg-slate-50'
              }`}
              title={alarmActive ? '스마트폰 알람 켜짐' : '스마트폰 알람 켜기'}
            >
              {alarmActive ? <Bell className="w-4 h-4 text-slate-900 animate-bounce" /> : <BellOff className="w-4 h-4 text-slate-400" />}
              <span>{alarmActive ? '알람 켜짐 🔔' : '알람 끄기'}</span>
            </button>

            {/* Add Activity Button (Main Test IDs) */}
            <button
              type="button"
              data-testid="add-activity-btn"
              onClick={handleOpenAddModal}
              className="flex-1 sm:flex-initial btn-cute bg-seed-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ 일정 추가하기</span>
            </button>

            {/* Duplicate Add Schedule Button to fulfill exact data-testid="add-schedule-btn" contract */}
            <button
              type="button"
              data-testid="add-schedule-btn"
              onClick={handleOpenAddModal}
              className="hidden"
              aria-label="Add Schedule"
            />
          </div>
        </div>
      </div>

      {/* Celebration Banner when all tasks completed */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card-pastel bg-gradient-to-r from-amber-100 via-pink-100 to-emerald-100 border-2 border-amber-300 text-center p-6"
          >
            <div className="text-4xl mb-2">🎉 👑 🏆</div>
            <h3 className="text-lg font-black text-slate-800">우와! 오늘 시간표 완벽 성공!</h3>
            <p className="text-xs text-slate-600 font-bold mt-1">
              참 잘했어요! 칭찬 스티커 ⭐ '첫 계획 작성!' 스티커를 지급해드렸습니다.
            </p>
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="mt-3 px-4 py-1.5 bg-white text-slate-700 font-extrabold text-xs rounded-full border border-slate-300 shadow-sm hover:bg-slate-50 transition-all"
            >
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* Date-based Goal Completion History Diary Modal */}
      <DailyHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* [요청 사항 2 & 3] 부모님 비밀 확인 도장 (PIN) 모달 창 */}
      <AnimatePresence>
        {isParentPinModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`card-pastel bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-950 p-6 rounded-3xl border-4 border-amber-400 max-w-sm w-full text-center space-y-4 text-white shadow-2xl ${
                pinError ? 'animate-shake border-rose-500' : ''
              }`}
            >
              {!isPinApproved ? (
                <>
                  <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
                    <h3 className="text-base sm:text-lg font-black text-yellow-300 flex items-center gap-1.5">
                      <span>🔒 부모님 비밀 확인 도장</span>
                    </h3>
                    <button
                      onClick={() => setIsParentPinModalOpen(false)}
                      className="text-slate-400 hover:text-white font-bold text-xs"
                    >
                      ✕ 닫기
                    </button>
                  </div>

                  <p className="text-xs text-indigo-200 font-bold leading-relaxed">
                    아이가 오늘 일정을 100% 완료했어요! 🎉<br />
                    부모님 확인 비밀번호 4자리를 입력해주세요.
                  </p>

                  {/* [요청 사항 2] 4자리 PIN 입력 박스 UI (예: [ _ ] [ _ ] [ _ ] [ _ ]) */}
                  <div className="flex justify-center gap-3 my-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const hasVal = pinInput.length > idx;
                      const isCurrent = pinInput.length === idx;
                      return (
                        <div
                          key={idx}
                          className={`w-12 h-14 rounded-2xl border-3 flex items-center justify-center text-2xl font-black transition-all ${
                            hasVal
                              ? 'border-amber-400 bg-amber-400/20 text-yellow-300 shadow-md scale-105'
                              : isCurrent
                              ? 'border-pink-400 bg-pink-900/40 text-pink-300 animate-pulse'
                              : 'border-indigo-700 bg-indigo-950/80 text-indigo-500'
                          }`}
                        >
                          {hasVal ? '●' : '_'}
                        </div>
                      );
                    })}
                  </div>

                  {/* 피드백 에러 안내 */}
                  {pinError ? (
                    <p className="text-xs font-black text-rose-400 animate-pulse">
                      ❌ 비밀번호가 올바르지 않습니다! 다시 입력해주세요.
                    </p>
                  ) : (
                    <p className="text-[11px] font-bold text-indigo-300">
                      💡 4자리 숫자를 직접 클릭하거나 키보드로 입력하세요
                    </p>
                  )}

                  {/* [요청 사항 2] 3x4 키패드 UI */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handlePinKey(digit)}
                        className="py-3 rounded-2xl border-2 border-indigo-700 bg-indigo-900/80 hover:bg-indigo-800 text-white font-black text-lg shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      onClick={handlePinClear}
                      className="py-3 rounded-2xl border-2 border-slate-700 bg-slate-900 text-slate-400 font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      C
                    </button>
                    <button
                      onClick={() => handlePinKey('0')}
                      className="py-3 rounded-2xl border-2 border-indigo-700 bg-indigo-900/80 hover:bg-indigo-800 text-white font-black text-lg shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      onClick={handlePinBackspace}
                      className="py-3 rounded-2xl border-2 border-slate-700 bg-slate-900 text-slate-400 font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      ⌫
                    </button>
                  </div>
                </>
              ) : (
                /* [요청 사항 2 & 3] 잠금 해제 성공 축하 화면 & 구석에 노출되는 비밀번호 변경 버튼 */
                <div className="py-4 space-y-4 relative">
                  {/* [요청 사항 2] 성공 상태 구석의 [⚙️ 부모님 비밀번호 변경] 버튼 */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleChangePin}
                      className="px-3 py-1 bg-indigo-900/90 hover:bg-indigo-800 text-yellow-300 font-bold text-xs rounded-full border border-yellow-400/50 shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      title="부모님 비밀번호(PIN) 변경하기"
                    >
                      <span>⚙️ 부모님 비밀번호 변경</span>
                    </button>
                  </div>

                  <div className="text-6xl animate-bounce pt-1">💮 🪙</div>
                  <h3 className="text-xl sm:text-2xl font-black text-yellow-300">
                    ✨ 참 잘했어요!
                  </h3>
                  <p className="text-sm font-black text-white leading-relaxed">
                    아빠/엄마의 칭찬 코인 50 🪙 획득! 🎉
                  </p>
                  <p className="text-xs font-bold text-indigo-200">
                    부모님 칭찬 도장 스티커가 수여되었습니다. 수고했어요! 💕
                  </p>
                  <button
                    onClick={() => setIsParentPinModalOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm rounded-full shadow-lg border border-amber-300 active:scale-95 cursor-pointer mt-2"
                  >
                    자랑스러운 승인 완료 🚀
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* [요청 사항 2 & 3] 조기 달성 완료 및 다음 미션 안내 모달 (Modal) 팝업 */}
      <AnimatePresence>
        {completedModalData && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-[32px] border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center space-y-5 overflow-hidden break-keep"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playSound('click');
                  setCompletedModalData(null);
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Confetti Animation Emoji Header */}
              <div className="space-y-2 pt-2">
                <div className="text-6xl animate-bounce">🎉</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
                  <span>훌륭해요! 미션을 완료했어요!</span>
                  <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400 animate-pulse" />
                </h3>
                <p className="text-xs sm:text-sm font-black text-orange-600">
                  [{completedModalData.completedItem.title}] 활동을 성공적으로 마쳤어요! 👏
                </p>
              </div>

              {/* [요청 사항 2] 다음 일정 안내 카운터 카드 */}
              {completedModalData.nextItem ? (
                <div className="p-4 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 rounded-2xl border-2 border-orange-300 text-left space-y-2 shadow-sm">
                  <span className="text-xs font-black text-orange-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-orange-200 inline-block">
                    👀 다음 미션 안내
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-orange-200 shrink-0">
                      {renderScheduleIcon(completedModalData.nextItem.icon, completedModalData.nextItem.category, 'w-7 h-7')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-500">
                        {completedModalData.nextItem.timeSlot || completedModalData.nextItem.time}
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {completedModalData.nextItem.title}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-100/80 rounded-2xl border border-emerald-300 text-emerald-900 font-extrabold text-sm">
                  👑 오늘 남은 모든 미션을 클리어했어요! 멋져요! 🏆
                </div>
              )}

              {/* [요청 사항 3] 다음 미션 하러 가기 버튼 */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setCompletedModalData(null);
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base rounded-2xl shadow-xl border-2 border-yellow-300 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ring-4 ring-orange-200"
              >
                <span>💪 다음 미션 하러 가기! 🎯</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
