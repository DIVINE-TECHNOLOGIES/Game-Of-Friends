import React from 'react';
import { Achievement, UserProfile } from '../types';
import { ACHIEVEMENTS } from '../data/staticData';

interface AchievementsSectionProps {
  activeUser: UserProfile;
}

export default function AchievementsSection({ activeUser }: AchievementsSectionProps) {
  const unlockedCount = activeUser.achievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div id="achievements-section" className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Achievements Header Card */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        {/* Decor items */}
        <div className="absolute top-[-10px] left-[-15px] text-5xl opacity-15 select-none rotate-12">🏆</div>
        <div className="absolute bottom-[-10px] right-[-15px] text-5xl opacity-15 select-none -rotate-12">⭐</div>

        <span className="text-5xl block mb-2 animate-bounce-slow">🏆</span>
        <h2 className="text-2xl font-black text-gray-800">Our Couple Achievements</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
          Complete fun quests and play games to fill up your trophy room with beautiful badges!
        </p>

        {/* Progress bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between items-center text-xs font-extrabold text-gray-500 mb-2">
            <span>Trophies Unlocked</span>
            <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">{unlockedCount} / {totalCount} ({percentComplete}%)</span>
          </div>
          <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = activeUser.achievements.includes(ach.id);
          return (
            <div
              key={ach.id}
              id={`achievement-card-${ach.id}`}
              className={`p-5 rounded-3xl border transition-all duration-300 relative flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-white border-pink-100 shadow-sm hover:scale-[1.02] hover:shadow'
                  : 'bg-gray-50/50 border-gray-100 text-gray-400 opacity-65'
              }`}
            >
              {/* Badge Icon circle */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border relative select-none ${
                  isUnlocked ? ach.badgeColor : 'bg-gray-200 border-gray-300 text-gray-400 filter grayscale'
                }`}
              >
                {ach.icon}
                {isUnlocked && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-extrabold shadow animate-ping-once">
                    ✓
                  </span>
                )}
              </div>

              {/* Text metadata */}
              <div className="space-y-1 text-left">
                <h4 className={`text-sm font-extrabold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  {ach.title}
                </h4>
                <p className="text-xs leading-normal text-gray-500">{ach.description}</p>
                <div className="flex gap-2 pt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-pink-50 text-pink-600 border border-pink-100/40' : 'bg-gray-100 text-gray-400'}`}>
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
