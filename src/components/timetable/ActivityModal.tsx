import React, { useState, useEffect } from 'react';
import { ScheduleItem, ActivityCategory } from '../../types';
import { playSound } from '../../services/audio';
import { X, Check, Pencil, Book, Gamepad2, Apple, Bed } from 'lucide-react';
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
};

const ICON_OPTIONS = [
  { id: 'pencil', label: '연필', icon: Pencil, emoji: '✏️' },
  { id: 'book', label: '책', icon: Book, emoji: '📖' },
  { id: 'game', label: '게임', icon: Gamepad2, emoji: '🎮' },
  { id: 'apple', label: '사과', icon: Apple, emoji: '🍎' },
  { id: 'bed', label: '침대', icon: Bed, emoji: '🛌' },
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
            {/* Title Input */}
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
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-pastel-pink focus:outline-none font-bold text-slate-800 text-sm transition-all"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                카테고리 선택
              </label>
              <select
                data-testid="activity-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-pastel-pink focus:outline-none font-bold text-slate-800 text-sm transition-all bg-white"
              >
                <option value="study">📖 공부 (학습 & 방학 숙제)</option>
                <option value="play">🎮 놀이 (자유 시간 & 바깥 활동)</option>
                <option value="meal">🍎 식사 (아침/점심/저녁 밥먹기)</option>
                <option value="rest">🛌 휴식 (간식 타임 & 취침)</option>
              </select>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                아이콘 선택
              </label>
              <div className="flex items-center justify-between gap-2 pt-1">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`activity-icon-${item.id}`}
                      onClick={() => {
                        playSound('click');
                        setIcon(item.id);
                      }}
                      className={`flex-1 py-2 px-1 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'border-pink-400 bg-pink-50 shadow-sm scale-105'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100 opacity-70'
                      }`}
                    >
                      <IconComp className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                    </button>
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
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-pastel-pink focus:outline-none font-bold text-slate-800 text-xs text-center"
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
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-pastel-pink focus:outline-none font-bold text-slate-800 text-xs text-center"
                />
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                메모 (선택사항)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 30분 집중해서 포모도로 타이머 켜기"
                className="w-full px-4 py-2 rounded-2xl border-2 border-slate-200 focus:border-pastel-pink focus:outline-none font-medium text-slate-700 text-xs"
              />
            </div>

            {/* Submit Action */}
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
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>저장하기</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
