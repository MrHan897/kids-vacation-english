import React from 'react';
import { Calendar, Timer, BookOpen, HelpCircle, Trophy, Calculator, Home } from 'lucide-react';
import { ActiveTab } from '../../types';
import { playSound } from '../../services/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'timetable', label: '방학 시간표', shortLabel: '시간표', icon: Calendar, color: 'bg-pastel-pink text-pink-900 border-pink-300' },
    { id: 'timer', label: '뽀모도로 타이머', shortLabel: '타이머', icon: Timer, color: 'bg-pastel-blue text-sky-900 border-sky-300' },
    { id: 'phonics', label: '파닉스 알파벳', shortLabel: '파닉스', icon: BookOpen, color: 'bg-pastel-purple text-purple-900 border-purple-300' },
    { id: 'quiz', label: '기초 영어 퀴즈', shortLabel: '영어퀴즈', icon: HelpCircle, color: 'bg-pastel-mint text-emerald-900 border-emerald-300' },
    { id: 'math', label: '어린이 수학 놀이', shortLabel: '수학놀이', icon: Calculator, color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'myroom', label: '마이룸 아지트', shortLabel: '마이룸', icon: Home, color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { id: 'rewards', label: '칭찬 스티커 & 캐릭터', shortLabel: '보상함', icon: Trophy, color: 'bg-pastel-yellow text-amber-900 border-amber-300' },
  ];

  const handleSelect = (tab: ActiveTab) => {
    playSound('click');
    onTabChange(tab);
  };

  return (
    <>
      {/* Desktop / Tablet Navbar (Top) */}
      <nav className="hidden md:block w-full max-w-5xl mx-auto px-4 my-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-2 shadow-pastel border-2 border-pink-100 flex items-center justify-around gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            const testIdMap: Record<ActiveTab, string> = {
              timetable: 'nav-timetable',
              timer: 'nav-timer',
              phonics: 'nav-english',
              quiz: 'nav-quiz',
              math: 'nav-math',
              myroom: 'nav-myroom',
              rewards: 'nav-rewards',
            };

            return (
              <button
                key={tab.id}
                data-testid={testIdMap[tab.id]}
                onClick={() => handleSelect(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all duration-200 ${
                  isActive
                    ? `${tab.color} shadow-cute scale-105 border-2`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-slow' : ''}`} />
                <span className="text-sm font-extrabold whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-Friendly 64px Touch Target) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            const testIdMap: Record<ActiveTab, string> = {
              timetable: 'nav-timetable',
              timer: 'nav-timer',
              phonics: 'nav-english',
              quiz: 'nav-quiz',
              math: 'nav-math',
              myroom: 'nav-myroom',
              rewards: 'nav-rewards',
            };

            return (
              <button
                key={tab.id}
                data-testid={testIdMap[tab.id]}
                onClick={() => handleSelect(tab.id)}
                className={`flex-1 min-h-[60px] flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 select-none ${
                  isActive
                    ? `${tab.color} font-black scale-105 shadow-md border-2`
                    : 'text-slate-500 font-bold hover:text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[11px] font-extrabold tracking-tight">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
