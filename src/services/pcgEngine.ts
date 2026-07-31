/**
 * [Dynamic PCG Engine] 학년 맞춤형 동적 무한 문제 생성기 및 스마트 셔플 서비스
 */

import { QuizCategory, QuizQuestion } from '../types';

export interface GeneratedMathQuestion {
  question: string;
  options: number[];
  correctAnswerIndex: number;
  explanation: string;
  icon: string;
}

// 1. [요청 사항 1] 최근 문제 기억 버퍼 (History Buffer) - 연속 중복 방지
const recentMathHistory: string[] = [];
const recentQuizHistory: string[] = [];
const MAX_HISTORY_SIZE = 5;

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

/**
 * [요청 사항 1] 수학 학습 - 무한 난수 생성 & 최근 문제 기억 버퍼로 중복 완벽 차단
 */
function createRawMathQuestion(isChallengeMode: boolean): GeneratedMathQuestion {
  let questionStr = '';
  let answer = 0;
  let explanationStr = '';
  let iconEmoji = '🔢';

  if (!isChallengeMode) {
    // 2학년 로직: 10~99 덧셈, 뺄셈(양수 보정), 구구단(2~9단)
    const type = getRandomInt(1, 3);
    if (type === 1) {
      const num1 = getRandomInt(10, 99);
      const num2 = getRandomInt(10, 99);
      answer = num1 + num2;
      questionStr = `${num1} + ${num2} = ?`;
      explanationStr = `${num1}에 ${num2}를 더하면 ${answer}가 됩니다! ➕`;
      iconEmoji = '➕';
    } else if (type === 2) {
      // 뺄셈 결과가 음수가 되지 않도록 큰 수에서 작은 수를 뺌
      const a = getRandomInt(10, 99);
      const b = getRandomInt(10, 99);
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      answer = big - small;
      questionStr = `${big} - ${small} = ?`;
      explanationStr = `${big}에서 ${small}을 빼면 ${answer}가 남습니다! ➖`;
      iconEmoji = '➖';
    } else {
      // 구구단
      const dan = getRandomInt(2, 9);
      const num = getRandomInt(1, 9);
      answer = dan * num;
      questionStr = `${dan} × ${num} = ?`;
      explanationStr = `${dan}단 구구단: ${dan} 곱하기 ${num}은 ${answer}입니다! ✖️`;
      iconEmoji = '✖️';
    }
  } else {
    // 3학년 챌린지 로직: 나누어 떨어지는 나눗셈 (C ÷ A = B), 100 단위 덧셈/뺄셈
    const type = getRandomInt(1, 3);
    if (type === 1) {
      // 나눗셈 (A * B = C)
      const a = getRandomInt(2, 9);
      const b = getRandomInt(2, 9);
      const c = a * b;
      answer = b;
      questionStr = `${c} ÷ ${a} = ?`;
      explanationStr = `${a} × ${b} = ${c} 이므로, ${c} ÷ ${a} = ${b} 입니다! ➗`;
      iconEmoji = '➗';
    } else if (type === 2) {
      // 100 단위 덧셈
      const num1 = getRandomInt(100, 999);
      const num2 = getRandomInt(100, 999);
      answer = num1 + num2;
      questionStr = `${num1} + ${num2} = ?`;
      explanationStr = `${num1}과 ${num2}의 합은 ${answer}입니다! 🚀`;
      iconEmoji = '🔥';
    } else {
      // 100 단위 뺄셈
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

  // 스마트 오답 (Distractors) 생성
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

/**
 * [요청 사항 1] 수학 무한 문제 생성기 (History Buffer 차단 검증 적용)
 */
export function generateMathQuestion(isChallengeMode: boolean): GeneratedMathQuestion {
  let attempts = 0;
  while (attempts < 30) {
    const q = createRawMathQuestion(isChallengeMode);
    if (!recentMathHistory.includes(q.question)) {
      recentMathHistory.push(q.question);
      if (recentMathHistory.length > MAX_HISTORY_SIZE) {
        recentMathHistory.shift();
      }
      return q;
    }
    attempts++;
  }
  return createRawMathQuestion(isChallengeMode);
}

/**
 * [요청 사항 2] 파닉스/영어/퀴즈 학습 - 무작위 문제 추전 & 다이내믹 오답 셔플 생성기
 */
export function generateDynamicQuizQuestion(
  categoryQuizzes: QuizQuestion[],
  allQuizzes: QuizQuestion[]
): QuizQuestion {
  if (!categoryQuizzes || categoryQuizzes.length === 0) {
    throw new Error('No quiz data available for this category');
  }

  // 1. History Buffer를 통해 직전/전전 문제 연속 중복 완벽 차단
  let mainQuiz = categoryQuizzes[getRandomInt(0, categoryQuizzes.length - 1)];
  let attempts = 0;
  while (attempts < 20 && recentQuizHistory.includes(mainQuiz.id) && categoryQuizzes.length > 1) {
    mainQuiz = categoryQuizzes[getRandomInt(0, categoryQuizzes.length - 1)];
    attempts++;
  }

  recentQuizHistory.push(mainQuiz.id);
  if (recentQuizHistory.length > MAX_HISTORY_SIZE) {
    recentQuizHistory.shift();
  }

  const correctAnswerText = mainQuiz.options[mainQuiz.correctAnswer];

  // 2. 전체 데이터 풀에서 정답을 제외한 무작위 3개 다이내믹 오답(Distractors) 추출
  const otherOptionsPool = allQuizzes
    .flatMap((q) => q.options)
    .filter((opt) => opt !== correctAnswerText);

  const uniqueOtherOptions = Array.from(new Set(otherOptionsPool));
  const shuffledOther = shuffleArray(uniqueOtherOptions);

  const selectedDistractors = shuffledOther.slice(0, 3);

  // 3. 정답 1개 + 오답 3개 셔플 및 새로운 정답 인덱스 재계산
  const dynamicOptions = shuffleArray([correctAnswerText, ...selectedDistractors]);
  const newCorrectIndex = dynamicOptions.indexOf(correctAnswerText);

  return {
    ...mainQuiz,
    options: dynamicOptions,
    correctAnswer: newCorrectIndex,
  };
}
