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
  const [comboStreak, setComboStreak] = useState<number>(0);

  // [요청 사항 1] +1학년 챌린지 모드 State
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);

  // 챌린지 모드 활성화 시 학년 레벨 +1단계 업그레이드 (예: 1학년->2학년, 2학년->3학년)
  const effectiveGrade: GradeLevel = isChallengeMode
    ? grade === 'grade1'
      ? 'grade2'
      : 'grade3'
    : grade;

  const currentQuestions = MATH_QUESTIONS.filter((q) => q.grade === effectiveGrade);
  const currentQuestion: MathQuestion = currentQuestions[currentIndex] || currentQuestions[0];

  const handleToggleChallenge = () => {
    playSound('reward');
    const nextChallenge = !isChallengeMode;
    setIsChallengeMode(nextChallenge);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setComboStreak(0);

    const levelText = nextChallenge
      ? grade === 'grade1'
        ? '🔥 2학년 수준: 두 자릿수 덧셈/뺄셈 & 구구단 챌린지!'
        : '🔥 3학년 수준: 나눗셈 & 분수 & 3자리 수 덧셈 챌린지!'
      : '🎯 프로필 학년 수준으로 원복되었습니다.';
    speakText(levelText, 'ko-KR');
  };

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const correct = optionIdx === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSound('reward');
      speakText('정답이에요! 정말 똑똑하네요!', 'ko-KR');
      setScore((prev) => prev + (isChallengeMode ? 20 : 10));
      setShowStarDust(true);

      const nextCombo = comboStreak + 1;
      setComboStreak(nextCombo);

      // Award 3-Combo Streak Bonus Sticker
      if (nextCombo === 3) {
        if (onEarnSticker) onEarnSticker();
      }

      setTimeout(() => setShowStarDust(false), 2500);
    } else {
      playSound('click');
      speakText('아쉬워요! 설명을 보고 다시 도전해보세요!', 'ko-KR');
      setComboStreak(0);
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
      // Completed math set mission! Award Set Sticker
      setCurrentIndex(0);
      setComboStreak(0);
      speakText('수학 완주 미션을 성공했어요! 멋져요!', 'ko-KR');
      if (onEarnSticker) onEarnSticker();
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

      {/* [요청 사항 1] Grade Title & +1학년 챌린지 모드 버튼 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3.5 px-5 rounded-3xl border-2 border-amber-200 shadow-sm gap-3">
        <span className="text-xs sm:text-sm font-black text-amber-900 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-amber-600" />
          <span>
            {effectiveGrade === 'grade1'
              ? '🐣 1학년: 기초 수 세기 & 10 이하 덧셈/뺄셈'
              : effectiveGrade === 'grade2'
              ? '🐥 2학년: 두 자리 덧셈/뺄셈 & 구구단 2~9단'
              : '🔥 3학년 수준: 나눗셈 & 분수 & 3자리 수 덧셈'}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {/* [요청 사항 1] 🚀 +1학년 챌린지 모드 토글 버튼 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleChallenge}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all border-2 flex items-center gap-1.5 shadow-md cursor-pointer ${
              isChallengeMode
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white border-rose-300 ring-2 ring-pink-200 animate-pulse'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-300 hover:from-amber-300 hover:to-orange-300'
            }`}
          >
            <span>🚀 +1학년 챌린지 모드</span>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full text-white">
              {isChallengeMode ? 'ON 🔥' : 'OFF'}
            </span>
          </motion.button>

          <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300 hidden sm:inline-block">
            {isChallengeMode ? '🔥 선행학습 챌린지중' : '프로필 학년 자동 맞춤 🎯'}
          </span>
        </div>
      </div>

      {/* Main Question Card Area */}
      <div className="relative card-pastel bg-white border-3 border-amber-300 p-6 sm:p-8 space-y-6 shadow-cute overflow-hidden">
        {showStarDust && <StarDustFX />}

        {/* Question Header & Counter + [요청 사항 3] Combo Badge */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>문제 {currentIndex + 1} / {currentQuestions.length}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* [요청 사항 3] 2번 이상 연속 정답 시 "🔥 2 COMBO!" 뱃지가 통통 튀며(Bounce) 표시 */}
            {comboStreak >= 2 && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1.1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full border-2 border-yellow-300 shadow-lg animate-bounce flex items-center gap-1"
              >
                <span>🔥 {comboStreak} COMBO!</span>
              </motion.div>
            )}

            <span className="text-3xl">{currentQuestion.icon}</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-amber-50/80 border-2 border-amber-200 p-6 rounded-3xl text-center shadow-inner">
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
            {currentQuestion.question}
          </h3>
        </div>

        {/* [요청 사항 2] 2x2 그리드 배열 + 3D 입체 버튼 스타일 (border-radius: 24px) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === currentQuestion.correctAnswer;

            let btnStyle =
              'bg-white border-3 border-amber-200 text-slate-800 shadow-[0_8px_0_#fde68a] hover:shadow-[0_10px_0_#fcd34d] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_2px_0_#fcd34d]';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle =
                  'bg-emerald-500 border-3 border-emerald-600 text-white font-black shadow-[0_8px_0_#059669] ring-4 ring-emerald-200';
              } else if (isThisSelected) {
                btnStyle =
                  'bg-rose-500 border-3 border-rose-600 text-white font-black shadow-[0_8px_0_#e11d48] ring-4 ring-rose-200';
              } else {
                btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-50 shadow-none';
              }
            }

            return (
              <motion.button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
                className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-[24px] text-lg sm:text-2xl font-black text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${btnStyle}`}
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
