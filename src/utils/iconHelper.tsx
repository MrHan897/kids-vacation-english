import React from 'react';
import { Pencil, Book, Gamepad2, Apple, Bed, Sparkles, Music, Bike, Dumbbell, Palette } from 'lucide-react';
import { ScheduleItem } from '../types';

export const ICON_MAP: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}> = {
  pencil: { icon: Pencil, emoji: '✏️', colorClass: 'text-sky-600', bgClass: 'bg-sky-50', borderClass: 'border-sky-300', badgeClass: 'bg-sky-100 text-sky-700' },
  book: { icon: Book, emoji: '📖', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-300', badgeClass: 'bg-indigo-100 text-indigo-700' },
  game: { icon: Gamepad2, emoji: '🎮', colorClass: 'text-purple-600', bgClass: 'bg-purple-50', borderClass: 'border-purple-300', badgeClass: 'bg-purple-100 text-purple-700' },
  apple: { icon: Apple, emoji: '🍎', colorClass: 'text-rose-600', bgClass: 'bg-rose-50', borderClass: 'border-rose-300', badgeClass: 'bg-rose-100 text-rose-700' },
  bed: { icon: Bed, emoji: '🛌', colorClass: 'text-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-amber-300', badgeClass: 'bg-amber-100 text-amber-700' },
  sparkles: { icon: Sparkles, emoji: '✨', colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-300', badgeClass: 'bg-yellow-100 text-yellow-700' },
  music: { icon: Music, emoji: '🎵', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-300', badgeClass: 'bg-emerald-100 text-emerald-700' },
  bike: { icon: Bike, emoji: '🚲', colorClass: 'text-cyan-600', bgClass: 'bg-cyan-50', borderClass: 'border-cyan-300', badgeClass: 'bg-cyan-100 text-cyan-700' },
  dumbbell: { icon: Dumbbell, emoji: '⚽', colorClass: 'text-teal-600', bgClass: 'bg-teal-50', borderClass: 'border-teal-300', badgeClass: 'bg-teal-100 text-teal-700' },
  palette: { icon: Palette, emoji: '🎨', colorClass: 'text-pink-600', bgClass: 'bg-pink-50', borderClass: 'border-pink-300', badgeClass: 'bg-pink-100 text-pink-700' },
};

// Returns exact Lucide icon component or fallback
export function renderScheduleIcon(iconId?: string, category?: string, className = 'w-5 h-5'): React.ReactNode {
  const targetId = iconId || (category === 'study' ? 'book' : category === 'play' ? 'game' : category === 'meal' ? 'apple' : category === 'music' ? 'music' : category === 'exercise' ? 'dumbbell' : 'bed');
  const matched = ICON_MAP[targetId];

  if (matched) {
    const IconComponent = matched.icon;
    return <IconComponent className={className} />;
  }

  return <Book className={className} />;
}

// Returns color scheme matching selected icon (or category fallback)
export function getScheduleIconStyle(iconId?: string, category?: string) {
  const targetId = iconId || (category === 'study' ? 'book' : category === 'play' ? 'game' : category === 'meal' ? 'apple' : category === 'music' ? 'music' : category === 'exercise' ? 'dumbbell' : 'bed');
  const matched = ICON_MAP[targetId];

  if (matched) {
    return {
      bg: matched.bgClass,
      border: matched.borderClass,
      color: matched.colorClass,
      badge: matched.badgeClass,
    };
  }

  return {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    color: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700',
  };
}

// Returns exact Emoji string for Circular Clock slices
export function getScheduleEmoji(item: ScheduleItem): string {
  if (item.icon && ICON_MAP[item.icon]) {
    return ICON_MAP[item.icon].emoji;
  }

  // Fallback map by category
  switch (item.category) {
    case 'study':
      return '📖';
    case 'play':
      return '🎮';
    case 'meal':
      return '🍎';
    case 'rest':
      return '🛌';
    case 'music':
      return '🎵';
    case 'academy':
      return '🏫';
    case 'neulbom':
      return '🌱';
    case 'exercise':
      return '⚽';
    default:
      return '✨';
  }
}
