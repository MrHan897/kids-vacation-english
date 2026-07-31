import React, { useState, useEffect } from 'react';
import { GradeLevel } from '../../types';
import { PHONICS_DATA } from '../../data/phonicsData';
import { speakText, playSound } from '../../services/audio';
import { addSticker } from '../../services/storage';
import { RefreshCw, Sparkles, CheckCircle2, Trophy, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCard {
  gameId: string;
  cardId: string;
  type: 'letter' | 'word';
  displayContent: string;
  subtitle: string;
  icon: string;
  word: string;
  letter: string;
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
}

interface PhonicsCardGameProps {
  grade?: GradeLevel;
}

export const PhonicsCardGame: React.FC<PhonicsCardGameProps> = ({ grade = 'grade3' }) => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);

  // [요청 사항 3] 학년별 자동 난이도 조절 (1학년: 3쌍 6장, 2학년: 6쌍 12장, 3학년+: 8쌍 16장)
  const getPairsCount = () => {
    if (grade === 'grade1') return 3;
    if (grade === 'grade2') return 6;
    return 8; // grade3 or above
  };

  const totalPairs = getPairsCount();

  const initializeGame = () => {
    const pairsCount = getPairsCount();
    const shuffledPhonics = [...PHONICS_DATA].sort(() => 0.5 - Math.random()).slice(0, pairsCount);

    const gameCards: GameCard[] = [];
    shuffledPhonics.forEach((item) => {
      // Card 1: Letter Card
      gameCards.push({
        gameId: `${item.id}-letter`,
        cardId: item.id,
        type: 'letter',
        displayContent: `${item.uppercase}${item.lowercase}`,
        subtitle: item.phonicsSound,
        icon: item.icon,
        word: item.word,
        letter: item.letter,
        isFlipped: false,
        isMatched: false,
        color: item.color,
      });

      // Card 2: Word Card
      gameCards.push({
        gameId: `${item.id}-word`,
        cardId: item.id,
        type: 'word',
        displayContent: item.word,
        subtitle: item.translation,
        icon: item.icon,
        word: item.word,
        letter: item.letter,
        isFlipped: false,
        isMatched: false,
        color: item.color,
      });
    });

    setCards(gameCards.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setMoves(0);
    setIsGameCompleted(false);
  };

  useEffect(() => {
    initializeGame();
  }, [grade]);

  const handleCardClick = (index: number) => {
    const card = cards[index];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    // Speak word when card clicked
    speakText(card.word, 'en-US');

    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];

      if (firstCard.cardId === secondCard.cardId) {
        // [요청 사항 2] 두 카드 짝이 맞춰졌을 때 반짝이고 튀어 오르는(Bounce) 축하 이펙트!
        setTimeout(() => {
          playSound('success');
          updatedCards[firstIdx].isMatched = true;
          updatedCards[secondIdx].isMatched = true;
          setCards([...updatedCards]);
          setFlippedCards([]);

          setMatchedPairsCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === totalPairs) {
              setIsGameCompleted(true);
              playSound('reward');
              addSticker({
                id: `stk-phonics-game-${Date.now()}`,
                name: '🎮 파닉스 매칭 마스터',
                icon: '👑',
                description: `${totalPairs}쌍 파닉스 짝맞추기 게임 완주 성공!`,
                category: 'medal',
                unlockedAt: new Date().toISOString(),
              });
            }
            return nextCount;
          });
        }, 400);
      } else {
        // Not matched - flip back after 1sec
        setTimeout(() => {
          updatedCards[firstIdx].isFlipped = false;
          updatedCards[secondIdx].isFlipped = false;
          setCards([...updatedCards]);
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  // [요청 사항 3] 학년별 반응형 Grid Layout class
  const getGridColsClass = () => {
    if (totalPairs === 3) return 'grid-cols-3'; // 3x2
    if (totalPairs === 6) return 'grid-cols-3 sm:grid-cols-4'; // 3x4
    return 'grid-cols-4'; // 4x4
  };

  return (
    <div
      className="card-pastel p-5 sm:p-6 bg-gradient-to-b from-purple-50/70 via-white to-amber-50/70 rounded-3xl border-4 border-purple-200 shadow-xl"
      data-testid="phonics-game-container"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-purple-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
              ✨ 파닉스 알파벳 & 단어 짝맞추기 3D 게임
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            알파벳 카드와 알맞은 영어 단어 카드를 찾아 짝을 맞춰보세요! ({totalPairs}쌍 도전)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs font-black bg-purple-100 text-purple-900 px-3.5 py-1.5 rounded-full border border-purple-300 flex items-center gap-1 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>맞춘 짝: <strong className="text-purple-700">{matchedPairsCount}</strong> / {totalPairs}</span>
          </div>
          <button
            type="button"
            onClick={initializeGame}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-full transition-all active:scale-95 flex items-center gap-1 text-xs font-black border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>새 게임</span>
          </button>
        </div>
      </div>

      {/* Game Finish Banner */}
      {isGameCompleted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8 bg-gradient-to-b from-purple-100 via-purple-50 to-white rounded-3xl border-4 border-purple-300 p-6 space-y-4 shadow-xl"
        >
          <div className="text-6xl animate-bounce">👑 🏆 🐰</div>
          <h4 className="text-2xl font-black text-purple-950">대단해요! 파닉스 짝맞추기 완주!</h4>
          <p className="text-xs sm:text-sm text-purple-800 font-extrabold">
            단 {moves}번의 시도 만에 모든 파닉스 카드의 짝을 완벽히 맞추었습니다!
            <br />
            칭찬 스티커와 코인을 획득했어요! 🌟
          </p>
          <button
            type="button"
            onClick={initializeGame}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-full shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </button>
        </motion.div>
      ) : (
        /* [요청 사항 3] 학년별 반응형 CSS Grid */
        <div className={`grid ${getGridColsClass()} gap-3`}>
          {cards.map((card, idx) => {
            const isFlippedOrMatched = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.gameId}
                className="perspective-1000 w-full h-32 sm:h-36"
              >
                {/* [요청 사항 2] 3D 뒤집기 카드 애니메이션 컨테이너 */}
                <div
                  data-testid="phonics-card"
                  onClick={() => handleCardClick(idx)}
                  className={`w-full h-full relative transform-style-3d transition-transform duration-500 cursor-pointer ${
                    isFlippedOrMatched ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* [요청 사항 2] 카드 뒷면: 🐰 토끼 마스코트 패브릭 패턴 + ✨ PHONICS 배지 */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl border-3 border-purple-300 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center p-2 shadow-md hover:scale-102 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner animate-pulse">
                      🐰
                    </div>
                    <span className="text-[11px] font-black tracking-widest text-amber-200 mt-1 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3 text-amber-300" /> PHONICS
                    </span>
                  </div>

                  {/* 카드 앞면: 뒤집어졌을 때 보여지는 알파벳/단어 콘텐츠 (180도 회전) */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-3 flex flex-col items-center justify-center p-2 text-center shadow-md ${
                      card.isMatched
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 scale-98 animate-bounce'
                        : 'bg-white border-purple-300 text-slate-800'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{card.icon}</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 mt-1 truncate max-w-full">
                      {card.displayContent}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 truncate max-w-full">
                      {card.subtitle}
                    </span>
                    {card.isMatched && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

