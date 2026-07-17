import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import ReactionGame from './games/ReactionGame';
import HeartCollector from './games/HeartCollector';
import SpinWheel from './games/SpinWheel';
import { playSound } from '../utils/sound';
import { UserProfile } from '../types';

interface GameHubProps {
  activeUser: UserProfile;
  partnerUser: UserProfile;
  onRecordGame: (gameName: string, won?: boolean) => void;
  onUpdateSnakeScore: (score: number) => void;
  onUpdateReactionTime: (timeMs: number) => void;
  onUnlockAchievement: (id: string) => void;
}

type ActiveGameKey = 'ARCADE' | 'TTT' | 'MEMORY' | 'SNAKE' | 'REACTION' | 'COLLECTOR' | 'WHEEL';

export default function GameHub({
  activeUser,
  partnerUser,
  onRecordGame,
  onUpdateSnakeScore,
  onUpdateReactionTime,
  onUnlockAchievement,
}: GameHubProps) {
  const [activeGame, setActiveGame] = useState<ActiveGameKey>('ARCADE');

  const gamesList = [
    {
      id: 'TTT' as ActiveGameKey,
      title: 'Tic Tac Toe',
      icon: '❤️',
      desc: 'Play against each other! Match three hearts or stars.',
      color: 'from-pink-100 to-rose-100 border-pink-200 text-pink-700',
    },
    {
      id: 'MEMORY' as ActiveGameKey,
      title: 'Memory Cards',
      icon: '🧠',
      desc: 'Flip and match couple-love emojis under a stopwatch timer!',
      color: 'from-blue-100 to-indigo-100 border-blue-200 text-blue-700',
    },
    {
      id: 'SNAKE' as ActiveGameKey,
      title: 'Retro Snake',
      icon: '🐍',
      desc: 'Dodge walls, eat sweet apples, and beat the record!',
      color: 'from-emerald-100 to-green-100 border-emerald-200 text-emerald-700',
    },
    {
      id: 'REACTION' as ActiveGameKey,
      title: 'Reaction Speed',
      icon: '🎯',
      desc: 'Wait for the bright green card and hit tap as fast as possible!',
      color: 'from-orange-100 to-amber-100 border-orange-200 text-orange-700',
    },
    {
      id: 'COLLECTOR' as ActiveGameKey,
      title: 'Heart Collector',
      icon: '💖',
      desc: 'Guide your cute partner avatar to collect flying hearts!',
      color: 'from-rose-100 to-pink-100 border-rose-200 text-rose-700',
    },
    {
      id: 'WHEEL' as ActiveGameKey,
      title: 'Destiny Wheel',
      icon: '🎲',
      desc: 'Spin for fun dares, date choices, selfies, and cuddle codes!',
      color: 'from-purple-100 to-fuchsia-100 border-purple-200 text-purple-700',
    },
  ];

  const handleLaunchGame = (gameId: ActiveGameKey) => {
    playSound('click');
    setActiveGame(gameId);
  };

  const handleBackToArcade = () => {
    playSound('click');
    setActiveGame('ARCADE');
  };

  return (
    <div id="game-hub-container" className="max-w-5xl mx-auto w-full animate-fade-in">
      {activeGame === 'ARCADE' ? (
        /* GAMES LIST (ARCADE ROOM) */
        <div className="space-y-8 text-left">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm text-center">
            <span className="text-4xl block mb-2 select-none animate-bounce-slow">🎮</span>
            <h2 className="text-xl font-extrabold text-gray-800">Our Private Arcade</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Select a mini-game to play! Gain experience and secure shiny trophies for your profile.
            </p>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {gamesList.map((game) => (
              <button
                key={game.id}
                id={`arcade-launch-${game.id.toLowerCase()}`}
                onClick={() => handleLaunchGame(game.id)}
                className={`p-6 rounded-3xl border bg-gradient-to-br ${game.color} hover:scale-[1.03] transition-all text-left flex flex-col justify-between h-48 hover:shadow active:scale-98 relative group`}
              >
                <div>
                  <span className="text-4xl block mb-3 filter drop-shadow-sm group-hover:animate-bounce-slow">
                    {game.icon}
                  </span>
                  <h4 className="font-extrabold text-sm mb-1">{game.title}</h4>
                  <p className="text-[11px] leading-relaxed opacity-85">{game.desc}</p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider underline flex items-center gap-1 mt-2">
                  Launch Arcade →
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE STAGE */
        <div className="bg-white rounded-3xl border border-pink-100 p-6 md:p-8 shadow-sm flex flex-col items-center">
          {/* Back button */}
          <button
            id="arcade-back-btn"
            onClick={handleBackToArcade}
            className="self-start mb-6 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            ← Back to Arcade Room
          </button>

          {/* Render target game */}
          <div className="w-full max-w-md">
            {activeGame === 'TTT' && (
              <TicTacToe
                onGameEnd={(won) => onRecordGame('Tic Tac Toe', won)}
                activeUserNickname={activeUser.nickname}
                partnerUserNickname={partnerUser.nickname}
              />
            )}
            {activeGame === 'MEMORY' && (
              <MemoryGame
                onGameEnd={(won) => onRecordGame('Memory Card Game', won)}
                recordTime={(timeMs) => {
                  onUpdateReactionTime(timeMs); // Record score
                  if (timeMs < 30000) {
                    onUnlockAchievement('memory_master');
                  }
                }}
              />
            )}
            {activeGame === 'SNAKE' && (
              <SnakeGame
                onGameEnd={(won) => onRecordGame('Snake Game', won)}
                onScoreSubmit={(score) => onUpdateSnakeScore(score)}
              />
            )}
            {activeGame === 'REACTION' && (
              <ReactionGame
                onGameEnd={(won) => onRecordGame('Reaction Speed Game', won)}
                onReactionRecorded={(timeMs) => onUpdateReactionTime(timeMs)}
              />
            )}
            {activeGame === 'COLLECTOR' && (
              <HeartCollector
                onGameEnd={(won) => {
                  onRecordGame('Heart Collector', won);
                  onUnlockAchievement('heart_collector');
                }}
                avatarEmoji={activeUser.avatar}
              />
            )}
            {activeGame === 'WHEEL' && (
              <SpinWheel
                onGameEnd={(won) => onRecordGame('Spin the Wheel', won)}
                onSpinSuccess={() => onUnlockAchievement('wheel_spinner')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
