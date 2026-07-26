import React from 'react';
import { Pencil, Book, Gamepad2, Apple, Bed, Sparkles, Music, Bike, Dumbbell, Palette } from 'lucide-react';
import { ScheduleItem } from '../types';

export const ICON_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; emoji: string }> = {
  pencil: { icon: Pencil, emoji: '✏️' },
  book: { icon: Book, emoji: '📖' },
  game: { icon: Gamepad2, emoji: '🎮' },
  apple: { icon: Apple, emoji: '🍎' },
  bed: { icon: Bed, emoji: '🛌' },
  sparkles: { icon: Sparkles, emoji: '✨' },
  music: { icon: Music, emoji: '🎵' },
  bike: { icon: Bike, emoji: '🚲' },
  dumbbell: { icon: Dumbbell, emoji: '⚽' },
  palette: { icon: Palette, emoji: '🎨' },
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
