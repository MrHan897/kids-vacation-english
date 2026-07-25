import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile, GradeLevel } from './types';
import { getRewards, getCharacters, getUserProfile, saveUserProfile, resetAllData, addSticker } from './services/storage';
import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { TimetableModule } from './components/timetable/TimetableModule';
import { TimerModule } from './components/timer/TimerModule';
import { PhonicsModule } from './components/english/PhonicsModule';
import { QuizModule } from './components/english/QuizModule';
import { MathModule } from './components/math/MathModule';
import { RewardModule } from './components/rewards/RewardModule';
import { TutorialModal } from './components/common/TutorialModal';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timetable');
  const [rewards, setRewards] = useState(() => getRewards());
  const [characters, setCharacters] = useState(() => getCharacters());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  useEffect(() => {
    // Refresh rewards & active characters when tab changes
    setRewards(getRewards());
    setCharacters(getCharacters());
  }, [activeTab]);

  // Safe active character fallback to prevent runtime undefined crashes
  const activeCharacter =
    characters.find((c) => c.id === rewards.activeCharacterId && c.unlocked) ||
    characters.find((c) => c.unlocked) ||
    characters[0] || {
      id: 'rabbit',
      name: '마법 토끼',
      avatar: '🐰',
      unlocked: true,
      description: '꿈많은 공부 토끼',
    };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveUserProfile(newProfile);
  };

  const handleEarnSticker = () => {
    const updated = addSticker({
      id: `math-${Date.now()}`,
      name: '수학 정답 스티커',
      icon: '🔢',
      description: '어린이 수학 퀴즈 정답 달성!',
      category: 'star',
    });
    setRewards(updated);
  };

  const handleResetData = () => {
    if (window.confirm('시간표, 프로필, 칭찬 스티커 데이터를 모두 초기 상태로 돌릴까요?')) {
      resetAllData();
      setRewards(getRewards());
      setCharacters(getCharacters());
      setUserProfile(getUserProfile());
      window.location.reload();
    }
  };

  // Helper mapping grade string to GradeLevel enum
  const currentGradeLevel: GradeLevel =
    userProfile.grade === '초등 2학년' ? 'grade2' : userProfile.grade === '초등 3학년' ? 'grade3' : 'grade1';

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-pastel-pink">
      <div>
        {/* Top Header */}
        <Header
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          stickersCount={rewards.stickersCount}
          activeCharacterName={activeCharacter.name}
          activeCharacterAvatar={activeCharacter.avatar}
          onReset={handleResetData}
          onOpenTutorial={() => setIsTutorialOpen(true)}
        />

        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Tab Container */}
        <main className="max-w-4xl mx-auto px-4 pb-24 md:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'timetable' && <TimetableModule onNavigateTab={setActiveTab} />}
              {activeTab === 'timer' && <TimerModule />}
              {activeTab === 'phonics' && <PhonicsModule grade={currentGradeLevel} />}
              {activeTab === 'quiz' && <QuizModule />}
              {activeTab === 'math' && (
                <MathModule grade={currentGradeLevel} onEarnSticker={handleEarnSticker} />
              )}
              {activeTab === 'rewards' && <RewardModule />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Online Tutorial Guide Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsTutorialOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400 font-semibold border-t border-pink-100 bg-white/50">
        <p>☀️ {userProfile.name} 어린이 맞춤 여름방학 시간표 & 학년별 학습 웹 앱</p>
      </footer>
    </div>
  );
};

export default App;
