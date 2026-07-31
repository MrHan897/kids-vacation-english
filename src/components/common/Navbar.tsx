import React from 'react';
import { Calendar, Timer, BookOpen, HelpCircle, Trophy, Calculator, Home, Compass } from 'lucide-react';
import { ActiveTab } from '../../types';
import { playSound } from '../../services/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'timetable', label: 'Daily Quest 🗓️', shortLabel: 'Daily Quest', icon: Calendar, color: 'bg-pastel-pink text-pink-900 border-pink-300' },
    { id: 'timer', label: 'Study Timer ⏱️', shortLabel: 'Timer', icon: Timer, color: 'bg-pastel-blue text-sky-900 border-sky-300' },
    { id: 'phonics', label: 'Phonics 🔤', shortLabel: 'Phonics', icon: BookOpen, color: 'bg-pastel-purple text-purple-900 border-purple-300' },
    { id: 'quiz', label: 'English Quiz ❓', shortLabel: 'Quiz', icon: HelpCircle, color: 'bg-pastel-mint text-emerald-900 border-emerald-300' },
    { id: 'math', label: 'Math Play 🔢', shortLabel: 'Math', icon: Calculator, color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'outdoor', label: 'Outdoor 🚲', shortLabel: 'Outdoor', icon: Compass, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'myroom', label: 'My Room 🏠', shortLabel: 'My Room', icon: Home, color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { id: 'rewards', label: 'Reward & Store 🎁', shortLabel: 'Reward', icon: Trophy, color: 'bg-pastel-yellow text-amber-900 border-amber-300' },
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
              outdoor: 'nav-outdoor',
              myroom: 'nav-myroom',
              rewards: 'nav-rewards',
            };

            return (
              <button
                key={tab.id}
                data-testid={testIdMap[tab.id]}
                onClick={() => handleSelect(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-seed-primary text-white shadow-xs font-extrabold scale-[1.02]'
                    : 'text-seed-muted hover:bg-seed-surface hover:text-seed-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-Friendly 64px Touch Target) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-seed-hairline shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around gap-1">
          {tabs
            .filter((tab) => tab.id !== 'outdoor')
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              const testIdMap: Record<ActiveTab, string> = {
                timetable: 'nav-timetable',
                timer: 'nav-timer',
                phonics: 'nav-english',
                quiz: 'nav-quiz',
                math: 'nav-math',
                outdoor: 'nav-outdoor',
                myroom: 'nav-myroom',
                rewards: 'nav-rewards',
              };

              return (
                <button
                  key={tab.id}
                  data-testid={testIdMap[tab.id]}
                  onClick={() => handleSelect(tab.id)}
                  className={`flex-1 min-h-[58px] flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 select-none ${
                    isActive
                      ? 'bg-seed-brand-tint text-seed-primary font-black border border-orange-200'
                      : 'text-seed-muted font-bold hover:text-seed-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-seed-primary scale-110' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-extrabold tracking-tight">{tab.shortLabel}</span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
};
