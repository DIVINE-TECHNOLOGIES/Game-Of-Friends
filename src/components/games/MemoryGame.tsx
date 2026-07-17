import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/sound';

interface MemoryGameProps {
  onGameEnd: (won: boolean) => void;
  recordTime: (timeMs: number) => void;
}

const MEMORY_ICONS = ['🐱', '🐰', '🐻', '🐼', '🐨', '🦊', '🐹', '🐧'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame({ onGameEnd, recordTime }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // holds indices
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load best score on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('memory_best_time');
    if (savedBest) {
      setBestTime(parseInt(savedBest));
    }
    initializeGame();
    return () => stopTimer();
  }, []);

  const initializeGame = () => {
    stopTimer();
    setTimer(0);
    setIsTimerActive(false);
    setIsWon(false);
    setFlippedCards([]);

    // Double icons and shuffle
    const pairedIcons = [...MEMORY_ICONS, ...MEMORY_ICONS];
    const shuffledCards = pairedIcons
      .map((icon, idx) => ({
        id: idx,
        icon,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
  };

  const startTimer = () => {
    if (!isTimerActive) {
      setIsTimerActive(true);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2 || isWon) return;

    // Start timer on first flip
    if (!isTimerActive && timer === 0) {
      startTimer();
    }

    playSound('click');

    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // Check for match if two cards flipped
    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          playSound('correct');

          // Check Win Condition
          if (matchedCards.every((c) => c.isMatched)) {
            handleWin();
          }
        }, 400);
      } else {
        // No match, flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          playSound('wrong');
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    stopTimer();
    setIsWon(true);
    playSound('win');
    onGameEnd(true);

    // Save best score
    const currentBest = bestTime;
    if (currentBest === null || timer < currentBest) {
      setBestTime(timer);
      localStorage.setItem('memory_best_time', timer.toString());
    }

    // Report time to stats
    recordTime(timer * 1000);
  };

  return (
    <div id="memory-game" className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🧠 Memory Match Game</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Match cute partner icons as fast as you can. Flip to begin!
        </p>
      </div>

      {/* Timer / Best Score */}
      <div className="flex gap-8 justify-center mb-5 text-sm font-semibold">
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600">
          ⏱️ Timer: {timer}s
        </div>
        {bestTime !== null && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600">
            🥇 Best Time: {bestTime}s
          </div>
        )}
      </div>

      {/* Game Board Grid */}
      <div className="grid grid-cols-4 gap-2.5 max-w-sm w-full p-3.5 bg-blue-50/50 rounded-3xl border border-blue-100/60 shadow-inner">
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              id={`memory-card-${idx}`}
              onClick={() => handleCardClick(idx)}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm border transition-all duration-300 transform relative preserve-3d ${showFace ? 'bg-white rotate-y-180 border-blue-200' : 'bg-gradient-to-br from-blue-400 to-indigo-400 hover:scale-[1.03] active:scale-95 text-white border-blue-300'}`}
            >
              {showFace ? (
                <span className="select-none">{card.icon}</span>
              ) : (
                <span className="text-xl font-bold select-none text-white/90">🧸</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Win Modal Message */}
      {isWon && (
        <div className="mt-6 text-center animate-bounce-slow">
          <p className="text-xl font-extrabold text-blue-600">
            🎉 Clean Match! Completed in {timer}s!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Matched perfectly! +20 XP, +5 Coins 🪙
          </p>
          {timer < 30 && (
            <p className="text-xs text-rose-500 font-bold mt-1">
              🏆 Unlocked: Memory Master!
            </p>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          id="memory-restart"
          onClick={initializeGame}
          className="px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          {isWon ? 'Play Again 🌟' : 'Reset Grid'}
        </button>
      </div>
    </div>
  );
}
