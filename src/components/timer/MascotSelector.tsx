import React from 'react';
import { MascotId } from './CharacterAnimation';
import { playSound } from '../../services/audio';

interface MascotSelectorProps {
  selectedMascot: MascotId;
  onSelectMascot: (id: MascotId) => void;
}

const MASCOTS: { id: MascotId; name: string; avatar: string; role: string }[] = [
  { id: 'rabbit', name: '토끼 토리', avatar: '🐰', role: '부지런한 학급 반장' },
  { id: 'bear', name: '곰 포코', avatar: '🐻', role: '든든한 파닉스 박사' },
  { id: 'cat', name: '고양이 네코', avatar: '🐱', role: '똑똑한 퀴즈 박사' },
];

export const MascotSelector: React.FC<MascotSelectorProps> = ({
  selectedMascot,
  onSelectMascot,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 my-3">
      {MASCOTS.map((m) => {
        const isSelected = selectedMascot === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              playSound('click');
              onSelectMascot(m.id);
            }}
            className={`px-3 py-1.5 rounded-2xl border-2 transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'border-sky-400 bg-sky-50 shadow-sm scale-105 font-black text-sky-900'
                : 'border-slate-100 bg-white hover:bg-slate-50 font-bold text-slate-500 opacity-80'
            }`}
          >
            <span className="text-xl">{m.avatar}</span>
            <span className="text-xs">{m.name}</span>
          </button>
        );
      })}
    </div>
  );
};
