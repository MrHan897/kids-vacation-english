import React, { useState, useEffect } from 'react';
import { getRewards, getCharacters, addSticker, clearRecentReward } from '../../services/storage';
import { RewardState, CharacterItem, StickerItem } from '../../types';
import { StickerBoard } from './StickerBoard';
import { CharacterVault } from './CharacterVault';
import { PraiseAnimation, triggerConfettiCelebration } from './PraiseAnimation';
import { RewardModal } from './RewardModal';
import { PRESET_STICKERS } from '../../data/characterData';
import { Trophy, Sparkles, Star, Award, Heart } from 'lucide-react';
import { playSound } from '../../services/audio';

export const RewardModule: React.FC = () => {
  const [rewards, setRewards] = useState<RewardState>(() => getRewards());
  const [characters, setCharacters] = useState<CharacterItem[]>(() => getCharacters());
  const [showPraiseAnim, setShowPraiseAnim] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync state on mount and when localStorage changes externally
  useEffect(() => {
    const currentRewards = getRewards();
    setRewards(currentRewards);
    setCharacters(getCharacters());

    if (currentRewards.recentReward) {
      setIsModalOpen(true);
    }
  }, []);

  const handleGivePraise = () => {
    setShowPraiseAnim(true);
    triggerConfettiCelebration();

    // Pick a preset sticker or generate praise sticker
    const preset = PRESET_STICKERS[rewards.earnedStickers.length % PRESET_STICKERS.length] || {
      name: '칭찬 참 잘했어요!',
      icon: '🌟',
      description: '오늘도 스스로 학습을 멋지게 해냈어요!',
      category: 'star',
    };

    const newSticker: StickerItem = {
      id: `stk-praise-${Date.now()}`,
      name: preset.name,
      icon: preset.icon,
      description: preset.description,
      category: preset.category || 'star',
      unlockedAt: new Date().toISOString(),
    };

    const updated = addSticker(newSticker);
    setRewards(updated);
    setCharacters(getCharacters());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playSound('click');
    clearRecentReward();
    setIsModalOpen(false);
    setRewards(getRewards());
    setCharacters(getCharacters());
  };

  const handleCharacterChange = (char: CharacterItem) => {
    setCharacters(getCharacters());
    setRewards(getRewards());
  };

  const modalTitle = rewards.recentReward?.title || '칭찬 스티커 획득!';
  const modalDesc = rewards.recentReward?.description || '여름방학 학습 목표를 달성하고 멋진 보상을 모았어요!';
  const modalIcon = rewards.recentReward?.icon || '🌟';

  return (
    <div className="space-y-6">
      {/* Praise Canvas Confetti Animation */}
      <PraiseAnimation active={showPraiseAnim} onComplete={() => setShowPraiseAnim(false)} />

      {/* Celebratory Reward Modal */}
      <RewardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        description={modalDesc}
        icon={modalIcon}
        badge="방학 참 잘했어요!"
      />

      {/* Praise Banner Header */}
      <div className="card-pastel bg-gradient-to-r from-amber-100 via-pink-100 to-purple-100 border-3 border-amber-300 p-6 sm:p-8 text-center relative overflow-hidden shadow-cute-lg">
        <div className="inline-flex p-4 bg-amber-300/80 text-amber-950 rounded-3xl mb-3 shadow-sm transform -rotate-3">
          <Trophy className="w-8 h-8 fill-amber-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          칭찬 스티커판 & 캐릭터 수집 보관함 🎁
        </h2>
        <p className="text-sm font-semibold text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
          방학 동안 시간표 활동을 완료하고 파닉스/퀴즈를 마스터하여 스티커를 모아보세요!
          <br className="hidden sm:inline" />
          스티커가 쌓이면 귀여운 동반자 캐릭터들이 해금됩니다!
        </p>

        {/* Big Action Button for Earning Praise Sticker */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGivePraise}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 hover:from-amber-500 hover:to-purple-500 text-amber-950 font-black text-base rounded-2xl shadow-cute-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 fill-amber-950 animate-spin-slow" />
            <span>오늘의 칭찬 스티커 받기! 🌟</span>
          </button>
        </div>
      </div>

      {/* Praise Sticker Board */}
      <StickerBoard
        stickers={rewards.earnedStickers}
        stickersCount={rewards.stickersCount}
      />

      {/* Collectible Character Vault Grid */}
      <CharacterVault
        rewards={rewards}
        onCharacterChange={handleCharacterChange}
        onRewardsUpdate={(updated) => {
          setRewards(updated);
          setCharacters(getCharacters());
        }}
      />
    </div>
  );
};

export default RewardModule;
