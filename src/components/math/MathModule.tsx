import React, { useState } from 'react';
import { GradeLevel } from '../../types';
import { playSound, speakText } from '../../services/audio';
import { StarDustFX } from '../rewards/PraiseAnimation';
import { Calculator, Award, CheckCircle2, XCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathModuleProps {
  grade?: GradeLevel;
  onEarnSticker?: () => void;
}

export interface GeneratedQuestion {
  question: string;
  options: number[];
  correctAnswerIndex: number;
  explanation: string;
  icon: string;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// [요청 사항 1 & 2] 학년별 무작위 동적 문제 생성기 & 스마트 오답 셔플 알고리즘
export function generateMathProblem(isChallengeMode: boolean): GeneratedQuestion {
  let questionStr = '';
  let answer = 0;
  let explanationStr = '';
  let iconEmoji = '🔢';

  if (!isChallengeMode) {
    // 2학년 기본 모드: 덧셈(10~99), 뺄셈(10~99 양수), 곱셈(2~9단)
    const type = getRandomInt(1, 3);
    if (type === 1) {
      // 덧셈
      const num1 = getRandomInt(10, 99);
      const num2 = getRandomInt(10, 99);
      answer = num1 + num2;
      questionStr = `${num1} + ${num2} = ?`;
      explanationStr = `${num1}에 ${num2}를 더하면 ${answer}가 됩니다! ➕`;
      iconEmoji = '➕';
    } else if (type === 2) {
      // 뺄셈 (큰 수 - 작은 수 -> 양수 보장)
      const a = getRandomInt(10, 99);
      const b = getRandomInt(10, 99);
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      answer = big - small;
      questionStr = `${big} - ${small} = ?`;
      explanationStr = `${big}에서 ${small}을 빼면 ${answer}가 남습니다! ➖`;
      iconEmoji = '➖';
    } else {
      // 곱셈 구구단 (2~9단)
      const dan = getRandomInt(2, 9);
      const num = getRandomInt(1, 9);
      answer = dan * num;
      questionStr = `${dan} × ${num} = ?`;
      explanationStr = `${dan}단 구구단: ${dan} 곱하기 ${num}은 ${answer}입니다! ✖️`;
      iconEmoji = '✖️';
    }
  } else {
    // 3학년 챌린지 모드: 나누어 떨어지는 나눗셈, 3자리 수 덧셈/뺄셈
    const type = getRandomInt(1, 3);
    if (type === 1) {
      // 나눗셈 (나누어 떨어지도록 A * B = C -> C ÷ A = B)
      const a = getRandomInt(2, 9);
      const b = getRandomInt(2, 9);
      const c = a * b;
      answer = b;
      questionStr = `${c} ÷ ${a} = ?`;
      explanationStr = `${a} × ${b} = ${c} 이므로, ${c} ÷ ${a} = ${b} 입니다! ➗`;
      iconEmoji = '➗';
    } else if (type === 2) {
      // 3자리 수 덧셈
      const num1 = getRandomInt(100, 999);
      const num2 = getRandomInt(100, 999);
      answer = num1 + num2;
      questionStr = `${num1} + ${num2} = ?`;
      explanationStr = `${num1}과 ${num2}의 합은 ${answer}입니다! 🚀`;
      iconEmoji = '🔥';
    } else {
      // 3자리 수 뺄셈
      const a = getRandomInt(100, 999);
      const b = getRandomInt(100, 999);
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      answer = big - small;
      questionStr = `${big} - ${small} = ?`;
      explanationStr = `${big}에서 ${small}을 뺀 결과는 ${answer}입니다! 🎯`;
      iconEmoji = '🎯';
    }
  }

  // [요청 사항 2] 스마트 오답 (Distractor) 생성 (+1, -1, +10, -5 등 정답 근처 중복 없는 값)
  const distractorSet = new Set<number>();
  const potentialOffsets = shuffleArray([1, -1, 10, -5, 2, -2, 5, -10, 3, -3, 4, -4, 15, -15]);

  for (const offset of potentialOffsets) {
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer) {
      distractorSet.add(candidate);
    }
    if (distractorSet.size >= 3) break;
  }

  let step = 1;
  while (distractorSet.size < 3) {
    const candidate = answer + step * 7;
    if (candidate > 0 && candidate !== answer) {
      distractorSet.add(candidate);
    }
    step++;
  }

  const distractors = Array.from(distractorSet).slice(0, 3);
  const options = shuffleArray([answer, ...distractors]);
  const correctAnswerIndex = options.indexOf(answer);

  return {
    question: questionStr,
    options,
    correctAnswerIndex,
    explanation: explanationStr,
    icon: iconEmoji,
  };
}

export const MathModule: React.FC<MathModuleProps> = ({ grade = 'grade1', onEarnSticker }) => {
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion>(() =>
    generateMathProblem(false)
  );
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showStarDust, setShowStarDust] = useState<boolean>(false);
  const [comboStreak, setComboStreak] = useState<number>(0);

  // [요청 사항 1 & 3] +1학년 챌린지 모드 전환 시 동적 무한 문제 즉시 새로 생성
  const handleToggleChallenge = () => {
    playSound('reward');
    const nextChallenge = !isChallengeMode;
    setIsChallengeMode(nextChallenge);
    setCurrentQuestion(generateMathProblem(nextChallenge));
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setComboStreak(0);

    const levelText = nextChallenge
      ? '🔥 3학년 챌린지 모드: 나눗셈 & 3자리 수 연산 무한 도전!'
      : '🎯 2학년 기본 모드: 두 자릿수 덧셈/뺄셈 & 구구단 탐험!';
    speakText(levelText, 'ko-KR');
  };

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const correct = optionIdx === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      playSound('reward');
      speakText('정답이에요! 정말 똑똑하네요!', 'ko-KR');
      setScore((prev) => prev + (isChallengeMode ? 20 : 10));
      setShowStarDust(true);

      const nextCombo = comboStreak + 1;
      setComboStreak(nextCombo);

      // 3-Combo Streak Bonus Sticker
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

  // [요청 사항 3] 무한 플레이: '다음 문제' 버튼 클릭 시 동적 새 문제 생성 및 화면 갱신
  const handleNext = () => {
    playSound('click');
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setQuestionCount((prev) => prev + 1);
    setCurrentQuestion(generateMathProblem(isChallengeMode));
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
              무한으로 생성되는 연산 퀴즈를 풀며 스티커와 칭찬 코인을 모아보세요!
            </p>
          </div>
        </div>

        {/* Score Counter Badge */}
        <div className="flex items-center gap-2 bg-amber-400 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-md border-2 border-amber-300 shrink-0">
          <Award className="w-5 h-5 text-yellow-100" />
          <span>수학 점수: {score}점</span>
        </div>
      </div>

      {/* Grade Title & +1학년 챌린지 모드 버튼 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3.5 px-5 rounded-3xl border-2 border-amber-200 shadow-sm gap-3">
        <span className="text-xs sm:text-sm font-black text-amber-900 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-amber-600" />
          <span>
            {isChallengeMode
              ? '🔥 3학년 챌린지: 나눗셈 & 3자리 수 연산 무한 문제'
              : '🐥 2학년 기본: 두 자릿수 덧셈/뺄셈 & 구구단 무한 문제'}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {/* 🚀 +1학년 챌린지 모드 토글 버튼 */}
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
            {isChallengeMode ? '🔥 선행학습 챌린지중' : '기본 모드 무한 탐험 🎯'}
          </span>
        </div>
      </div>

      {/* Main Question Card Area */}
      <div className="relative card-pastel bg-white border-3 border-amber-300 p-6 sm:p-8 space-y-6 shadow-cute overflow-hidden">
        {showStarDust && <StarDustFX />}

        {/* Question Header & Counter + Combo Badge */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>무한 챌린지 문제 #{questionCount}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 2번 이상 연속 정답 시 "🔥 2 COMBO!" 뱃지 표시 */}
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

        {/* 2x2 그리드 배열 + 3D 입체 버튼 스타일 */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === currentQuestion.correctAnswerIndex;

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
                <span>다음 무한 문제 도전</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
