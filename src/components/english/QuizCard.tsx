import React from 'react';
import { QuizQuestion } from '../../types';
import { speakText, playSound } from '../../services/audio';
import { Volume2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

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
  const handleSpeak = (text: string) => {
    playSound('click');
    speakText(text, 'en-US');
  };

  return (
    <div className="card-pastel max-w-xl mx-auto bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 p-6 rounded-3xl border-2 border-emerald-100 shadow-md">
      {/* Header index indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-4">
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
          문제 {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-slate-400 font-medium">초등 1학년 맞춤 기초 영어 퀴즈</span>
      </div>

      {/* Main Question Display */}
      <div className="text-center my-4 space-y-3">
        <div className="text-5xl sm:text-6xl animate-bounce-slow">{question.icon || '❓'}</div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">{question.question}</h3>

        {question.englishText && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-700 text-sm font-semibold shadow-inner border border-slate-200">
            <span>"{question.englishText}"</span>
            <button
              data-testid="tts-speak-btn"
              onClick={() => handleSpeak(question.englishText || '')}
              className="p-1 text-purple-600 hover:text-purple-800 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
              title="영어 발음 듣기"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === question.correctAnswer;

          let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30';
          if (isSubmitted) {
            if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-extrabold shadow-sm';
            else if (isSelected) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900';
          } else if (isSelected) {
            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm scale-102';
          }

          return (
            <button
              key={idx}
              data-testid="quiz-option"
              onClick={() => {
                if (question.audioPrompt && !isSubmitted) {
                  speakText(option, 'en-US');
                }
                onSelectOption(idx);
              }}
              disabled={isSubmitted}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between font-bold text-sm sm:text-base ${btnStyle}`}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-mono shrink-0">
                  {idx + 1}
                </span>
                <span>{option}</span>
              </span>
              {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Footer controls & hints */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div>
          {question.hint && !isSubmitted && (
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> 힌트: {question.hint}
            </span>
          )}

          {isSubmitted && question.explanation && (
            <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              👏 {question.explanation}
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {!isSubmitted ? (
            <button
              disabled={selectedOption === null}
              onClick={onCheckAnswer}
              className={`btn-cute w-full sm:w-auto px-6 py-2.5 text-white font-bold text-sm ${
                selectedOption !== null
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              정답 확인!
            </button>
          ) : isLastQuestion ? (
            <button
              data-testid="complete-quiz-btn"
              onClick={onNextQuestion}
              className="btn-cute w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md animate-pulse"
            >
              퀴즈 완료하기 🏆
            </button>
          ) : (
            <button
              data-testid="quiz-next-btn"
              onClick={onNextQuestion}
              className="btn-cute w-full sm:w-auto px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-md"
            >
              다음 문제 ➡️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
