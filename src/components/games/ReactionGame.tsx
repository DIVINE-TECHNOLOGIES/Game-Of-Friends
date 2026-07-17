import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/sound';

interface ReactionGameProps {
  onGameEnd: (won: boolean) => void;
  onReactionRecorded: (timeMs: number) => void;
}

type GameState = 'IDLE' | 'WAITING' | 'TAP_NOW' | 'FINISHED' | 'FAILED';

export default function ReactionGame({ onGameEnd, onReactionRecorded }: ReactionGameProps) {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Test your reflexes! Tap when it turns green.');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const savedBest = localStorage.getItem('reaction_best_time');
    if (savedBest) {
      setBestTime(parseInt(savedBest));
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTest = () => {
    playSound('click');
    setGameState('WAITING');
    setReactionTime(null);
    setStatusMessage('Hold on... wait for the green heart! 💖');

    const randomDelay = 1500 + Math.random() * 3000; // 1.5s to 4.5s
    timeoutRef.current = setTimeout(() => {
      setGameState('TAP_NOW');
      setStatusMessage('TAP NOW!!! ❤️');
      startTimeRef.current = performance.now();
    }, randomDelay);
  };

  const handleTap = () => {
    if (gameState === 'IDLE' || gameState === 'FINISHED' || gameState === 'FAILED') {
      startTest();
      return;
    }

    if (gameState === 'WAITING') {
      // Tapped too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('FAILED');
      setStatusMessage('Oops! You tapped too early! 🩹 Relax and wait for green.');
      playSound('wrong');
      onGameEnd(false);
      return;
    }

    if (gameState === 'TAP_NOW') {
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTimeRef.current);
      
      setReactionTime(timeElapsed);
      setGameState('FINISHED');
      setStatusMessage(`Splendid! Reaction time: ${timeElapsed}ms ✨`);
      playSound('win');
      onGameEnd(true);

      // Save best time
      const currentBest = bestTime;
      if (currentBest === null || timeElapsed < currentBest) {
        setBestTime(timeElapsed);
        localStorage.setItem('reaction_best_time', timeElapsed.toString());
      }

      onReactionRecorded(timeElapsed);
    }
  };

  return (
    <div id="reaction-game" className="flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 Reaction Speed</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Tap or click the giant heart card as soon as it turns bright green!
        </p>
      </div>

      {/* Best Score */}
      {bestTime !== null && (
        <div className="mb-5 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-orange-600 text-sm font-semibold">
          ⚡ Your Personal Best: {bestTime}ms
        </div>
      )}

      {/* Tap Target Plate */}
      <button
        id="reaction-tap-plate"
        onClick={handleTap}
        className={`w-full max-w-xs h-64 rounded-3xl flex flex-col items-center justify-center text-center p-6 transition-all duration-150 transform active:scale-95 shadow-md border ${
          gameState === 'IDLE'
            ? 'bg-gradient-to-br from-orange-400 to-rose-400 border-orange-200 text-white cursor-pointer hover:shadow-lg'
            : gameState === 'WAITING'
            ? 'bg-rose-200 border-rose-100 text-rose-800 cursor-wait'
            : gameState === 'TAP_NOW'
            ? 'bg-emerald-400 border-emerald-300 text-white cursor-pointer hover:scale-[1.02]'
            : gameState === 'FAILED'
            ? 'bg-amber-100 border-amber-200 text-amber-800'
            : 'bg-white border-orange-100 text-gray-800'
        }`}
      >
        <span className="text-6xl mb-4 animate-bounce-slow">
          {gameState === 'IDLE' && '🎯'}
          {gameState === 'WAITING' && '🌸'}
          {gameState === 'TAP_NOW' && '❤️'}
          {gameState === 'FAILED' && '🩹'}
          {gameState === 'FINISHED' && '🏆'}
        </span>
        <span className="text-lg font-extrabold px-4">{statusMessage}</span>
        {gameState === 'IDLE' && <span className="text-xs text-white/80 mt-3 font-semibold">Tap to Start</span>}
        {gameState === 'FINISHED' && reactionTime && (
          <div className="mt-2 text-xs text-gray-400 font-semibold animate-pulse">
            {reactionTime < 250 ? '👑 Lightning reflexes! +20 XP!' : 'Good effort! Tap to try again.'}
          </div>
        )}
        {(gameState === 'FINISHED' || gameState === 'FAILED') && (
          <span className="text-xs text-gray-400 mt-4">Tap card to restart test</span>
        )}
      </button>
    </div>
  );
}
