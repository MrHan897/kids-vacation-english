import React, { useState, useEffect } from 'react';
import { ScheduleItem, ActivityCategory } from '../../types';
import { playSound } from '../../services/audio';
import { X, Check, Pencil, Book, Gamepad2, Apple, Bed, Sparkles, Music, Bike, Dumbbell, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ScheduleItem>) => void;
  initialData?: ScheduleItem | null;
}

const CATEGORY_COLORS: Record<ActivityCategory, { bg: string; border: string; text: string; hex: string }> = {
  study: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-800', hex: '#7DD3FC' },
  play: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', hex: '#FFB6C1' },
  meal: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', hex: '#FDE047' },
  rest: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', hex: '#D8B4F8' },
  music: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', hex: '#6EE7B7' },
  academy: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', hex: '#A5B4FC' },
  neulbom: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', hex: '#FDBA74' },
  exercise: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', hex: '#FDA4AF' },
};

const ICON_OPTIONS = [
  { id: 'pencil', icon: Pencil, emoji: '✏️', color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-300' },
  { id: 'book', icon: Book, emoji: '📖', color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-300' },
  { id: 'game', icon: Gamepad2, emoji: '🎮', color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-300' },
  { id: 'apple', icon: Apple, emoji: '🍎', color: 'text-rose-500', bg: 'bg-rose-100', border: 'border-rose-300' },
  { id: 'bed', icon: Bed, emoji: '🛌', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-300' },
  { id: 'sparkles', icon: Sparkles, emoji: '✨', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { id: 'music', icon: Music, emoji: '🎵', color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  { id: 'bike', icon: Bike, emoji: '🚲', color: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-300' },
  { id: 'dumbbell', icon: Dumbbell, emoji: '⚽', color: 'text-teal-500', bg: 'bg-teal-100', border: 'border-teal-300' },
  { id: 'palette', icon: Palette, emoji: '🎨', color: 'text-pink-500', bg: 'bg-pink-100', border: 'border-pink-300' },
];

// Helper function to safely format and sanitize time string from native pickers or direct keyboard input
function normalizeTimeString(rawTime: string, fallback: string): string {
  if (!rawTime) return fallback;
  const trimmed = rawTime.trim();

  // Pattern 1: HH:MM or H:MM (e.g., "09:00", "9:30")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
  }

  // Pattern 2: 4-digit numeric string entered via keyboard without colon (e.g., "0900", "1430")
  const match4Digit = trimmed.match(/^(\d{2})(\d{2})$/);
  if (match4Digit) {
    const hours = parseInt(match4Digit[1], 10);
    const minutes = parseInt(match4Digit[2], 10);
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
  }

  return fallback;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('study');
  const [icon, setIcon] = useState('book');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'study');
      setIcon(initialData.icon || 'book');
      setNotes(initialData.notes || '');

      const times = (initialData.timeSlot || initialData.time || '09:00 - 10:00').split(' - ');
      setStartTime(normalizeTimeString(times[0], '09:00'));
      setEndTime(normalizeTimeString(times[1], '10:00'));
    } else {
      setTitle('');
      setCategory('study');
      setIcon('book');
      setStartTime('09:00');
      setEndTime('10:00');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playSound('click');
    const validStart = normalizeTimeString(startTime, '09:00');
    const validEnd = normalizeTimeString(endTime, '10:00');
    const timeSlot = `${validStart} - ${validEnd}`;
    const color = CATEGORY_COLORS[category]?.hex || '#7DD3FC';

    onSave({
      id: initialData?.id,
      title: title.trim(),
      category,
      icon,
      timeSlot,
      time: validStart,
      color,
      notes: notes.trim(),
      completed: initialData?.completed || false,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-pink-100"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-pastel-pink-light to-pastel-blue-light border-b border-pink-100 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span>{initialData ? '✏️ 일정 수정하기' : '🌟 새로운 일정 만들기'}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/60 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title Input & Recommendation Chips */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                일정 이름
              </label>
              <input
                type="text"
                data-testid="activity-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 영어 책 읽기, 신나는 자전거 타기"
                required
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-pink-400 focus:outline-none font-bold text-slate-800 text-sm transition-all"
              />

              {/* [요청 사항 1] 추천 검색어 칩 (Chips) 가로 스크롤 UI */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-black text-slate-400 shrink-0">💡 추천:</span>
                {[
                  { text: '📖 영어책 읽기', cat: 'study', icon: 'book' },
                  { text: '✏️ 수학 숙제', cat: 'study', icon: 'pencil' },
                  { text: '🧹 내 방 청소', cat: 'rest', icon: 'sparkles' },
                  { text: '🎮 게임하기', cat: 'play', icon: 'game' },
                ].map((chip) => (
                  <button
                    key={chip.text}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setTitle(chip.text);
                      setCategory(chip.cat as ActivityCategory);
                      setIcon(chip.icon);
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-full font-bold text-xs shrink-0 transition-all active:scale-95 shadow-2xs"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* [요청 사항 1 & 2 & 3] 카테고리 선택 - 텍스트 삭제 & 64x64px 정사각형 이모지 격자 버튼 (data-category 속성 포함) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>카테고리 선택</span>
                <span className="text-[10px] text-orange-500 font-bold">✨ 이모지를 터치하여 간편하게 선택해요!</span>
              </label>
              <div data-testid="activity-category-select" className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[
                  { id: 'study', label: '공부', emoji: '📖', bg: 'bg-sky-100 border-sky-400 text-sky-700' },
                  { id: 'play', label: '놀이', emoji: '🎮', bg: 'bg-pink-100 border-pink-400 text-pink-700' },
                  { id: 'meal', label: '식사', emoji: '🍎', bg: 'bg-amber-100 border-amber-400 text-amber-700' },
                  { id: 'rest', label: '휴식', emoji: '🛌', bg: 'bg-purple-100 border-purple-400 text-purple-700' },
                  { id: 'neulbom', label: '집안일', emoji: '🧹', bg: 'bg-teal-100 border-teal-400 text-teal-700' },
                  { id: 'music', label: '음악', emoji: '🎵', bg: 'bg-emerald-100 border-emerald-400 text-emerald-700' },
                  { id: 'academy', label: '학원', emoji: '🏫', bg: 'bg-indigo-100 border-indigo-400 text-indigo-700' },
                  { id: 'exercise', label: '운동', emoji: '⚽', bg: 'bg-rose-100 border-rose-400 text-rose-700' },
                ].map((catItem) => {
                  const isSelected = category === catItem.id;
                  return (
                    <motion.button
                      key={catItem.id}
                      type="button"
                      data-category={catItem.label}
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      whileTap={{ scale: 0.9, rotate: -4 }}
                      onClick={() => {
                        playSound('click');
                        setCategory(catItem.id as ActivityCategory);
                      }}
                      title={catItem.label}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] border-2 flex items-center justify-center text-2xl sm:text-3xl transition-all active:scale-95 shadow-2xs ${
                        isSelected
                          ? `${catItem.bg} shadow-md scale-110 ring-4 ring-orange-200 font-black`
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:shadow-xs opacity-75'
                      }`}
                    >
                      <span>{catItem.emoji}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* [요청 사항 3] 아이콘 선택 시인성 강화 (전체 파스텔톤 배경 채움 및 Scale 확대) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1 flex items-center justify-between">
                <span>아이콘 선택</span>
                <span className="text-[10px] text-pink-500 font-bold">✨ 터치하여 톡톡 재미있게 선택해요!</span>
              </label>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ scale: 1.15, rotate: 3 }}
                      whileTap={{ scale: 0.85, rotate: -6 }}
                      data-testid={`activity-icon-${item.id}`}
                      onClick={() => {
                        playSound('click');
                        setIcon(item.id);
                      }}
                      className={`w-full aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? `${item.bg} ${item.border} ${item.color} shadow-md scale-110 ring-4 ring-orange-200 border-orange-400 font-black`
                          : `bg-slate-50 border-slate-200 ${item.color} hover:bg-white hover:shadow-sm opacity-70`
                      }`}
                    >
                      <IconComp className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Customization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-600 mb-1">
                  시작 시간
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-pink-400 focus:outline-none font-bold text-slate-800 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-600 mb-1">
                  종료 시간
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-pink-400 focus:outline-none font-bold text-slate-800 text-xs text-center"
                />
              </div>
            </div>

            {/* [요청 사항 1] 불필요한 메모(선택사항) 입력칸 영역 완전히 삭제 */}

            {/* [요청 사항 3] 제출 버튼 문구 '✨ 새 일정 만들기' 로 변경 */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                data-testid="save-activity-btn"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>✨ 새 일정 만들기</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
