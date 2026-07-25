import React, { useState } from 'react';
import { GradeLevel, MathQuestion } from '../../types';
import { MATH_QUESTIONS } from '../../data/mathData';
import { playSound, speakText } from '../../services/audio';
import { StarDustFX } from '../rewards/PraiseAnimation';
import { Calculator, Award, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathModuleProps {
  grade?: GradeLevel;
  onEarnSticker?: () => void;
}

export const MathModule: React.FC<MathModuleProps> = ({ grade = 'grade1', onEarnSticker }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showStarDust, setShowStarDust] = useState<boolean>(false);

  const currentQuestions = MATH_QUESTIONS.filter((q) => q.grade === grade);
  const currentQuestion: MathQuestion = currentQuestions[currentIndex] || currentQuestions[0];



  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const correct = optionIdx === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSound('reward');
      speakText('정답이에요! 정말 똑똑하네요!', 'ko-KR');
      setScore((prev) => prev + 10);
      setShowStarDust(true);
      if (onEarnSticker) onEarnSticker();
      setTimeout(() => setShowStarDust(false), 2500);
    } else {
      playSound('click');
      speakText('아쉬워요! 설명을 보고 다시 도전해보세요!', 'ko-KR');
    }
  };

  const handleNext = () => {
    playSound('click');
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      speakText('모든 수학 문제를 풀었어요! 멋져요!', 'ko-KR');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Module Title Header */}
      <div className="card-pastel bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-cute">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-400 text-white flex items-center justify-center text-3xl shadow-md border-2 border-amber-300">
            🔢
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              신나는 어린이 수학 탐험
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-bounce" />
            </h2>
            <p className="text-xs text-slate-600 font-bold mt-1">
              학년을 선택하고 재미있는 연산 & 도형 퀴즈를 풀며 스티커를 모아보세요!
            </p>
          </div>
        </div>

        {/* Score Counter Badge */}
        <div className="flex items-center gap-2 bg-amber-400 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-md border-2 border-amber-300 shrink-0">
          <Award className="w-5 h-5 text-yellow-100" />
          <span>수학 점수: {score}점</span>
        </div>
      </div>

      {/* Grade Title Indicator Badge */}
      <div className="flex items-center justify-between bg-white p-3.5 px-5 rounded-3xl border-2 border-amber-200 shadow-sm">
        <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-amber-600" />
          <span>
            {grade === 'grade1'
              ? '🐣 1학년: 기초 수 세기 & 10 이하 덧셈/뺄셈'
              : grade === 'grade2'
              ? '🐥 2학년: 두 자리 덧셈/뺄셈 & 구구단 2~9단'
              : '🦅 3학년: 세 자리 연산, 입체도형 & 기초 분수 개념'}
          </span>
        </span>
        <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          프로필 학년 자동 맞춤 🎯
        </span>
      </div>

      {/* Main Question Card Area */}
      <div className="relative card-pastel bg-white border-3 border-amber-300 p-6 sm:p-8 space-y-6 shadow-cute overflow-hidden">
        {showStarDust && <StarDustFX />}

        {/* Question Header & Counter */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>문제 {currentIndex + 1} / {currentQuestions.length}</span>
          </div>

          <span className="text-3xl">{currentQuestion.icon}</span>
        </div>

        {/* Question Text */}
        <div className="bg-amber-50/80 border-2 border-amber-200 p-6 rounded-3xl text-center shadow-inner">
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === currentQuestion.correctAnswer;

            let btnStyle = 'bg-white border-amber-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black ring-4 ring-emerald-200 shadow-lg';
              } else if (isThisSelected) {
                btnStyle = 'bg-rose-500 border-rose-600 text-white font-black ring-4 ring-rose-200';
              } else {
                btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
                className={`min-h-[64px] p-4 rounded-2xl border-3 text-base sm:text-lg font-bold text-left transition-all flex items-center justify-between shadow-sm ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 className="w-6 h-6 text-white shrink-0" />}
                {isAnswered && isThisSelected && !isThisCorrect && <XCircle className="w-6 h-6 text-white shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation & Next Button Feedback Area */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${isCorrect ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                  {isCorrect ? '🎉' : '💡'}
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base">
                    {isCorrect ? '정답입니다! ⭐ +1 스티커 획득!' : '다시 확인해볼까요?'}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="btn-finger-64 w-full sm:w-auto px-6 py-3 bg-slate-800 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0 border-2 border-slate-700 hover:bg-slate-900"
              >
                <span>다음 문제</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
