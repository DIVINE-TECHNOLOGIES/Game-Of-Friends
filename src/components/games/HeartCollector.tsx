import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/sound';

interface HeartCollectorProps {
  onGameEnd: (won: boolean) => void;
  avatarEmoji: string;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'obstacle';
  speedY: number;
  speedX: number;
  emoji: string;
}

export default function HeartCollector({ onGameEnd, avatarEmoji }: HeartCollectorProps) {
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 130, y: 220 });
  const [objects, setObjects] = useState<GameObject[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const objectSpawnerRef = useRef<NodeJS.Timeout | null>(null);
  const objectIdRef = useRef<number>(0);

  const containerWidth = 280;
  const containerHeight = 280;
  const playerSize = 34;

  useEffect(() => {
    const savedHighScore = localStorage.getItem('collector_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    return () => stopGame();
  }, []);

  const startGame = () => {
    playSound('click');
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
    setPlayerPos({ x: 130, y: 220 });
    setObjects([]);
    objectIdRef.current = 0;

    // Game physics loop (approx 60fps or 30ms interval)
    gameLoopRef.current = setInterval(() => {
      updatePhysics();
    }, 35);

    // Spawn objects periodically
    objectSpawnerRef.current = setInterval(() => {
      spawnObject();
    }, 800);
  };

  const stopGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (objectSpawnerRef.current) clearInterval(objectSpawnerRef.current);
  };

  const handleGameOver = () => {
    stopGame();
    setIsGameOver(true);
    playSound('lose');
    onGameEnd(false);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('collector_high_score', score.toString());
    }
  };

  const spawnObject = () => {
    const isHeart = Math.random() < 0.65; // 65% chance of heart, 35% obstacle
    const emoji = isHeart ? '❤️' : Math.random() > 0.5 ? '☁️' : '💣';
    
    // Calculate speed based on current score to increase difficulty
    const baseSpeed = 2 + Math.min(score / 5, 5); 
    const randomSpeedY = baseSpeed + Math.random() * 2;
    const randomSpeedX = (Math.random() - 0.5) * 1.5;

    const newObj: GameObject = {
      id: objectIdRef.current++,
      x: Math.random() * (containerWidth - 20),
      y: -20,
      type: isHeart ? 'heart' : 'obstacle',
      speedY: randomSpeedY,
      speedX: randomSpeedX,
      emoji
    };

    setObjects((prev) => [...prev, newObj]);
  };

  const updatePhysics = () => {
    setObjects((prevObjects) => {
      const nextObjects: GameObject[] = [];

      for (let obj of prevObjects) {
        const nextY = obj.y + obj.speedY;
        const nextX = obj.x + obj.speedX;

        // Boundary bounce for x
        let actualX = nextX;
        let actualSpeedX = obj.speedX;
        if (actualX < 0 || actualX > containerWidth - 20) {
          actualSpeedX = -obj.speedX;
          actualX = Math.max(0, Math.min(actualX, containerWidth - 20));
        }

        // Collision Check with player
        const collides = 
          actualX < playerPos.x + playerSize &&
          actualX + 20 > playerPos.x &&
          nextY < playerPos.y + playerSize &&
          nextY + 20 > playerPos.y;

        if (collides) {
          if (obj.type === 'heart') {
            playSound('collect');
            setScore((s) => s + 1);
            // Don't push to next array (destroys heart on collect)
            continue;
          } else {
            // Collision with bomb or storm cloud! Game over
            setTimeout(() => handleGameOver(), 0);
            return prevObjects;
          }
        }

        // Keep item if it hasn't fallen out of screen
        if (nextY < containerHeight) {
          nextObjects.push({
            ...obj,
            x: actualX,
            y: nextY,
            speedX: actualSpeedX
          });
        }
      }

      return nextObjects;
    });
  };

  // Drag or mouse move control on playing field
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isStarted || isGameOver || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - playerSize / 2;
    const mouseY = e.clientY - rect.top - playerSize / 2;

    // Clamp coordinates
    const clampedX = Math.max(0, Math.min(mouseX, containerWidth - playerSize));
    const clampedY = Math.max(0, Math.min(mouseY, containerHeight - playerSize));

    setPlayerPos({ x: clampedX, y: clampedY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isStarted || isGameOver || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left - playerSize / 2;
    const touchY = touch.clientY - rect.top - playerSize / 2;

    // Clamp coordinates
    const clampedX = Math.max(0, Math.min(touchX, containerWidth - playerSize));
    const clampedY = Math.max(0, Math.min(touchY, containerHeight - playerSize));

    setPlayerPos({ x: clampedX, y: clampedY });
  };

  // Simple key control keys as fallback or convenience buttons
  const movePlayer = (direction: 'L' | 'R' | 'U' | 'D') => {
    if (!isStarted || isGameOver) return;
    playSound('click');
    setPlayerPos((prev) => {
      let nextX = prev.x;
      let nextY = prev.y;
      const step = 25;
      
      if (direction === 'L') nextX = Math.max(0, prev.x - step);
      if (direction === 'R') nextX = Math.min(containerWidth - playerSize, prev.x + step);
      if (direction === 'U') nextY = Math.max(0, prev.y - step);
      if (direction === 'D') nextY = Math.min(containerHeight - playerSize, prev.y + step);

      return { x: nextX, y: nextY };
    });
  };

  return (
    <div id="heart-collector" className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">❤️ Heart Collector</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Move your character to catch hearts! Avoid storm clouds ☁️ and bombs 💣.
        </p>
      </div>

      {/* Scores */}
      <div className="flex gap-8 justify-center mb-4 text-sm font-semibold">
        <div className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-full text-pink-600">
          💖 Hearts: {score}
        </div>
        <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-purple-600">
          🏆 Record: {highScore}
        </div>
      </div>

      {/* Collector Stage */}
      <div
        id="collector-field"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative bg-gradient-to-b from-rose-50/50 to-pink-50 border border-pink-100/60 rounded-3xl shadow-inner select-none overflow-hidden cursor-none"
        style={{ width: containerWidth, height: containerHeight }}
      >
        {!isStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 rounded-3xl">
            <span className="text-4xl mb-2 animate-bounce-slow">🧸</span>
            <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
              Slide your finger or mouse inside the box to collect hearts!
            </p>
            <button
              id="collector-start"
              onClick={startGame}
              className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-xs shadow transition-all active:scale-95"
            >
              Start Collecting
            </button>
          </div>
        ) : isGameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 rounded-3xl">
            <span className="text-4xl mb-2">🩹</span>
            <p className="text-sm font-bold text-gray-700">A Storm Caught You!</p>
            <p className="text-xs text-gray-400 mb-4">You collected {score} hearts.</p>
            <button
              id="collector-restart"
              onClick={startGame}
              className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-xs shadow transition-all active:scale-95"
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            {/* Player Character */}
            <div
              className="absolute text-3xl transition-all duration-75 select-none"
              style={{
                left: playerPos.x,
                top: playerPos.y,
                width: playerSize,
                height: playerSize,
              }}
            >
              {avatarEmoji}
            </div>

            {/* Spawned Objects */}
            {objects.map((obj) => (
              <div
                key={obj.id}
                className={`absolute select-none text-xl ${obj.type === 'heart' ? 'animate-pulse' : ''}`}
                style={{
                  left: obj.x,
                  top: obj.y,
                  width: 20,
                  height: 20,
                }}
              >
                {obj.emoji}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Fallback Keyboard / On-screen Buttons */}
      {isStarted && !isGameOver && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <button
            id="collector-up"
            onClick={() => movePlayer('U')}
            className="w-10 h-8 rounded-lg bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold"
          >
            ▲
          </button>
          <div className="flex gap-4">
            <button
              id="collector-left"
              onClick={() => movePlayer('L')}
              className="w-10 h-8 rounded-lg bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold"
            >
              ◀
            </button>
            <div className="w-8 h-8" />
            <button
              id="collector-right"
              onClick={() => movePlayer('R')}
              className="w-10 h-8 rounded-lg bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold"
            >
              ▶
            </button>
          </div>
          <button
            id="collector-down"
            onClick={() => movePlayer('D')}
            className="w-10 h-8 rounded-lg bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold"
          >
            ▼
          </button>
          <span className="text-[10px] text-gray-400 mt-2">
            Tip: You can also hover/drag your cursor/finger inside the game field!
          </span>
        </div>
      )}
    </div>
  );
}
