import React, { useState } from 'react';
import { GradeLevel } from '../../types';
import { AlphabetBoard } from './AlphabetBoard';
import { PhonicsCardGame } from './PhonicsCardGame';
import { GRADE2_BLENDS, GRADE3_DIALOGUES } from '../../data/phonicsAdvancedData';
import { BookOpen, Gamepad2, Sparkles, Volume2, Mic, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { playSound, speakText, listenAndRecognize } from '../../services/audio';
import { StarDustFX } from '../rewards/PraiseAnimation';
import { motion } from 'framer-motion';

interface PhonicsModuleProps {
  grade?: GradeLevel;
}

import VoiceCrown from './VoiceCrown';

export const PhonicsModule: React.FC<PhonicsModuleProps> = ({ grade = 'grade1' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'game'>('program');

  // Grade 2 Blends State
  const [selectedBlendId, setSelectedBlendId] = useState<string>('b-st');
  const [g2SttFeedback, setG2SttFeedback] = useState<string | null>(null);

  // Grade 3 Dialogue State
  const [g3Index, setG3Index] = useState<number>(0);
  const [selectedReply, setSelectedReply] = useState<number | null>(null);
  const [g3SttFeedback, setG3SttFeedback] = useState<string | null>(null);

  const [showStarDust, setShowStarDust] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const currentBlend = GRADE2_BLENDS.find((b) => b.id === selectedBlendId) || GRADE2_BLENDS[0];
  const currentDialogue = GRADE3_DIALOGUES[g3Index];

  // Grade 2 STT Challenge
  const handleG2STT = () => {
    playSound('click');
    setIsListening(true);
    setG2SttFeedback('마이크에 이중자음 단어를 크게 말씀해보세요...');

    const stopFn = listenAndRecognize(
      'en-US',
      (res) => {
        setIsListening(false);
        playSound('success');
        setShowStarDust(true);
        setG2SttFeedback(`🎉 대단해요! 완벽한 이중자음 발음입니다! ⭐ "${res.transcript}"`);
        setTimeout(() => setShowStarDust(false), 2500);
      },
      (err) => {
        setIsListening(false);
        setG2SttFeedback(`💡 원어민 발음 버튼을 누르고 따라해봐요! (${err})`);
      }
    );

    setTimeout(() => {
      stopFn();
      setIsListening(false);
    }, 6000);
  };

  // Grade 3 Dialogue Reply & STT Challenge
  const handleSelectReply = (idx: number) => {
    setSelectedReply(idx);
    if (idx === currentDialogue.correctReplyIndex) {
      playSound('success');
      setShowStarDust(true);
      speakText(currentDialogue.replyOption[idx], 'en-US');
      setG3SttFeedback('🎉 정답입니다! 마이크로 상대방에게 다시 말해보세요!');
      setTimeout(() => setShowStarDust(false), 2500);
    } else {
      playSound('click');
      setG3SttFeedback('💡 알맞은 대화를 다시 선택해보세요!');
    }
  };

  const handleG3STT = () => {
    if (selectedReply === null) return;
    playSound('click');
    setIsListening(true);
    setG3SttFeedback('마이크로 대사 문장을 따라 읽어보세요...');

    const stopFn = listenAndRecognize(
      'en-US',
      (res) => {
        setIsListening(false);
        playSound('success');
        setShowStarDust(true);
        setG3SttFeedback(`🎉 최고예요! 완벽한 회화 대화 발음입니다! ⭐ "${res.transcript}"`);
        setTimeout(() => setShowStarDust(false), 2500);
      },
      (err) => {
        setIsListening(false);
        setG3SttFeedback(`💡 회화 문장을 듣고 자신 있게 따라해보세요! (${err})`);
      }
    );

    setTimeout(() => {
      stopFn();
      setIsListening(false);
    }, 7000);
  };

  const gradeTitle =
    grade === 'grade1'
      ? '🐣 1학년: A-Z 알파벳 단어 파닉스 프로그램'
      : grade === 'grade2'
      ? '🐥 2학년: 이중자음/이중모음(Sight Words & Blends) 조합 파닉스 시스템'
      : '🦅 3학년: 필수 실생활 영어 회화(Daily Expression & Dialogue) 시스템';

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
          <span>{gradeTitle}</span>
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
          {showStarDust && <StarDustFX />}

          {/* 1️⃣ Grade 1: Standard A-Z Word Phonics */}
          {grade === 'grade1' && (
            <div className="space-y-6">
              <VoiceCrown targetWord="Apple" translation="사과" icon="🍎" />
              <AlphabetBoard />
            </div>
          )}

          {/* 2️⃣ Grade 2: Sight Words & Blends Combination Phonics System */}
          {grade === 'grade2' && (
            <div className="card-pastel bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8 rounded-3xl border-3 border-amber-200 space-y-6 shadow-cute">
              <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    🧩 2학년 전용: 이중자음/이중모음(Sight Words & Blends) 조합 파닉스
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-bounce" />
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold mt-1">
                    단어 대신 2개 이상의 알파벳 소리가 결합하는 Blends 조합을 듣고 연습해요!
                  </p>
                </div>
              </div>

              {/* Blends Grid Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {GRADE2_BLENDS.map((item) => {
                  const isSelected = selectedBlendId === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        playSound('click');
                        setSelectedBlendId(item.id);
                        setG2SttFeedback(null);
                        speakText(`${item.blend}! ${item.sound}! ${item.word}!`, 'en-US');
                      }}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center font-black transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-200 ring-2 ring-amber-300 scale-105 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-lg font-mono font-black text-slate-800 mt-1">{item.blend}</span>
                      <span className="text-[10px] text-amber-900 font-bold">{item.sound}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Current Selected Blend Viewer */}
              <div className="bg-white/90 p-6 rounded-3xl border-2 border-amber-200 space-y-4 shadow-inner">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-white"
                      style={{ backgroundColor: currentBlend.color }}
                    >
                      {currentBlend.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                          이중자음 발음: {currentBlend.sound}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 mt-1">
                        {currentBlend.blend} ➔ {currentBlend.word} <span className="text-sm font-normal text-slate-500">({currentBlend.translation})</span>
                      </h4>
                      <p className="text-xs text-slate-600 font-bold mt-1">
                        "{currentBlend.exampleSentence}"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        playSound('click');
                        speakText(currentBlend.exampleSentence, 'en-US');
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>원어민 예문 듣기</span>
                    </button>

                    <button
                      onClick={handleG2STT}
                      disabled={isListening}
                      className={`flex-1 sm:flex-none px-4 py-3 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm ${
                        isListening ? 'bg-rose-500 animate-bounce' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? '듣고 있어요...' : '말하기 챌린지 🎤'}</span>
                    </button>
                  </div>
                </div>

                {g2SttFeedback && (
                  <div className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-2 rounded-xl border border-amber-300 animate-pulse">
                    {g2SttFeedback}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3️⃣ Grade 3: Daily Expression & Dialogue System */}
          {grade === 'grade3' && (
            <div className="card-pastel bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 sm:p-8 rounded-3xl border-3 border-purple-200 space-y-6 shadow-cute">
              <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    💬 3학년 전용: 필수 실생활 영어 회화 (Daily Expression & Dialogue)
                    <Sparkles className="w-5 h-5 text-purple-500 fill-purple-300 animate-bounce" />
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold mt-1">
                    상대방 캐릭터의 질문을 듣고 알맞은 회화 답변을 선택하여 주고받아보세요!
                  </p>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setSelectedReply(null);
                    setG3SttFeedback(null);
                    setG3Index((prev) => (prev + 1) % GRADE3_DIALOGUES.length);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1"
                >
                  <span>다음 회화 상황</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dialogue Box */}
              <div className="bg-white/90 border-2 border-purple-100 p-6 rounded-3xl space-y-5 shadow-inner">
                {/* Character Question */}
                <div className="flex items-start gap-4 bg-purple-50/90 p-4 rounded-2xl border border-purple-200">
                  <div className="w-12 h-12 rounded-2xl bg-purple-200 flex items-center justify-center text-2xl shrink-0">
                    {currentDialogue.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black text-purple-700">{currentDialogue.speaker} ({currentDialogue.situation})</span>
                    <h4 className="text-lg font-black text-slate-800 mt-0.5">"{currentDialogue.dialogue}"</h4>
                    <p className="text-xs text-slate-500 font-bold">({currentDialogue.translation})</p>
                  </div>
                  <button
                    onClick={() => {
                      playSound('click');
                      speakText(currentDialogue.dialogue, 'en-US');
                    }}
                    className="p-2 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded-xl transition-all shrink-0 ml-auto"
                    title="질문 다시 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Reply Options */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">💬 알맞은 회화 대사 선택하기:</span>
                  {currentDialogue.replyOption.map((reply, idx) => {
                    const isSelected = selectedReply === idx;
                    const isCorrect = idx === currentDialogue.correctReplyIndex;

                    let btnStyle = 'bg-white border-purple-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50';

                    if (selectedReply !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-200';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 border-rose-600 text-white font-black';
                      } else {
                        btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={selectedReply === null ? { scale: 1.01 } : {}}
                        whileTap={selectedReply === null ? { scale: 0.99 } : {}}
                        onClick={() => handleSelectReply(idx)}
                        className={`w-full p-4 rounded-2xl border-2 text-sm sm:text-base font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{reply}</span>
                        {selectedReply !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* STT Roleplay Button when Answered Correctly */}
                {selectedReply === currentDialogue.correctReplyIndex && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-900">
                      <span>🎯 잘하셨어요! 상대방에게 직접 말하기 챌린지에 도전해보세요!</span>
                    </div>

                    <button
                      onClick={handleG3STT}
                      disabled={isListening}
                      className={`w-full sm:w-auto px-5 py-2.5 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md ${
                        isListening ? 'bg-rose-500 animate-bounce' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? '듣고 있어요...' : '회화 대사 말하기 🎤'}</span>
                    </button>
                  </div>
                )}

                {g3SttFeedback && (
                  <div className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-2 rounded-xl border border-purple-300 animate-pulse">
                    {g3SttFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhonicsModule;

