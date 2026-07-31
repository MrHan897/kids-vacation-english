import React, { useState, useEffect } from 'react';
import { QUIZ_DATA } from '../../data/quizData';
import { QuizCategory, QuizQuestion, ProgressState } from '../../types';
import { playSound, speakText } from '../../services/audio';
import { addSticker, getLearningProgress, saveLearningProgress } from '../../services/storage';
import { generateDynamicQuizQuestion } from '../../services/pcgEngine';
import { CategorySelector } from './CategorySelector';
import { QuizCard } from './QuizCard';
import { Award, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';

export const QuizModule: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuizCategory>('feelings');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(120);
  const [isCategoryCompleted, setIsCategoryCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressState>(() => getLearningProgress());

  // [요청 사항 2 & 3] 학년 맞춤형 동적 무한 문제 생성기 (Dynamic PCG Engine) 바인딩
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion>(() => {
    const categoryQuizzes = QUIZ_DATA.filter((q) => q.category === 'feelings');
    return generateDynamicQuizQuestion(categoryQuizzes, QUIZ_DATA);
  });

  useEffect(() => {
    setProgress(getLearningProgress());
  }, []);

  const handleCategoryChange = (cat: QuizCategory) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCategoryCompleted(false);

    // 새 카테고리의 동적 퀴즈 및 스마트 오답 셔플 생성
    const categoryQuizzes = QUIZ_DATA.filter((q) => q.category === cat);
    setCurrentQuiz(generateDynamicQuizQuestion(categoryQuizzes, QUIZ_DATA));
  };

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const [comboStreak, setComboStreak] = useState<number>(0);

  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentQuiz || isSubmitted) return;

    setIsSubmitted(true);
    if (selectedOption === currentQuiz.correctAnswer) {
      playSound('success');
      setScore((prev) => prev + 1);
      setUserCoins((prev) => prev + 10);

      // Increase Combo Streak
      const nextCombo = comboStreak + 1;
      setComboStreak(nextCombo);

      if (nextCombo === 3) {
        playSound('reward');
        addSticker({
          id: `stk-combo-${Date.now()}`,
          name: '🔥 3연속 회화 콤보',
          icon: '🔥',
          description: '영어 회화 대화 3문제를 연속으로 완벽하게 맞혔어요!',
          category: 'crown',
          unlockedAt: new Date().toISOString(),
        });
      }

      if (currentQuiz.englishText) {
        speakText(currentQuiz.englishText, 'en-US');
      }
    } else {
      playSound('click');
      setComboStreak(0);
    }
  };

  const categoryQuizzes = QUIZ_DATA.filter((q) => q.category === activeCategory);

  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex < categoryQuizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);

      // [요청 사항 3] 무작위 다음 문제 및 스마트 셔플 갱신
      setCurrentQuiz(generateDynamicQuizQuestion(categoryQuizzes, QUIZ_DATA));
    } else {
      setIsCategoryCompleted(true);
      playSound('reward');

      const categoryNames: Record<QuizCategory, string> = {
        feelings: '기분과 안부',
        greetings: '일상 인사',
        animals: '동물 이름',
        colors: '색상과 느낌',
      };
      const catName = categoryNames[activeCategory] || activeCategory;

      addSticker({
        id: `stk-quiz-${activeCategory}-${Date.now()}`,
        name: `💬 ${catName} 완주`,
        icon: '💯',
        description: `${catName} 회화 대화 퀴즈 완주 성공!`,
        category: 'trophy',
        unlockedAt: new Date().toISOString(),
      });

      const currentProgress = getLearningProgress();
      const updatedProgress: ProgressState = {
        ...currentProgress,
        quizzesCompleted: {
          ...currentProgress.quizzesCompleted,
          [activeCategory]: (currentProgress.quizzesCompleted?.[activeCategory] || 0) + 1,
        },
        totalQuizzesTaken: (currentProgress.totalQuizzesTaken || 0) + 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      saveLearningProgress(updatedProgress);
      setProgress(updatedProgress);
    }
  };

  const handleRestartQuiz = () => {
    playSound('click');
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCategoryCompleted(false);
    setCurrentQuiz(generateDynamicQuizQuestion(categoryQuizzes, QUIZ_DATA));
  };

  return (
    <div data-testid="quiz-module" className="space-y-6 max-w-2xl mx-auto">
      {/* Top Messenger Title Header */}
      <div className="card-pastel bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-purple-400">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
            <MessageSquare className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>💬 3학년 전용: 필수 실생활 영어 회화</span>
            </h2>
            <p className="text-xs text-purple-100 font-bold mt-0.5">
              상대방 캐릭터의 질문을 듣고 알맞은 회화 답변을 주고받아보세요!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div data-testid="quiz-score" className="flex items-center gap-2 bg-white/90 text-slate-800 px-4 py-2 rounded-2xl font-black text-xs shadow-md border border-white">
            <Award className="w-4 h-4 text-amber-500" />
            <span>점수: <strong className="text-purple-700 text-sm font-black">{score}</strong></span>
          </div>
          <div className="flex items-center gap-1 bg-amber-400 text-slate-900 px-3 py-2 rounded-2xl font-black text-xs shadow-md border border-amber-300 animate-pulse">
            <span>🪙 {userCoins}P</span>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />

      {/* Quiz Display or Completion Card */}
      {isCategoryCompleted ? (
        <div className="card-pastel max-w-xl mx-auto text-center p-8 bg-gradient-to-b from-purple-50 via-white to-indigo-50 border-4 border-purple-300 rounded-3xl shadow-xl space-y-4">
          <div className="text-6xl animate-bounce">💬 🏆 🐰</div>
          <h3 className="text-2xl font-black text-purple-950">대단해요! 회화 대화방 완주!</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            {activeCategory.toUpperCase()} 카테고리 실생활 영어 대화를 성공적으로 끝마쳤어요!
            <br />
            칭찬 스티커와 코인이 적립되었습니다! 🌟
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRestartQuiz}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 대화하기</span>
            </button>
          </div>
        </div>
      ) : (
        currentQuiz && (
          <QuizCard
            question={currentQuiz}
            currentIndex={currentIndex}
            totalQuestions={categoryQuizzes.length}
            selectedOption={selectedOption}
            isSubmitted={isSubmitted}
            isLastQuestion={currentIndex === categoryQuizzes.length - 1}
            onSelectOption={handleOptionSelect}
            onCheckAnswer={handleCheckAnswer}
            onNextQuestion={handleNextQuestion}
          />
        )
      )}
    </div>
  );
};

export default QuizModule;

