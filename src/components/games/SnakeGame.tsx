import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/sound';

interface SnakeGameProps {
  onGameEnd: (won: boolean) => void;
  onScoreSubmit: (score: number) => void;
}

const GRID_SIZE = 15;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const SPEED_MS = 140;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame({ onGameEnd, onScoreSubmit }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>('RIGHT');

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snake_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    generateFood([{ x: 7, y: 7 }]);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isGameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') setDirectionState('UP');
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') setDirectionState('DOWN');
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') setDirectionState('LEFT');
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') setDirectionState('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isGameOver]);

  // Main game loop
  useEffect(() => {
    if (!isStarted || isGameOver) return;

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, SPEED_MS);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isStarted, isGameOver, snake, direction]);

  const setDirectionState = (dir: Direction) => {
    setDirection(dir);
    directionRef.current = dir;
  };

  const generateFood = (currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const moveSnake = () => {
    const head = { ...snake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Collision check (Walls)
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }

    // Collision check (Self)
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }

    const newSnake = [head, ...snake];

    // Eat food check
    if (head.x === food.x && head.y === food.y) {
      playSound('collect');
      const newScore = score + 1;
      setScore(newScore);
      generateFood(newSnake);
    } else {
      newSnake.pop(); // remove tail
    }

    setSnake(newSnake);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    playSound('lose');
    onGameEnd(false);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_high_score', score.toString());
    }
    onScoreSubmit(score);
  };

  const startGame = () => {
    playSound('click');
    setSnake([{ x: 7, y: 7 }]);
    setDirectionState('RIGHT');
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
    generateFood([{ x: 7, y: 7 }]);
  };

  const resetGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setIsStarted(false);
    setIsGameOver(false);
    setScore(0);
    setSnake([{ x: 7, y: 7 }]);
    setDirectionState('RIGHT');
  };

  return (
    <div id="snake-game" className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🐍 Retro Snake Game</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Eat sweet treats and grow! Use keyboard arrows or on-screen controls below.
        </p>
      </div>

      {/* Scores */}
      <div className="flex gap-8 justify-center mb-5 text-sm font-semibold">
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600">
          🍎 Score: {score}
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-amber-600">
          🏆 High Score: {highScore}
        </div>
      </div>

      {/* Game Stage / Screen */}
      <div className="relative border border-emerald-100 bg-emerald-50/50 p-2 rounded-3xl shadow-inner max-w-sm w-full aspect-square flex items-center justify-center">
        {!isStarted ? (
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 max-w-[250px] mx-auto">
            <p className="text-sm text-gray-500 mb-4">Are you ready to beat the record? 🏆</p>
            <button
              id="snake-start-btn"
              onClick={startGame}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium text-sm transition-all"
            >
              Start Snake Game
            </button>
          </div>
        ) : isGameOver ? (
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-red-100 max-w-[250px] mx-auto z-10">
            <p className="text-base font-bold text-red-500 mb-1">Game Over! 🩹</p>
            <p className="text-xs text-gray-400 mb-4">Final Score: {score}</p>
            <button
              id="snake-retry-btn"
              onClick={startGame}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-15 gap-[1px] bg-emerald-950/5 w-full h-full rounded-2xl overflow-hidden relative">
            {Array.from({ length: CELL_COUNT }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              
              const isSnakeSegment = snake.some((seg) => seg.x === x && seg.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFoodSegment = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className={`w-full h-full rounded-[2px] transition-all duration-100 ${
                    isHead
                      ? 'bg-emerald-600 border border-emerald-700 relative flex items-center justify-center after:content-["•"] after:text-[8px] after:text-white'
                      : isSnakeSegment
                      ? 'bg-emerald-400/80'
                      : isFoodSegment
                      ? 'bg-rose-500 animate-pulse rounded-full border border-rose-600 scale-[0.85]'
                      : 'bg-emerald-50/10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* On-Screen Touch Controllers (D-pad) */}
      {isStarted && !isGameOver && (
        <div className="mt-5 flex flex-col items-center gap-1.5 md:hidden">
          <button
            id="dpad-up"
            onClick={() => { if (directionRef.current !== 'DOWN') setDirectionState('UP'); playSound('click'); }}
            className="w-12 h-10 rounded-xl bg-emerald-100 border border-emerald-200 active:bg-emerald-200 flex items-center justify-center font-bold text-emerald-800"
          >
            ▲
          </button>
          <div className="flex gap-4">
            <button
              id="dpad-left"
              onClick={() => { if (directionRef.current !== 'RIGHT') setDirectionState('LEFT'); playSound('click'); }}
              className="w-12 h-10 rounded-xl bg-emerald-100 border border-emerald-200 active:bg-emerald-200 flex items-center justify-center font-bold text-emerald-800"
            >
              ◀
            </button>
            <div className="w-12 h-10" /> {/* Spacer */}
            <button
              id="dpad-right"
              onClick={() => { if (directionRef.current !== 'LEFT') setDirectionState('RIGHT'); playSound('click'); }}
              className="w-12 h-10 rounded-xl bg-emerald-100 border border-emerald-200 active:bg-emerald-200 flex items-center justify-center font-bold text-emerald-800"
            >
              ▶
            </button>
          </div>
          <button
            id="dpad-down"
            onClick={() => { if (directionRef.current !== 'UP') setDirectionState('DOWN'); playSound('click'); }}
            className="w-12 h-10 rounded-xl bg-emerald-100 border border-emerald-200 active:bg-emerald-200 flex items-center justify-center font-bold text-emerald-800"
          >
            ▼
          </button>
        </div>
      )}

      {/* Control Actions */}
      <div className="flex gap-4 mt-6">
        {isStarted && (
          <button
            id="snake-reset"
            onClick={resetGame}
            className="px-6 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
}
