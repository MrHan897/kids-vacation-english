import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import { speakText, playSound } from '../../services/audio';
import { Volume2, Mic, MicOff, CheckCircle2, XCircle, Sparkles, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  isSubmitted: boolean;
  isLastQuestion: boolean;
  onSelectOption: (optionIndex: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  isSubmitted,
  isLastQuestion,
  onSelectOption,
  onCheckAnswer,
  onNextQuestion,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [shake, setShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlyingCoin, setShowFlyingCoin] = useState(false);
  const [userChatBubble, setUserChatBubble] = useState<string | null>(null);

  useEffect(() => {
    // Auto-speak English prompt when question changes
    if (question.englishText) {
      speakText(question.englishText, 'en-US');
    }
    setUserChatBubble(null);
    setShowConfetti(false);
    setShowFlyingCoin(false);
  }, [question]);

  const handleSpeakPrompt = () => {
    playSound('click');
    if (question.englishText) {
      speakText(question.englishText, 'en-US');
    }
  };

  // Web Speech API (STT Speech Recognition)
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. 모바일 크롬 브라우저를 이용해주세요!');
      return;
    }

    playSound('click');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setSpeechText('듣고 있어요... 🎤');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSpeechText(`"${transcript}"`);
      setIsListening(false);

      // Match transcript against options
      const matchedIdx = question.options.findIndex((opt) => {
        const cleanOpt = opt.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().trim();
        const cleanTrans = transcript.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().trim();
        return cleanTrans.includes(cleanOpt) || cleanOpt.includes(cleanTrans);
      });

      if (matchedIdx !== -1) {
        handleOptionClick(matchedIdx);
      } else {
        setShake(true);
        playSound('click');
        setTimeout(() => setShake(false), 600);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpeechText('음성을 인식하지 못했어요. 마이크를 대고 다시 말씀해주세요!');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    onSelectOption(idx);
    const selectedText = question.options[idx];
    setUserChatBubble(selectedText);

    const isCorrect = idx === question.correctAnswer;
    if (isCorrect) {
      setShowConfetti(true);
      setShowFlyingCoin(true);
      playSound('success');
    } else {
      setShake(true);
      playSound('click');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto">
      {/* Flying Coin Trajectory Animation */}
      <AnimatePresence>
        {showFlyingCoin && (
          <motion.div
            initial={{ y: 200, x: 0, scale: 1, opacity: 1 }}
            animate={{ y: -350, x: 120, scale: [1, 1.8, 0.4], opacity: [1, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed z-[9999] pointer-events-none text-4xl font-black text-amber-500 drop-shadow-lg flex items-center gap-1"
            style={{ left: '45%', bottom: '30%' }}
          >
            <span>🪙</span>
            <span className="text-xl text-amber-600 font-black">+10P</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Explosion & Excellent Banner Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-amber-400 text-slate-900 font-black text-2xl sm:text-3xl px-6 py-3 rounded-full shadow-2xl border-4 border-white flex items-center gap-2 animate-bounce"
            >
              <span>✨ Excellent! ⭐</span>
            </motion.div>

            {/* Falling Confetti Particles */}
            <div className="absolute inset-0 flex justify-around overflow-hidden">
              {['🎉', '⭐', '✨', '🎈', '🎊', '💮', '🥳'].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -40, opacity: 1, rotate: 0 }}
                  animate={{ y: 400, opacity: 0, rotate: 360 }}
                  transition={{ duration: 2.2, delay: i * 0.15, ease: 'easeOut' }}
                  className="text-3xl"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Container Card (Shake Animation on Error) */}
      <motion.div
        animate={shake ? { x: [-12, 12, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="card-pastel bg-[#f7f8fa] p-5 sm:p-6 rounded-[32px] border-4 border-purple-200 shadow-xl space-y-4"
      >
        {/* Header Indicator */}
        <div className="flex items-center justify-between text-xs font-black text-slate-500 border-b border-purple-100 pb-3">
          <span className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-300">
            💬 회화 대화방 ({currentIndex + 1} / {totalQuestions})
          </span>
          <span className="text-purple-600 font-extrabold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 3학년 전용 실생활 영어
          </span>
        </div>

        {/* [요청 사항 1] 카카오톡 / 듀오링고 모바일 메신저 Chat Room */}
        <div className="bg-white p-4 rounded-3xl border-2 border-purple-100 min-h-[220px] flex flex-col justify-between space-y-4 shadow-inner">
          
          {/* Left Chat Bubble: Rabbit Character Speaker */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-2xl shrink-0 shadow-xs animate-bounce">
              🐰
            </div>
            <div className="space-y-1 max-w-[80%]">
              <div className="text-[11px] font-black text-purple-700">마법 토끼 (기분과 안부 묻기)</div>
              <div className="bg-purple-50 text-slate-800 font-extrabold text-sm sm:text-base p-3.5 rounded-2xl rounded-tl-none border-2 border-purple-200 shadow-2xs flex items-center justify-between gap-3">
                <div>
                  <div className="text-base sm:text-lg text-purple-950 font-black">
                    "{question.englishText || question.question}"
                  </div>
                  <div className="text-xs text-slate-500 font-bold mt-0.5">
                    ({question.question})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSpeakPrompt}
                  className="p-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-md active:scale-90 transition-all shrink-0"
                  title="영어로 듣기 (TTS)"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Chat Bubble: User Selection Animation */}
          <AnimatePresence>
            {userChatBubble && (
              <motion.div
                initial={{ x: 60, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35, ease: 'backOut' }}
                className="self-end flex items-end gap-2 max-w-[80%]"
              >
                <div className="bg-amber-300 text-slate-900 font-black text-sm sm:text-base p-3.5 rounded-2xl rounded-tr-none border-2 border-amber-400 shadow-md">
                  <span>{userChatBubble}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500">
                  나
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* [요청 사항 2] Web Speech API STT 마이크 음성 인식 버튼 */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <button
            type="button"
            onClick={startSpeechRecognition}
            disabled={isSubmitted}
            className={`px-6 py-3 rounded-full font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-md transition-all active:scale-95 border-2 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-200'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-600 hover:from-purple-600 hover:to-indigo-600'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? '듣고 있어요... 영어로 말해보세요!' : '🎤 마이크로 영어 직접 말하기'}</span>
          </button>
          {speechText && (
            <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {speechText}
            </span>
          )}
        </div>

        {/* [요청 사항 1] 3개 답변 칩(Chips) 버튼 선택 영역 */}
        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500 mb-1 flex items-center gap-1">
            💬 알맞은 회화 대사 선택하기:
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === question.correctAnswer;

              let chipStyle = 'bg-white border-slate-200 text-slate-800 hover:border-purple-300 hover:bg-purple-50/40';
              if (isSubmitted) {
                if (isCorrect) chipStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black shadow-md scale-102';
                else if (isSelected) chipStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-black';
              } else if (isSelected) {
                chipStyle = 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-md scale-102';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  data-testid="quiz-option"
                  onClick={() => handleOptionClick(idx)}
                  disabled={isSubmitted}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between font-bold text-sm sm:text-base active:scale-98 ${chipStyle}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-mono font-black shrink-0 border border-slate-200">
                      {idx + 1}
                    </span>
                    <span>{option}</span>
                  </span>
                  {isSubmitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Next & Check Action Controls */}
        <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-bold">
            {shake && <span className="text-rose-500 animate-bounce block">😅 다시 한번 생각해보세요!</span>}
            {isSubmitted && selectedOption === question.correctAnswer && (
              <span className="text-emerald-600 font-black block">🎉 정답입니다! 10코인을 획득했어요!</span>
            )}
          </div>

          <div className="flex justify-end">
            {!isSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={onCheckAnswer}
                className={`px-6 py-2.5 rounded-full text-white font-black text-xs shadow-md transition-all ${
                  selectedOption !== null
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                정답 확인! ✨
              </button>
            ) : isLastQuestion ? (
              <button
                type="button"
                data-testid="complete-quiz-btn"
                onClick={onNextQuestion}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md animate-pulse active:scale-95"
              >
                회화 대화 완주 🏆
              </button>
            ) : (
              <button
                type="button"
                data-testid="quiz-next-btn"
                onClick={onNextQuestion}
                className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md active:scale-95"
              >
                다음 대화 ➡️
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

