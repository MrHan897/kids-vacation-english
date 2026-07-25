import React, { useState } from 'react';
import { StickerItem } from '../../types';
import { playSound, speakText } from '../../services/audio';
import { Award, Star, Crown, Trophy, Medal, Heart, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickerBoardProps {
  stickers: StickerItem[];
  stickersCount: number;
  onSelectSticker?: (sticker: StickerItem) => void;
}

type CategoryFilter = 'all' | 'star' | 'crown' | 'trophy' | 'medal' | 'heart' | 'spark';

export const StickerBoard: React.FC<StickerBoardProps> = ({
  stickers,
  stickersCount,
  onSelectSticker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [activeSticker, setActiveSticker] = useState<StickerItem | null>(null);

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: '전체', icon: '🌈' },
    { id: 'star', label: '별', icon: '🌟' },
    { id: 'crown', label: '왕관', icon: '👑' },
    { id: 'trophy', label: '트로피', icon: '🏆' },
    { id: 'medal', label: '메달', icon: '🥇' },
    { id: 'heart', label: '하트', icon: '❤️' },
    { id: 'spark', label: '반짝이', icon: '✨' },
  ];

  const filteredStickers = stickers.filter((stk) => {
    if (selectedCategory === 'all') return true;
    if (stk.category) return stk.category === selectedCategory;

    // Fallback detection by icon or name if category prop omitted
    if (selectedCategory === 'star' && (stk.icon.includes('⭐') || stk.icon.includes('🌟') || stk.name.includes('별'))) return true;
    if (selectedCategory === 'crown' && (stk.icon.includes('👑') || stk.name.includes('왕관'))) return true;
    if (selectedCategory === 'trophy' && (stk.icon.includes('🏆') || stk.name.includes('트로피'))) return true;
    if (selectedCategory === 'medal' && (stk.icon.includes('🥇') || stk.name.includes('메달'))) return true;
    if (selectedCategory === 'heart' && (stk.icon.includes('❤️') || stk.icon.includes('💖') || stk.name.includes('하트'))) return true;
    if (selectedCategory === 'spark' && (stk.icon.includes('✨') || stk.icon.includes('🎉') || stk.name.includes('반짝'))) return true;

    return false;
  });

  const handleStickerClick = (stk: StickerItem) => {
    playSound('success');
    speakText(stk.name, 'ko-KR');
    setActiveSticker(stk);
    if (onSelectSticker) onSelectSticker(stk);
  };

  return (
    <div
      data-testid="sticker-board"
      className="card-pastel bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-cute p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-sm">
            🏷️
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              내가 모은 칭찬 스티커판
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500">
              시간표와 퀴즈를 완료하고 모은 소중한 칭찬 스티커들을 확인해보세요!
            </p>
          </div>
        </div>

        {/* Sticker Count Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 text-amber-950 px-4 py-2 rounded-2xl shadow-sm">
          <Award className="w-5 h-5 text-amber-600 fill-amber-400" />
          <span className="text-sm font-extrabold">총 스티커:</span>
          <span data-testid="sticker-count" className="text-lg font-black text-amber-900">
            {stickersCount}개
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>스티커 종류:</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSound('click');
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-amber-950 shadow-cute scale-105 border border-amber-500'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Sticker Grid Display */}
      {filteredStickers.length === 0 ? (
        <div className="text-center py-10 bg-amber-50/50 rounded-3xl border-2 border-dashed border-amber-200">
          <p className="text-4xl mb-2">🌟</p>
          <p className="text-sm font-bold text-amber-900">아직 선택한 종류의 스티커가 없어요!</p>
          <p className="text-xs text-slate-500 mt-1">시간표 활동과 영어 퀴즈를 풀고 스티커를 받으세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredStickers.map((stk, idx) => (
            <motion.div
              key={`${stk.id}-${idx}`}
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStickerClick(stk)}
              className="p-3 bg-gradient-to-b from-white to-amber-50/80 rounded-2xl border-2 border-amber-200 hover:border-amber-400 shadow-cute hover:shadow-cute-lg cursor-pointer text-center flex flex-col items-center justify-between transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
                {stk.icon}
              </div>
              <span className="text-xs font-extrabold text-amber-950 line-clamp-1">{stk.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{stk.description}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Sticker Detail Card Modal Popup */}
      <AnimatePresence>
        {activeSticker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-amber-100/90 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-3 text-amber-950"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeSticker.icon}</span>
              <div>
                <h4 className="font-extrabold text-sm">{activeSticker.name}</h4>
                <p className="text-xs text-amber-800">{activeSticker.description}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSticker(null)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-200 px-3 py-1 rounded-xl"
            >
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
