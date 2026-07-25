import React, { useState } from 'react';
import { CharacterItem, RewardState } from '../../types';
import { getCharacters, unlockCharacter, saveRewards } from '../../services/storage';
import { playSound, speakText } from '../../services/audio';
import { Lock, Sparkles, Star, Award, CheckCircle2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterVaultProps {
  rewards: RewardState;
  onCharacterChange?: (character: CharacterItem) => void;
  onRewardsUpdate?: (rewards: RewardState) => void;
}

export const CharacterVault: React.FC<CharacterVaultProps> = ({
  rewards,
  onCharacterChange,
  onRewardsUpdate,
}) => {
  const [characters, setCharacters] = useState<CharacterItem[]>(() => getCharacters());
  const [activeCharId, setActiveCharId] = useState<string>(
    rewards.activeCharacterId || characters.find((c) => c.unlocked)?.id || 'char-bunny'
  );

  const handleSelectCharacter = (char: CharacterItem) => {
    if (!char.unlocked) {
      // Check if user has enough stickers to manually trigger unlock
      if (rewards.stickersCount >= char.requiredStickers) {
        playSound('reward');
        const updatedRewards = unlockCharacter(char.id);
        const updatedChars = getCharacters();
        setCharacters(updatedChars);
        setActiveCharId(char.id);
        if (onRewardsUpdate) onRewardsUpdate(updatedRewards);
        if (onCharacterChange) onCharacterChange(char);
      } else {
        playSound('click');
        speakText(`스티커 ${char.requiredStickers - rewards.stickersCount}개가 더 필요해요!`, 'ko-KR');
      }
      return;
    }

    // Set active companion character
    playSound('success');
    speakText(`안녕! 나는 ${char.name}야! 오늘도 함께 공부하자!`, 'ko-KR');
    setActiveCharId(char.id);

    const updatedRewards: RewardState = {
      ...rewards,
      activeCharacterId: char.id,
    };
    saveRewards(updatedRewards);
    if (onRewardsUpdate) onRewardsUpdate(updatedRewards);
    if (onCharacterChange) onCharacterChange(char);
  };

  const unlockedCount = characters.filter((c) => c.unlocked).length;

  return (
    <div
      data-testid="character-vault"
      className="card-pastel bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-cute p-6 space-y-6"
    >
      {/* Vault Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-2xl shadow-sm">
            🧸
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              귀여운 캐릭터 보관함
              <Sparkles className="w-5 h-5 text-purple-500 fill-purple-300 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500">
              칭찬 스티커를 많이 모아 귀여운 방학 친구들을 해금하고 동반자로 선택하세요!
            </p>
          </div>
        </div>

        {/* Collection Progress Counter */}
        <div className="flex items-center gap-2 bg-purple-100 border-2 border-purple-300 text-purple-900 px-4 py-2 rounded-2xl shadow-sm">
          <Award className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-extrabold">수집 진행도:</span>
          <span className="text-base font-black text-purple-950">
            {unlockedCount} / {characters.length}
          </span>
        </div>
      </div>

      {/* Character Collection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {characters.map((char) => {
          const isSelected = activeCharId === char.id;
          const isUnlocked = char.unlocked;
          const progressPercent = Math.min(
            100,
            Math.round((rewards.stickersCount / (char.requiredStickers || 1)) * 100)
          );

          return (
            <motion.div
              key={char.id}
              data-testid="character-vault-item"
              whileHover={{ scale: 1.04, rotateY: 5, rotateX: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{ perspective: 1000 }}
              onClick={() => handleSelectCharacter(char)}
              className={`relative p-5 rounded-3xl border-3 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-50 via-white to-pink-50 border-purple-500 shadow-cute-lg ring-4 ring-purple-200'
                  : isUnlocked
                  ? 'bg-white border-purple-200 hover:border-purple-300 shadow-cute'
                  : 'bg-slate-50/90 border-slate-200 opacity-80 hover:opacity-100'
              }`}
            >
              <div data-testid={`character-card-${char.id}`} className="contents">
              {/* Holographic 3D Shimmer Beam overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60 pointer-events-none transform -skew-x-12 animate-pulse" />
              )}

              {/* Active Selection Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>내 친구</span>
                </div>
              )}

              {/* Main Avatar & Details */}
              <div className="flex items-start gap-4 z-10">
                {/* Character Silhouette vs Vibrant Icon */}
                <div
                  className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-inner border-2 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 border-purple-200'
                      : 'bg-slate-200 border-slate-300 text-slate-400'
                  }`}
                >
                  {isUnlocked ? (
                    <span>{char.avatar}</span>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="filter grayscale blur-[1px] opacity-40">{char.avatar}</span>
                      <Lock className="w-6 h-6 text-slate-500 absolute" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-black text-slate-800 text-base">{char.name}</h4>
                  </div>
                  {char.badge && (
                    <span className="inline-block text-[11px] font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg mt-1">
                      🏷️ {char.badge}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {char.description}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Bar or Unlocked Status */}
              <div className="mt-4 pt-3 border-t border-purple-100/60 z-10">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                      <span>해금 완료</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">클릭하여 선택</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-amber-800">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>필요 스티커</span>
                      </span>
                      <span>
                        {rewards.stickersCount} / {char.requiredStickers}개
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
