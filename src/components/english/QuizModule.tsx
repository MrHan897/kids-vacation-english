import React, { useState, useEffect } from 'react';
import { QUIZ_DATA } from '../../data/quizData';
import { QuizCategory, QuizQuestion, ProgressState } from '../../types';
import { playSound, speakText } from '../../services/audio';
import { addSticker, getLearningProgress, saveLearningProgress } from '../../services/storage';
import { CategorySelector } from './CategorySelector';
import { QuizCard } from './QuizCard';
import { Award, Sparkles, RotateCcw } from 'lucide-react';

export const QuizModule: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuizCategory>('feelings');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCategoryCompleted, setIsCategoryCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressState>(() => getLearningProgress());

  const categoryQuizzes = QUIZ_DATA.filter((q) => q.category === activeCategory);
  const currentQuiz: QuizQuestion | undefined = categoryQuizzes[currentIndex] || categoryQuizzes[0];

  useEffect(() => {
    setProgress(getLearningProgress());
  }, []);

  const handleCategoryChange = (cat: QuizCategory) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCategoryCompleted(false);
  };

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    playSound('click');
    setSelectedOption(idx);
  };

  const [comboStreak, setComboStreak] = useState<number>(0);
  const [showRewardToast, setShowRewardToast] = useState<string | null>(null);

  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentQuiz || isSubmitted) return;

    setIsSubmitted(true);
    if (selectedOption === currentQuiz.correctAnswer) {
      playSound('success');
      setScore((prev) => prev + 1);

      // Increase Combo Streak
      const nextCombo = comboStreak + 1;
      setComboStreak(nextCombo);

      // Check 3-Combo Streak Bonus Mission Reward
      if (nextCombo === 3) {
        playSound('reward');
        addSticker({
          id: `stk-combo-${Date.now()}`,
          name: '🔥 3연속 퍼펙트 콤보',
          icon: '🔥',
          description: '3문제를 연속으로 올바르게 맞혔어요!',
          category: 'crown',
          unlockedAt: new Date().toISOString(),
        });
        setShowRewardToast('🔥 3연속 퍼펙트 콤보 달성! [퍼펙트 스티커] 획득!');
        setTimeout(() => setShowRewardToast(null), 4000);
      }

      if (currentQuiz.audioPrompt) {
        speakText(currentQuiz.audioPrompt, 'en-US');
      }
    } else {
      playSound('click');
      setComboStreak(0); // Reset combo streak on incorrect answer
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex < categoryQuizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Completed category 5-quiz round set mission
      setIsCategoryCompleted(true);
      playSound('reward');

      // 1. Award Set Mission Completion Sticker (Only given upon set completion, not per single question)
      const categoryNames: Record<QuizCategory, string> = {
        feelings: '기분 표현',
        greetings: '영어 인사',
        animals: '동물 단어',
        colors: '색상 표현',
      };
      const catName = categoryNames[activeCategory] || activeCategory;

      addSticker({
        id: `stk-quiz-${activeCategory}-${Date.now()}`,
        name: `🎯 ${catName} 5문제 완주`,
        icon: '💯',
        description: `${catName} 퀴즈 5문제 완주 미션을 성공했어요!`,
        category: 'trophy',
        unlockedAt: new Date().toISOString(),
      });

      // 2. Save Learning Progress
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
  };

  return (
    <div data-testid="quiz-module" className="space-y-6">
      {/* Top Banner & Total Score Header */}
      <div className="card-pastel bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 p-5 rounded-3xl border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <h2 className="text-xl font-bold text-slate-800">초등 1학년 맞춤 영어 놀이 퀴즈</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">원하는 카테고리를 선택하고 신나게 영어 문제를 풀어보세요!</p>
        </div>

        <div className="flex items-center gap-3">
          <div data-testid="quiz-score" className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-emerald-200 shadow-sm">
            <Award className="w-5 h-5 text-amber-500" />
            <div className="text-xs font-bold text-slate-700">
              맞힌 점수: <span className="text-emerald-600 text-sm font-extrabold">{score}</span> 점
            </div>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />

      {/* Quiz Display or Completion Card */}
      {isCategoryCompleted ? (
        <div className="card-pastel max-w-xl mx-auto text-center p-8 bg-gradient-to-b from-emerald-50 via-white to-teal-50 border-2 border-emerald-300 rounded-3xl shadow-lg space-y-4">
          <div className="text-6xl animate-bounce">🏆</div>
          <h3 className="text-2xl font-extrabold text-emerald-900">축하합니다! 퀴즈 완주!</h3>
          <p className="text-sm text-slate-600 font-medium">
            {activeCategory.toUpperCase()} 카테고리 퀴즈를 모두 풀었습니다!
            <br />
            칭찬 스티커가 수놓아졌어요 🌟
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRestartQuiz}
              className="btn-cute bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-bold text-sm flex items-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 풀기</span>
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
