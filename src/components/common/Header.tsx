import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Volume2, RotateCcw, User, Sparkles, Coins } from 'lucide-react';
import { playSound, speakText } from '../../services/audio';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  stickersCount: number;
  activeCharacterName: string;
  activeCharacterAvatar: string;
  onReset: () => void;
  onOpenTutorial?: () => void;
  onOpenDevDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onSaveProfile,
  stickersCount,
  activeCharacterName,
  activeCharacterAvatar,
  onReset,
  onOpenTutorial,
  onOpenDevDashboard,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleTTSDemo = () => {
    playSound('click');
    speakText(`Hello ${userProfile.name}! Welcome to Summer Vacation English!`, 'en-US');

    // Secret 5-tap developer dashboard trigger on child avatar icon
    setSecretClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        if (onOpenDevDashboard) onOpenDevDashboard();
        return 0;
      }
      return next;
    });
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-seed-hairline shadow-xs px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* App Title & Child Welcome Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleTTSDemo}
            className="w-11 h-11 rounded-2xl bg-seed-brand-tint border border-orange-200 flex items-center justify-center text-2xl shadow-xs transform hover:scale-105 transition-transform cursor-pointer"
            title="인사 나누기"
          >
            {userProfile.avatar || '☀️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-seed-foreground tracking-tight">
                <span className="text-seed-primary font-extrabold">{userProfile.name}</span> 어린이의 놀이터
              </h1>
              <button
                onClick={() => {
                  playSound('click');
                  setIsProfileModalOpen(true);
                }}
                className="text-[11px] bg-seed-brand-tint hover:bg-orange-100 text-seed-primary font-bold px-3 py-0.5 rounded-full border border-orange-200 transition-all flex items-center gap-1 shadow-2xs"
              >
                <span>{userProfile.grade}</span>
                <User className="w-3 h-3 text-seed-primary" />
              </button>
            </div>
            <p className="text-xs text-seed-muted font-medium">
              안녕 <span className="font-bold text-seed-foreground">{userProfile.name}</span>야! 오늘도 신나는 여름방학 보내자! 🌟
            </p>
          </div>
        </div>

        {/* User Badges & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Online Tutorial Guide Button */}
          {onOpenTutorial && (
            <button
              onClick={() => {
                playSound('click');
                onOpenTutorial();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-seed-surface border border-seed-hairline text-seed-foreground hover:bg-slate-100 rounded-full text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-98"
              title="이용 안내 보기"
            >
              <span className="text-base">📖</span>
              <span>이용 안내</span>
            </button>
          )}

          {/* Active Character Badge */}
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-900 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-2xs">
            <span className="text-base">{activeCharacterAvatar}</span>
            <span>{activeCharacterName ? activeCharacterName.split('(')[0].trim() : '마법 토끼'}</span>
          </div>

          {/* Reward Point & Sticker Count Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-2xs">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-300 animate-bounce" />
            <span data-testid="sticker-count">Reward: {stickersCount * 10} Coins 🪙 ({stickersCount}⭐)</span>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              playSound('click');
              setIsProfileModalOpen(true);
            }}
            title="이름/학년 변경하기"
            className="p-2 bg-seed-surface hover:bg-slate-100 border border-seed-hairline text-seed-foreground rounded-full transition-all active:scale-98 shadow-2xs"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Audio TTS Test Button */}
          <button
            onClick={handleTTSDemo}
            title="영어 인사 듣기"
            className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-full transition-all active:scale-98 shadow-2xs"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Reset Storage Button */}
          <button
            data-testid="reset-data-btn"
            onClick={onReset}
            title="전체 데이터 초기화"
            className="p-2 bg-seed-surface hover:bg-rose-50 border border-seed-hairline text-slate-400 hover:text-rose-600 rounded-full transition-all active:scale-98 shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={onSaveProfile}
      />
    </header>
  );
};
