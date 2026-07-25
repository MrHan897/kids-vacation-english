import React, { useState } from 'react';
import { AlphabetBoard } from './AlphabetBoard';
import { PhonicsCardGame } from './PhonicsCardGame';
import { BookOpen, Gamepad2 } from 'lucide-react';
import { playSound } from '../../services/audio';

export const PhonicsModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'board' | 'game'>('board');

  const handleSubTabChange = (tab: 'board' | 'game') => {
    playSound('click');
    setActiveSubTab(tab);
  };

  return (
    <div data-testid="phonics-module" className="space-y-6">
      {/* Sub-Tab Switcher */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleSubTabChange('board')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 border-2 ${
            activeSubTab === 'board'
              ? 'bg-purple-600 text-white border-purple-700 shadow-cute scale-105'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-purple-50 hover:border-purple-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>A-Z 알파벳 탐험</span>
        </button>

        <button
          onClick={() => handleSubTabChange('game')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 border-2 ${
            activeSubTab === 'game'
              ? 'bg-purple-600 text-white border-purple-700 shadow-cute scale-105'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-purple-50 hover:border-purple-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>파닉스 짝맞추기 게임</span>
        </button>
      </div>

      {/* Main Content */}
      {activeSubTab === 'board' ? <AlphabetBoard /> : <PhonicsCardGame />}
    </div>
  );
};

export default PhonicsModule;
