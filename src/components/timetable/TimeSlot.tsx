import React from 'react';
import { ScheduleItem } from '../../types';
import { playSound } from '../../services/audio';
import { CheckCircle2, Circle, Clock, Trash2, Edit3, GripVertical, Pencil, Book, Gamepad2, Apple, Bed } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimeSlotProps {
  item: ScheduleItem;
  index: number;
  onToggleComplete: (id: string) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

const CATEGORY_STYLES = {
  study: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-400',
    iconBg: 'bg-sky-200 text-sky-800',
    badge: 'bg-sky-100 text-sky-700',
    label: '공부',
  },
  play: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    iconBg: 'bg-pink-200 text-pink-800',
    badge: 'bg-pink-100 text-pink-700',
    label: '놀이',
  },
  meal: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    iconBg: 'bg-amber-200 text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
    label: '식사',
  },
  rest: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    iconBg: 'bg-purple-200 text-purple-800',
    badge: 'bg-purple-100 text-purple-700',
    label: '휴식',
  },
  music: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-200 text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700',
    label: '음악',
  },
  academy: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    iconBg: 'bg-indigo-200 text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-700',
    label: '학원',
  },
  neulbom: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    iconBg: 'bg-orange-200 text-orange-800',
    badge: 'bg-orange-100 text-orange-700',
    label: '늘봄',
  },
  exercise: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    hoverBorder: 'hover:border-rose-400',
    iconBg: 'bg-rose-200 text-rose-800',
    badge: 'bg-rose-100 text-rose-700',
    label: '운동',
  },
};

export const TimeSlot: React.FC<TimeSlotProps> = ({
  item,
  index,
  onToggleComplete,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.study;

  const renderIcon = () => {
    switch (item.icon) {
      case 'pencil':
        return <Pencil className="w-5 h-5" />;
      case 'book':
        return <Book className="w-5 h-5" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5" />;
      case 'apple':
        return <Apple className="w-5 h-5" />;
      case 'bed':
        return <Bed className="w-5 h-5" />;
      default:
        return item.category === 'study' ? (
          <Book className="w-5 h-5" />
        ) : item.category === 'play' ? (
          <Gamepad2 className="w-5 h-5" />
        ) : item.category === 'meal' ? (
          <Apple className="w-5 h-5" />
        ) : (
          <Bed className="w-5 h-5" />
        );
    }
  };

  const displayTime = item.timeSlot || item.time || '09:00 - 10:00';

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, index)}
      onDragOver={(e) => onDragOver(e as unknown as React.DragEvent, index)}
      onDrop={(e) => onDrop(e as unknown as React.DragEvent, index)}
      data-testid="timetable-slot"
      className={`p-4 rounded-3xl border-2 transition-all group relative flex items-center justify-between ${
        item.completed
          ? 'bg-emerald-50/70 border-emerald-200 opacity-80 shadow-sm'
          : `${style.bg} ${style.border} ${style.hoverBorder} hover:shadow-md`
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors hidden sm:block">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Category Icon */}
        <div
          data-testid={`activity-icon-${item.icon || 'book'}`}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
            item.completed ? 'bg-emerald-200 text-emerald-800' : style.iconBg
          }`}
          style={item.color ? { backgroundColor: item.completed ? '#A7F3D0' : item.color } : undefined}
        >
          {renderIcon()}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {displayTime}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.label}
            </span>
          </div>

          <h3
            className={`font-extrabold text-sm sm:text-base leading-tight mt-0.5 truncate ${
              item.completed ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {item.title}
          </h3>

          {item.notes && (
            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{item.notes}</p>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Edit Button */}
        <button
          type="button"
          data-testid="edit-slot-btn"
          onClick={(e) => {
            e.stopPropagation();
            playSound('click');
            onEdit(item);
          }}
          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-100/60 rounded-xl transition-all"
          title="일정 수정"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          data-testid="delete-slot-btn"
          onClick={(e) => {
            e.stopPropagation();
            playSound('click');
            onDelete(item.id);
          }}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-xl transition-all"
          title="일정 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Complete Toggle Button (64px Touch Target) */}
        <button
          type="button"
          data-testid="complete-activity-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(item.id);
          }}
          className="w-12 h-12 flex items-center justify-center rounded-2xl p-2 transition-all active:scale-90 select-none hover:bg-slate-100/80"
          title={item.completed ? '미완료로 표시' : '완료로 표시'}
        >
          {item.completed ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
          ) : (
            <Circle className="w-7 h-7 text-slate-300 hover:text-slate-500" />
          )}
        </button>
      </div>
    </motion.div>
  );
};
