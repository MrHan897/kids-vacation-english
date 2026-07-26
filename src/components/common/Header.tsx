import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Volume2, RotateCcw, User, Sparkles } from 'lucide-react';
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
    <header className="w-full bg-white/85 backdrop-blur-md border-b-4 border-pastel-pink shadow-sm px-4 py-2.5 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* App Title & Child Welcome Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleTTSDemo}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-purple flex items-center justify-center text-2xl shadow-md transform hover:rotate-6 transition-transform cursor-pointer"
            title="인사 나누기"
          >
            {userProfile.avatar || '☀️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                <span className="text-pink-600 font-black">{userProfile.name}</span> 어린이의 놀이터
              </h1>
              <button
                onClick={() => {
                  playSound('click');
                  setIsProfileModalOpen(true);
                }}
                className="text-[11px] bg-pastel-pink-light hover:bg-pastel-pink text-pink-800 font-extrabold px-2.5 py-0.5 rounded-full border border-pink-300 transition-all flex items-center gap-1 shadow-xs"
              >
                <span>{userProfile.grade}</span>
                <User className="w-3 h-3 text-pink-600" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              안녕 <span className="font-bold text-slate-700">{userProfile.name}</span>야! 오늘도 신나는 여름방학 보내자! 🌟
            </p>
          </div>
        </div>

        {/* User Badges & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online Tutorial Guide Button */}
          {onOpenTutorial && (
            <button
              onClick={() => {
                playSound('click');
                onOpenTutorial();
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-900 rounded-2xl text-xs font-black shadow-xs transition-all active:scale-95"
              title="이용 안내 보기"
            >
              <span>📖 이용 안내</span>
            </button>
          )}

          {/* Active Character Badge */}
          <div className="flex items-center gap-1.5 bg-pastel-purple-light border-2 border-pastel-purple text-purple-900 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs">
            <span className="text-lg">{activeCharacterAvatar}</span>
            <span>{activeCharacterName ? activeCharacterName.split('(')[0].trim() : '마법 토끼'}</span>
          </div>

          {/* Sticker Count Badge */}
          <div className="flex items-center gap-1.5 bg-pastel-yellow-light border-2 border-pastel-yellow text-amber-900 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-pulse" />
            <span data-testid="sticker-count">스티커 {stickersCount}개</span>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              playSound('click');
              setIsProfileModalOpen(true);
            }}
            title="이름/학년 변경하기"
            className="p-2 bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 text-pink-800 rounded-2xl transition-all active:scale-95 shadow-xs"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Audio TTS Test Button */}
          <button
            onClick={handleTTSDemo}
            title="영어 인사 듣기"
            className="p-2 bg-pastel-blue-light hover:bg-pastel-blue border-2 border-pastel-blue-dark text-sky-800 rounded-2xl transition-all active:scale-95 shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
          </button>



          {/* Reset Storage Button */}
          <button
            data-testid="reset-data-btn"
            onClick={onReset}
            title="전체 데이터 초기화"
            className="p-2 bg-slate-100 hover:bg-rose-100 border-2 border-slate-200 text-slate-600 hover:text-rose-600 rounded-2xl transition-all active:scale-95 shadow-xs"
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
