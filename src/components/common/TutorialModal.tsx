import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Play, Award, Clock, Smile, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../../services/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'timetable' | 'timer' | 'phonics' | 'quiz' | 'math' | 'outdoor' | 'myroom' | 'rewards') => void;
}

const MENU_GUIDES = [
  {
    id: 'timetable',
    name: '📅 1. 방학 시간표 (24시간 원형 시계)',
    icon: '⏰',
    color: 'from-pink-500 to-rose-500',
    description: '어린이가 직접 24시간 원형 시계에서 공부, 놀이, 휴식, 식사 시간을 타일로 세팅합니다. 자녀 프로필 학년(1~3학년) 변경 시 시간표 템플릿이 자동으로 맞춤 전환됩니다!',
  },
  {
    id: 'timer',
    name: '⏱️ 2. 뽀모도로 타이머 (자유 시간 설정)',
    icon: '⏳',
    color: 'from-sky-500 to-indigo-500',
    description: '5분, 10분, 15분, 25분, 60분 등 집중 공부 시간을 자유롭게 설정하고 알람과 함께 공부 몰입도를 높입니다. 공부 성공 시 칭찬 스티커가 자동 지급됩니다.',
  },
  {
    id: 'phonics',
    name: '🔤 3. 파닉스 알파벳 (1~3학년 레벨별)',
    icon: '📚',
    color: 'from-purple-500 to-indigo-600',
    description: '1학년 알파벳 기초 사운드 팝, 2학년 이중자음(Blends) 퀴즈, 3학년 실생활 회화(Dialogue) 말하기! AI 발음 칭찬 왕관 시스템으로 말하기 자신감을 키워줘요.',
  },
  {
    id: 'quiz',
    name: '💡 4. 기초 영어 퀴즈 (단어 & 문장)',
    icon: '❓',
    color: 'from-emerald-500 to-teal-600',
    description: '기분, 인사, 동물, 색깔 등 어린이가 꼭 알아야 할 기초 영어 퀴즈를 풀고 스티커를 받습니다.',
  },
  {
    id: 'math',
    name: '🔢 5. 어린이 수학 놀이 (프로필 연동)',
    icon: '➕',
    color: 'from-amber-500 to-orange-600',
    description: '1학년(10 이하 덧/뺄셈), 2학년(구구단 & 두 자리), 3학년(세 자리 & 분수/도형)! 프로필 학년에 따라 가장 적합한 난이도 문제가 자동 출제됩니다.',
  },
  {
    id: 'outdoor',
    name: '🌳 6. 야외활동 체험관 (2026 방학 이벤트)',
    icon: '📡',
    color: 'from-emerald-600 to-green-700',
    description: '여름방학 기간 아이와 함께 가기 좋은 자연 숲 체험, 과학관 밤탐험, 박물관 유물 발굴 이벤트를 실시간 모니터링! 날씨/자외선 꿀팁과 하트 찜 기능 지원.',
  },
  {
    id: 'myroom',
    name: '🏠 7. 마이룸 아지트 (나만의 가구 커스텀)',
    icon: '✨',
    color: 'from-purple-600 to-pink-600',
    description: '원하는 가구를 손가락 터치 드래그로 자유 배치! [✨ 나만의 상상 3D 가구] 커스텀 버튼으로 아이가 상상하는 우주선, 공룡, 로봇 가구를 직접 새로 만들어 배치하세요.',
  },
  {
    id: 'rewards',
    name: '🏆 8. 칭찬 스티커 & 캐릭터 보상함',
    icon: '⭐',
    color: 'from-yellow-500 to-amber-600',
    description: '공부와 퀴즈로 모은 칭찬 스티커 개수를 확인하고, 마법 토끼/사막여우 등 귀여운 방학 동반자 캐릭터를 해금할 수 있습니다.',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [selectedMenuIdx, setSelectedMenuIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentMenu = MENU_GUIDES[selectedMenuIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-purple-300 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all z-10 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-purple-100 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border-2 border-purple-200 flex items-center justify-center text-2xl shadow-sm shrink-0">
            📖
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              여름방학 앱 전체 메뉴 & 이용 안내서
              <Sparkles className="w-5 h-5 text-purple-500 fill-purple-300 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              8대 핵심 메뉴의 자세한 사용법과 기능을 한눈에 확인해보세요!
            </p>
          </div>
        </div>

        {/* Menu Tab Selection Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {MENU_GUIDES.map((menu, idx) => (
            <button
              key={menu.id}
              onClick={() => {
                playSound('click');
                setSelectedMenuIdx(idx);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 border ${
                selectedMenuIdx === idx
                  ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-105'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-purple-50'
              }`}
            >
              <span>{menu.icon}</span>
              <span className="ml-1">{menu.name.split('.')[1]?.trim().split('(')[0]}</span>
            </button>
          ))}
        </div>

        {/* Menu Detail Card */}
        <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentMenu.color} text-white shadow-lg space-y-3 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-4xl sm:text-5xl">{currentMenu.icon}</span>
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              메뉴 {selectedMenuIdx + 1} / 8
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black">{currentMenu.name}</h4>
          <p className="text-sm font-semibold leading-relaxed text-white/95 bg-black/20 p-4 rounded-2xl border border-white/20">
            {currentMenu.description}
          </p>
        </div>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              disabled={selectedMenuIdx === 0}
              onClick={() => {
                playSound('click');
                setSelectedMenuIdx((prev) => Math.max(0, prev - 1));
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                selectedMenuIdx === 0 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 메뉴</span>
            </button>

            <button
              disabled={selectedMenuIdx === MENU_GUIDES.length - 1}
              onClick={() => {
                playSound('click');
                setSelectedMenuIdx((prev) => Math.min(MENU_GUIDES.length - 1, prev + 1));
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                selectedMenuIdx === MENU_GUIDES.length - 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>다음 메뉴</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              playSound('reward');
              onClose();
              if (onNavigateTab) onNavigateTab(currentMenu.id as any);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>이 메뉴로 즉시 이동! 🚀</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
