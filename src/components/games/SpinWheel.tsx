import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { WHEEL_CHALLENGES } from '../../data/staticData';

interface SpinWheelProps {
  onGameEnd: (won: boolean) => void;
  onSpinSuccess: () => void;
}

export default function SpinWheel({ onGameEnd, onSpinSuccess }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinAngle, setSpinAngle] = useState<number>(0);
  const [selectedChallenge, setSelectedChallenge] = useState<{ text: string; icon: string } | null>(null);

  const colors = [
    '#fbcfe8', // pink-200
    '#e9d5ff', // purple-200
    '#bae6fd', // sky-200
    '#fef08a', // yellow-200
    '#fed7aa', // orange-200
    '#ccfbf1', // teal-100
    '#ffe4e6', // rose-100
    '#dbeafe', // blue-100
  ];

  const handleSpin = () => {
    if (isSpinning) return;

    playSound('click');
    setIsSpinning(true);
    setSelectedChallenge(null);

    // Dynamic tick sounds during the spin
    let tickCount = 0;
    const maxTicks = 18;
    const playTick = () => {
      if (tickCount < maxTicks) {
        playSound('spin');
        tickCount++;
        setTimeout(playTick, 50 + tickCount * 15); // gradually slows down tick rate
      }
    };
    playTick();

    // 5 to 10 full spins plus random slice offset
    const totalSlices = WHEEL_CHALLENGES.length;
    const chosenIndex = Math.floor(Math.random() * totalSlices);
    
    // Each slice is 360 / 8 = 45 degrees
    const sliceAngle = 360 / totalSlices;
    
    // Calculate final rotation degrees. Center the pointer (which points at 90 deg or top)
    const extraDegrees = (totalSlices - chosenIndex) * sliceAngle - (sliceAngle / 2);
    const newAngle = spinAngle + 360 * 6 + extraDegrees;

    setSpinAngle(newAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedChallenge(WHEEL_CHALLENGES[chosenIndex]);
      playSound('win');
      onGameEnd(true);
      onSpinSuccess(); // Register Fate Seeker achievement
    }, 2800); // Wait for transition animation to end (2.8 seconds)
  };

  return (
    <div id="spin-wheel-game" className="flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎲 Spin the Destiny Wheel</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Take turns spinning the wheel! Complete the cute challenge together.
        </p>
      </div>

      {/* Wheel Wrapper */}
      <div className="relative w-72 h-72 flex items-center justify-center mb-8">
        {/* Needle Pointer */}
        <div className="absolute top-[-10px] z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-500 filter drop-shadow-md animate-bounce-slow" />

        {/* Outer Ring */}
        <div className="absolute inset-0 border-8 border-pink-100 rounded-full bg-pink-50/20 shadow-md p-1.5 z-0" />

        {/* Inner Wheel Canvas container */}
        <div
          id="cozy-wheel"
          className="w-full h-full rounded-full overflow-hidden relative border-4 border-white shadow-lg transition-transform duration-[2800ms] ease-out"
          style={{
            transform: `rotate(${spinAngle}deg)`,
            background: 'conic-gradient(#fbcfe8 0% 12.5%, #e9d5ff 12.5% 25%, #bae6fd 25% 37.5%, #fef08a 37.5% 50%, #fed7aa 50% 62.5%, #ccfbf1 62.5% 75%, #ffe4e6 75% 87.5%, #dbeafe 87.5% 100%)',
          }}
        >
          {/* Label slices */}
          {WHEEL_CHALLENGES.map((challenge, index) => {
            const angle = index * 45 + 22.5; // offset center
            return (
              <div
                key={index}
                className="absolute w-1/2 h-8 top-1/2 left-1/2 transform -translate-y-1/2 origin-left flex items-center justify-end pr-6 select-none"
                style={{
                  transform: `rotate(${angle - 90}deg)`, // align with slices
                }}
              >
                <span className="text-base font-bold text-gray-700/95" style={{ transform: 'rotate(90deg)' }}>
                  {challenge.icon}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center Button Pin */}
        <button
          id="wheel-center-spin"
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute z-10 w-16 h-16 rounded-full bg-white text-gray-800 font-extrabold text-sm flex items-center justify-center shadow-lg border-4 border-pink-200 hover:scale-[1.05] active:scale-95 disabled:scale-100 disabled:opacity-90 hover:border-pink-300 transition-all cursor-pointer"
        >
          {isSpinning ? '🌀' : 'SPIN'}
        </button>
      </div>

      {/* Result Container */}
      <div className="text-center h-24 max-w-xs flex flex-col justify-center">
        {selectedChallenge ? (
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100/60 shadow-sm animate-pop">
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Your Challenge 🌸</p>
            <p className="text-sm font-extrabold text-gray-800">
              {selectedChallenge.icon} {selectedChallenge.text}
            </p>
            <p className="text-[10px] text-gray-400 mt-1.5">+20 XP, +5 Coins 🪙</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {isSpinning ? 'The wheel of fate is turning...' : 'Who will spin next? 🎲'}
          </p>
        )}
      </div>
    </div>
  );
}
