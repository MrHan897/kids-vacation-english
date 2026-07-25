import React, { useState } from 'react';
import { PHONICS_DATA } from '../../data/phonicsData';
import { PhonicsCard } from '../../types';
import { speakText, playPhonics, playSound, isSTTSupported, listenAndRecognize } from '../../services/audio';
import { StarDustFX } from '../rewards/PraiseAnimation';
import { Volume2, BookOpen, Mic, Sparkles, CheckCircle2 } from 'lucide-react';

interface AlphabetBoardProps {
  onCardSelect?: (card: PhonicsCard) => void;
}

export const AlphabetBoard: React.FC<AlphabetBoardProps> = ({ onCardSelect }) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [isListening, setIsListening] = useState(false);
  const [sttFeedback, setSttFeedback] = useState<string | null>(null);
  const [showStarDust, setShowStarDust] = useState(false);

  const activeCard = PHONICS_DATA.find((c) => c.letter === selectedLetter) || PHONICS_DATA[0];

  const handleSelect = (card: PhonicsCard) => {
    setSelectedLetter(card.letter);
    setSttFeedback(null);
    playPhonics(card.letter, card.word);
    if (onCardSelect) onCardSelect(card);
  };

  const handleSpeakWord = (word: string) => {
    playSound('click');
    speakText(word, 'en-US');
  };

  const handleSpeakSentence = (sentence: string) => {
    playSound('click');
    speakText(sentence, 'en-US');
  };

  const handleSTTChallenge = () => {
    playSound('click');
    setIsListening(true);
    setSttFeedback('마이크에 대고 크게 말씀해보세요...');

    const stopFn = listenAndRecognize(
      'en-US',
      (res) => {
        setIsListening(false);
        const spoken = res.transcript.trim().toLowerCase();
        const target = activeCard.word.toLowerCase();

        if (spoken.includes(target) || target.includes(spoken)) {
          playSound('success');
          setShowStarDust(true);
          setSttFeedback(`🎉 대단해요! "${res.transcript}" 완벽한 발음입니다! ⭐`);
          setTimeout(() => setShowStarDust(false), 2000);
        } else {
          playSound('click');
          setSttFeedback(`" ${res.transcript} " - 한번 더 도전해볼까요? 💪`);
        }
      },
      (err) => {
        setIsListening(false);
        setSttFeedback(`💡 발음 듣기 버튼을 누르고 따라해봐요! (${err})`);
      }
    );

    setTimeout(() => {
      stopFn();
      setIsListening(false);
    }, 6000);
  };

  return (
    <div className="space-y-6 relative" data-testid="phonics-card-grid">
      {showStarDust && <StarDustFX />}

      {/* Featured Card Viewer */}
      <div className="card-pastel bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 rounded-3xl border-2 border-purple-100 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              onClick={() => handleSelect(activeCard)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center text-4xl sm:text-5xl shadow-cute cursor-pointer transform hover:scale-105 transition-transform border-2 border-white/80 shrink-0 select-none"
              style={{ backgroundColor: activeCard.color }}
            >
              <span>{activeCard.icon}</span>
              <span className="text-xl font-bold text-slate-800 mt-1 font-mono">
                {activeCard.uppercase}{activeCard.lowercase}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">
                  파닉스: {activeCard.phonicsSound}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {activeCard.word}{' '}
                <span className="text-lg font-normal text-slate-500">({activeCard.translation})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                <span>"{activeCard.exampleSentence}"</span>
                <button
                  data-testid="tts-speak-btn"
                  onClick={() => handleSpeakSentence(activeCard.exampleSentence)}
                  className="p-1.5 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded-xl transition-all shrink-0 active:scale-95"
                  title="문장 읽기"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </p>

              {sttFeedback && (
                <div className="text-xs font-bold text-purple-700 bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-200 animate-pulse mt-2">
                  {sttFeedback}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              data-testid="tts-speak-btn"
              onClick={() => handleSpeakWord(activeCard.word)}
              className="flex-1 md:flex-initial btn-cute bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap shadow-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>발음 듣기</span>
            </button>

            {/* STT Speech Recognition Speaking Challenge Button */}
            <button
              type="button"
              onClick={handleSTTChallenge}
              disabled={isListening}
              className={`flex-1 md:flex-initial btn-finger-64 ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{isListening ? '듣고 있어요...' : '말하기 챌린지 🎤'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of A-Z cards */}
      <div className="card-pastel bg-white p-5 rounded-3xl border-2 border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold text-slate-800">알파벳 A ~ Z 파닉스 카드</h3>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2.5">
          {PHONICS_DATA.map((card) => {
            const isSelected = card.letter === selectedLetter;
            return (
              <button
                key={card.id}
                data-testid="phonics-card"
                onClick={() => handleSelect(card)}
                className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center font-bold ${
                  isSelected
                    ? 'border-purple-500 bg-purple-100/70 shadow-cute scale-105 z-10'
                    : 'border-slate-100 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <span className="text-xl sm:text-2xl">{card.icon}</span>
                <span className="text-sm font-mono text-slate-800 mt-1">
                  {card.uppercase}{card.lowercase}
                </span>
                <span className="text-[10px] text-slate-500 font-normal truncate max-w-full">
                  {card.word}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
