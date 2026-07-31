import React from 'react';
import { Calendar, Timer, BookOpen, HelpCircle, Trophy, Calculator, Home, Compass } from 'lucide-react';
import { ActiveTab } from '../../types';
import { playSound } from '../../services/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  // 1. UI 언어의 전면 한글화 탭 메뉴 설정 (7개 슬림 하단 탭 바 시스템)
  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'timetable', label: '오늘의 미션 🗓️', shortLabel: '오늘의 미션', icon: Calendar, color: 'bg-pastel-blue text-sky-900 border-sky-300' },
    { id: 'timer', label: '타이머 ⏱️', shortLabel: '타이머', icon: Timer, color: 'bg-pastel-orange text-orange-900 border-orange-300' },
    { id: 'phonics', label: '파닉스 🔤', shortLabel: '파닉스', icon: BookOpen, color: 'bg-pastel-purple text-purple-900 border-purple-300' },
    { id: 'quiz', label: '퀴즈 ❓', shortLabel: '퀴즈', icon: HelpCircle, color: 'bg-pastel-mint text-emerald-900 border-emerald-300' },
    { id: 'math', label: '수학 놀이 🔢', shortLabel: '수학 놀이', icon: Calculator, color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'myroom', label: '내 방 🏠', shortLabel: '내 방', icon: Home, color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { id: 'rewards', label: '보상 상점 🎁', shortLabel: '보상 상점', icon: Trophy, color: 'bg-pastel-yellow text-amber-900 border-amber-300' },
  ];

  const handleSelect = (tab: ActiveTab) => {
    playSound('click');
    onTabChange(tab);
  };

  return (
    <>
      {/* Desktop / Tablet Navbar (Top) */}
      <nav className="hidden md:block w-full max-w-6xl mx-auto px-4 my-4">
        <div className="bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-xs border border-seed-hairline flex items-center justify-around gap-1.5">
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
                className={`nav-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-seed-primary text-white shadow-xs font-extrabold scale-[1.02]'
                    : 'text-seed-muted hover:bg-seed-surface hover:text-seed-foreground'
                }`}
              >
                <span className="menu-icon flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </span>
                <span className="menu-text text-xs sm:text-sm font-extrabold whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Icon-Only Touch Optimized: 28px+ Icons, Min 52x52px Touch Target) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-seed-hairline shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2 pb-safe">
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
                aria-label={tab.shortLabel}
                title={tab.shortLabel}
                className={`flex-1 min-h-[52px] min-w-[48px] flex items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-90 select-none ${
                  isActive
                    ? 'bg-[#fff5f0] text-[#ff6f0f]'
                    : 'text-[#868b94] hover:text-[#212124]'
                }`}
              >
                {/* Icon Only Container (28px+ Large Size for Kids Finger Touch) */}
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive ? 'bg-[#ff6f0f] text-white shadow-md scale-110 -translate-y-0.5' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>

                {/* Accessibility Screen Reader Only Text */}
                <span className="sr-only">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
