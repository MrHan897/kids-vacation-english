import React from 'react';
import { QuizCategory } from '../../types';
import { playSound } from '../../services/audio';

interface CategorySelectorProps {
  activeCategory: QuizCategory;
  onSelectCategory: (category: QuizCategory) => void;
}

export const CATEGORIES: { id: QuizCategory; label: string; icon: string; description: string }[] = [
  { id: 'feelings', label: '기분 (Feelings)', icon: '😃', description: '기쁨, 슬픔, 화남 표현' },
  { id: 'greetings', label: '인사 (Greetings)', icon: '👋', description: '아침/저녁 인사 및 만남' },
  { id: 'animals', label: '동물 (Animals)', icon: '🐶', description: '귀여운 동물 친구들' },
  { id: 'colors', label: '색상 (Colors)', icon: '🎨', description: '알록달록 예쁜 색깔' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => {
  const handleSelect = (category: QuizCategory) => {
    playSound('click');
    onSelectCategory(category);
  };

  return (
    <div data-testid="quiz-topic-selector" className="flex flex-wrap justify-center gap-2.5 mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            data-testid={`quiz-category-${cat.id}`}
            onClick={() => handleSelect(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 border-2 ${
              isActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-cute scale-105'
                : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <span className="text-base sm:text-lg">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
