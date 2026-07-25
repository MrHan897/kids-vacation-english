import React, { useState, useEffect } from 'react';
import { PHONICS_DATA } from '../../data/phonicsData';
import { speakText, playSound } from '../../services/audio';
import { addSticker } from '../../services/storage';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

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

export const PhonicsCardGame: React.FC = () => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);

  // Initialize game with 6 pairs (12 cards total) randomly selected from PHONICS_DATA
  const initializeGame = () => {
    const shuffledPhonics = [...PHONICS_DATA].sort(() => 0.5 - Math.random()).slice(0, 6);

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
  }, []);

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
        // Matched!
        setTimeout(() => {
          playSound('success');
          updatedCards[firstIdx].isMatched = true;
          updatedCards[secondIdx].isMatched = true;
          setCards([...updatedCards]);
          setFlippedCards([]);

          setMatchedPairsCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 6) {
              setIsGameCompleted(true);
              playSound('reward');
              addSticker({
                id: `stk-phonics-game-${Date.now()}`,
                name: '파닉스 매칭 왕',
                icon: '🩵',
                description: '파닉스 알파벳 짝맞추기 게임 완주!',
                category: 'medal',
                unlockedAt: new Date().toISOString(),
              });
            }
            return nextCount;
          });
        }, 500);
      } else {
        // Not matched - flip back
        setTimeout(() => {
          updatedCards[firstIdx].isFlipped = false;
          updatedCards[secondIdx].isFlipped = false;
          setCards([...updatedCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="card-pastel p-6 bg-gradient-to-b from-blue-50/50 via-white to-purple-50/50 rounded-3xl border-2 border-purple-100 shadow-md" data-testid="phonics-game-container">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-purple-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <h3 className="text-xl font-bold text-slate-800">알파벳 & 단어 짝맞추기 카드 게임</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">알파벳 카드와 알맞은 영어 단어 카드를 찾아 짝을 맞춰보세요!</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
            맞춘 짝: {matchedPairsCount} / 6
          </div>
          <button
            onClick={initializeGame}
            className="p-2 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>새 게임</span>
          </button>
        </div>
      </div>

      {isGameCompleted ? (
        <div className="text-center py-8 bg-purple-50/80 rounded-3xl border-2 border-purple-200 p-6 space-y-4">
          <div className="text-5xl animate-bounce">🎉</div>
          <h4 className="text-2xl font-extrabold text-purple-900">축하합니다! 참 잘했어요!</h4>
          <p className="text-sm text-purple-700 font-medium">
            {moves}번의 시도 만에 모든 파닉스 카드의 짝을 맞추었습니다! 칭찬 스티커를 받아가세요!
          </p>
          <button
            onClick={initializeGame}
            className="btn-cute bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-bold text-sm shadow-md"
          >
            다시 도전하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {cards.map((card, idx) => {
            const isFlippedOrMatched = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.gameId}
                data-testid="phonics-card"
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched}
                className={`h-28 sm:h-32 rounded-2xl border-2 transition-all duration-300 transform flex flex-col items-center justify-center p-2 text-center select-none ${
                  card.isMatched
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-80 cursor-default scale-95'
                    : card.isFlipped
                      ? 'border-purple-400 bg-white shadow-md scale-105'
                      : 'border-purple-200 bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-cute hover:scale-102 hover:border-purple-300'
                }`}
              >
                {isFlippedOrMatched ? (
                  <>
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-1 font-mono truncate max-w-full">
                      {card.displayContent}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-full">
                      {card.subtitle}
                    </span>
                    {card.isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl opacity-80">❓</span>
                    <span className="text-xs font-bold tracking-wider font-mono">PHONICS</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
