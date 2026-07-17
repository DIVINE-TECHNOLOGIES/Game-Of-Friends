import React from 'react';
import { LeaderboardStats, UserProfile } from '../types';

interface LeaderboardSectionProps {
  leaderboard: LeaderboardStats;
  activeUser: UserProfile;
  partnerUser: UserProfile;
}

export default function LeaderboardSection({ leaderboard, activeUser, partnerUser }: LeaderboardSectionProps) {
  return (
    <div id="leaderboard-section" className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in text-left">
      {/* Intro Banner */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm text-center relative overflow-hidden">
        <span className="text-4xl block mb-2 select-none animate-pulse">👑</span>
        <h2 className="text-xl font-extrabold text-gray-800">Our Friendly Hall of Fame</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
          A cozy glance at our statistics! Keep playing and chatting to secure your spots at the top.
        </p>
      </div>

      {/* Grid Bento Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Snake High Score */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">Highest Snake Score</h4>
              <p className="text-[10px] text-gray-400">The champion of sweet apples</p>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.highestSnakeScore.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/40"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <span className="text-gray-400">#{idx + 1}</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  🍎 {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 2: Reaction Speed */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">Fastest Reaction Time</h4>
              <p className="text-[10px] text-gray-400">Who is quick on the draw?</p>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.fastestReactionTime.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/40"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <span className="text-gray-400">#{idx + 1}</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                  ⚡ {item.time}ms
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 3: Most Games Won */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">Most Games Won</h4>
              <p className="text-[10px] text-gray-400">Our ultimate match champion</p>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.mostGamesWon.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/40"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <span className="text-gray-400">#{idx + 1}</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                  🏆 {item.count} wins
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 4: Most Messages Sent */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">Most Messages Sent</h4>
              <p className="text-[10px] text-gray-400">Our sweetest chatterbox</p>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.mostMessagesSent.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/40"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <span className="text-gray-400">#{idx + 1}</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  💬 {item.count} notes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Longest streak full panel */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-5 rounded-3xl border border-pink-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <h4 className="font-extrabold text-gray-800 text-sm">Longest Daily Streak</h4>
            <p className="text-[10px] text-gray-400">Continuous days visited in Game of Friends</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leaderboard.longestLoginStreak.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white p-3 rounded-2xl border border-amber-100 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <span className="text-amber-500">#{idx + 1}</span>
                <span>{item.name}</span>
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                🔥 {item.count} days
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
