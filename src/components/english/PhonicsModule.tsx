import React, { useState } from 'react';
import { AlphabetBoard } from './AlphabetBoard';
import { PhonicsCardGame } from './PhonicsCardGame';
import { BookOpen, Gamepad2, Sparkles, Volume2, Mic, CheckCircle2, ArrowRight } from 'lucide-react';
import { playSound, speakText, listenAndRecognize } from '../../services/audio';
import { StarDustFX } from '../rewards/PraiseAnimation';
import { motion, AnimatePresence } from 'framer-motion';

// Grade 1: Starfall Sound Pop Data
const GRADE1_POP_DATA = [
  { letter: 'A', sound: '/æ/ (애)', word: 'Apple', icon: '🍎', bg: 'bg-pink-100 border-pink-300' },
  { letter: 'B', sound: '/b/ (브)', word: 'Bear', icon: '🐻', bg: 'bg-orange-100 border-orange-300' },
  { letter: 'C', sound: '/k/ (크)', word: 'Cat', icon: '🐱', bg: 'bg-yellow-100 border-yellow-300' },
  { letter: 'D', sound: '/d/ (드)', word: 'Dog', icon: '🐶', bg: 'bg-emerald-100 border-emerald-300' },
  { letter: 'E', sound: '/e/ (에)', word: 'Elephant', icon: '🐘', bg: 'bg-sky-100 border-sky-300' },
  { letter: 'F', sound: '/f/ (프)', word: 'Fish', icon: '🐟', bg: 'bg-purple-100 border-purple-300' },
];

// Grade 2: Duolingo ABC Word Builder Data
const GRADE2_BUILDER_DATA = [
  { targetWord: 'CAT', icon: '🐱', translation: '고양이', letters: ['C', 'A', 'T', 'S', 'B'] },
  { targetWord: 'DOG', icon: '🐶', translation: '강아지', letters: ['D', 'O', 'G', 'K', 'L'] },
  { targetWord: 'SUN', icon: '☀️', translation: '태양', letters: ['S', 'U', 'N', 'P', 'T'] },
  { targetWord: 'BOX', icon: '📦', translation: '상자', letters: ['B', 'O', 'X', 'M', 'R'] },
];

// Grade 3: Khan Kids Storybook Roleplay Data
const GRADE3_STORY_DATA = [
  {
    title: 'The Friendly Bear & Apple 🍎',
    scene: 'Cute Bear meets a red Apple in the forest!',
    englishText: 'Hello Little Apple! You look so sweet and tasty today.',
    translation: '안녕 작은 사과야! 오늘 정말 달콤하고 맛있어 보이는구나.',
    icon: '🐻',
  },
  {
    title: 'The Blue Bird & Sunshine ☀️',
    scene: 'Blue Bird sings happily under the warm sun!',
    englishText: 'Good morning Sun! I love singing songs in the sky.',
    translation: '좋은 아침이야 태양아! 나는 하늘에서 노래 부르는 걸 좋아해.',
    icon: '🐦',
  },
];

export const PhonicsModule: React.FC = () => {
  const [activeGrade, setActiveGrade] = useState<'grade1' | 'grade2' | 'grade3'>('grade1');
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'game'>('program');

  // Grade 1 State
  const [popScore, setPopScore] = useState(0);
  const [showStarDust, setShowStarDust] = useState(false);

  // Grade 2 State
  const [g2Index, setG2Index] = useState(0);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [g2Score, setG2Score] = useState(0);

  // Grade 3 State
  const [g3Index, setG3Index] = useState(0);
  const [sttFeedback, setSttFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Grade 1 Sound Pop Click
  const handlePopClick = (item: typeof GRADE1_POP_DATA[0]) => {
    playSound('reward');
    speakText(`${item.letter}! ${item.sound}! ${item.word}!`, 'en-US');
    setPopScore((prev) => prev + 10);
    setShowStarDust(true);
    setTimeout(() => setShowStarDust(false), 1500);
  };

  // Grade 2 Builder Click
  const currentG2 = GRADE2_BUILDER_DATA[g2Index];

  const handleTileClick = (letter: string) => {
    playSound('click');
    speakText(letter, 'en-US');

    const nextBuilt = [...builtLetters, letter];
    setBuiltLetters(nextBuilt);

    if (nextBuilt.join('') === currentG2.targetWord) {
      playSound('success');
      setShowStarDust(true);
      speakText(`Perfect! ${currentG2.targetWord}!`, 'en-US');
      setG2Score((prev) => prev + 20);
      setTimeout(() => {
        setShowStarDust(false);
        setBuiltLetters([]);
        if (g2Index + 1 < GRADE2_BUILDER_DATA.length) {
          setG2Index((prev) => prev + 1);
        } else {
          setG2Index(0);
        }
      }, 1800);
    }
  };

  // Grade 3 Story Roleplay
  const currentG3 = GRADE3_STORY_DATA[g3Index];

  const handleG3STT = () => {
    playSound('click');
    setIsListening(true);
    setSttFeedback('마이크에 문장을 크게 따라 읽어보세요...');

    const stopFn = listenAndRecognize(
      'en-US',
      (res) => {
        setIsListening(false);
        playSound('success');
        setShowStarDust(true);
        setSttFeedback(`🎉 대단해요! 완벽한 스토리북 발음입니다! ⭐ "${res.transcript}"`);
        setTimeout(() => setShowStarDust(false), 2500);
      },
      (err) => {
        setIsListening(false);
        setSttFeedback(`💡 듣기 버튼을 누르고 따라 읽어보세요! (${err})`);
      }
    );

    setTimeout(() => {
      stopFn();
      setIsListening(false);
    }, 7000);
  };

  return (
    <div data-testid="phonics-module" className="space-y-6">
      {/* Sub-Tab Switcher */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setActiveSubTab('program')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 border-2 ${
            activeSubTab === 'program'
              ? 'bg-purple-600 text-white border-purple-700 shadow-cute scale-105'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-purple-50 hover:border-purple-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>A-Z 알파벳 학년별 전용 프로그램</span>
        </button>

        <button
          onClick={() => setActiveSubTab('game')}
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

      {activeSubTab === 'game' ? (
        <PhonicsCardGame />
      ) : (
        <div className="space-y-6">
          {/* Grade Selector Tabs */}
          <div className="flex items-center justify-center gap-3 bg-white p-2.5 rounded-3xl border-2 border-purple-200 shadow-sm">
            {[
              { id: 'grade1', label: '초등 1학년: Starfall 사운드 팝 🎈' },
              { id: 'grade2', label: '초등 2학년: Duolingo 단어 빌더 🧩' },
              { id: 'grade3', label: '초등 3학년: Khan Kids 스토리 롤플레이 📖' },
            ].map((g) => {
              const isSelected = activeGrade === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGrade(g.id as any)}
                  className={`flex-1 min-h-[50px] py-2 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 border-2 border-purple-700 scale-102'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Program Area according to Grade */}
          {showStarDust && <StarDustFX />}

          {/* 1️⃣ Grade 1: Starfall Style Phonics Sound Pop */}
          {activeGrade === 'grade1' && (
            <div className="card-pastel bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6 sm:p-8 rounded-3xl border-3 border-pink-200 space-y-6 shadow-cute">
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    🎈 Starfall 스타일: 파닉스 사운드 팡팡!
                    <Sparkles className="w-5 h-5 text-pink-500 fill-pink-300 animate-bounce" />
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold mt-1">
                    알파벳 풍선을 클릭하여 음가 소리를 팡팡 터뜨리며 체득해요!
                  </p>
                </div>
                <div className="bg-pink-500 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-sm">
                  점수: {popScore}점
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {GRADE1_POP_DATA.map((item) => (
                  <motion.button
                    key={item.letter}
                    whileHover={{ scale: 1.06, rotate: 3 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handlePopClick(item)}
                    className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 shadow-cute transition-all cursor-pointer ${item.bg}`}
                  >
                    <span className="text-5xl">{item.icon}</span>
                    <span className="text-3xl font-mono font-black text-slate-800">{item.letter}</span>
                    <span className="text-xs font-black text-purple-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {item.sound}
                    </span>
                    <span className="text-xs font-extrabold text-slate-600">{item.word}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* 2️⃣ Grade 2: Duolingo ABC Style Word Builder */}
          {activeGrade === 'grade2' && (
            <div className="card-pastel bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 sm:p-8 rounded-3xl border-3 border-amber-200 space-y-6 shadow-cute">
              <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    🧩 Duolingo ABC 스타일: 파닉스 단어 조립 빌더
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-bounce" />
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold mt-1">
                    아래 알파벳 블록을 클릭하여 그림에 맞는 영단어를 완성하세요!
                  </p>
                </div>
                <div className="bg-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-sm">
                  점수: {g2Score}점
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 bg-white/90 p-6 rounded-3xl border-2 border-amber-100 shadow-inner">
                <span className="text-6xl">{currentG2.icon}</span>
                <span className="text-base font-extrabold text-slate-700">({currentG2.translation})</span>

                {/* Built Letters Slot */}
                <div className="flex gap-2 min-h-[56px]">
                  {currentG2.targetWord.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 bg-amber-100 border-2 border-amber-300 rounded-2xl flex items-center justify-center text-2xl font-mono font-black text-slate-800 shadow-sm"
                    >
                      {builtLetters[idx] || ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Letter Tiles Selector */}
              <div className="flex justify-center gap-3">
                {currentG2.letters.map((letTile, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleTileClick(letTile)}
                    className="w-14 h-14 bg-amber-400 hover:bg-amber-500 text-slate-900 border-2 border-amber-500 rounded-2xl text-xl font-mono font-black shadow-md flex items-center justify-center"
                  >
                    {letTile}
                  </motion.button>
                ))}
                <button
                  onClick={() => setBuiltLetters([])}
                  className="px-3 py-2 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-2xl border border-slate-200"
                >
                  리셋
                </button>
              </div>
            </div>
          )}

          {/* 3️⃣ Grade 3: Khan Kids Style Storybook Role-play */}
          {activeGrade === 'grade3' && (
            <div className="card-pastel bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 sm:p-8 rounded-3xl border-3 border-emerald-200 space-y-6 shadow-cute">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    📖 Khan Kids 스타일: 실생활 그림 스토리북 & 롤플레이
                    <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-300 animate-bounce" />
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold mt-1">
                    그림책 속 문장을 원어민 발음으로 듣고 마이크로 자신 있게 읽어보세요!
                  </p>
                </div>
                <button
                  onClick={() => setG3Index((prev) => (prev + 1) % GRADE3_STORY_DATA.length)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-1"
                >
                  <span>다음 스토리</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/90 border-2 border-emerald-100 p-6 rounded-3xl space-y-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{currentG3.icon}</span>
                  <div>
                    <h4 className="font-black text-lg text-slate-800">{currentG3.title}</h4>
                    <p className="text-xs text-emerald-700 font-bold">{currentG3.scene}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <p className="text-lg font-black text-slate-800">"{currentG3.englishText}"</p>
                  <p className="text-xs font-bold text-slate-500">({currentG3.translation})</p>
                </div>

                {sttFeedback && (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300 animate-pulse">
                    {sttFeedback}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      playSound('click');
                      speakText(currentG3.englishText, 'en-US');
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>원어민 읽기 듣기</span>
                  </button>

                  <button
                    onClick={handleG3STT}
                    disabled={isListening}
                    className={`flex-1 py-3 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md ${
                      isListening ? 'bg-rose-500 animate-bounce' : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isListening ? '듣고 있어요...' : '따라 읽기 챌린지 🎤'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standard AlphabetBoard Fallback Viewer */}
          <div className="pt-4 border-t border-purple-100">
            <AlphabetBoard />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhonicsModule;
