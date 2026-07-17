import React, { useState, useEffect } from 'react';
import { useCoupleState } from './hooks/useCoupleState';
import { THEME_PALETTES } from './data/staticData';
import { playSound, getSoundEnabled, setSoundEnabled } from './utils/sound';

// Components
import GameHub from './components/GameHub';
import MessagesSection from './components/MessagesSection';
import AchievementsSection from './components/AchievementsSection';
import ProfileSection from './components/ProfileSection';
import LeaderboardSection from './components/LeaderboardSection';
import AuthScreen from './components/AuthScreen';

// Lucide icons
import {
  Home,
  Gamepad2,
  Mail,
  Award,
  User,
  Volume2,
  VolumeX,
  Bell,
  Heart,
  Crown,
  Sparkles,
  Smile,
} from 'lucide-react';

type TabKey = 'home' | 'games' | 'messages' | 'achievements' | 'profile' | 'leaderboard';

interface EasterEggHeart {
  id: number;
  x: number;
  emoji: string;
  size: number;
  delay: number;
  duration: number;
}

const PLACEHOLDER_PARTNER = {
  id: 'partner_placeholder',
  nickname: 'No partner linked',
  avatar: '👤',
  favoriteGame: 'None',
  gamesPlayed: 0,
  messagesSent: 0,
  achievements: [],
  level: 1,
  xp: 0,
  coins: 0,
  loginStreak: 0,
  lastLoginDate: '',
  themeColor: 'pink' as const
};

export default function App() {
  const {
    profiles,
    activeUser,
    partnerUser,
    partnerOnline,
    currentUserId,
    messages,
    dailyQuestions,
    leaderboard,
    notifications,
    activeTheme,
    authError,
    isAuthenticating,
    login,
    signup,
    linkPartner,
    logout,
    updateNickname,
    updateAvatar,
    changeTheme,
    addNotification,
    dismissNotification,
    sendMessage,
    editMessage,
    deleteMessage,
    clearMessages,
    addReaction,
    replyToMessage,
    answerDailyQuestion,
    recordGamePlayed,
    updateSnakeHighScore,
    updateReactionTime,
    unlockAchievement,
    spendCoins,
    addCoins,
  } = useCoupleState();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [muted, setMuted] = useState<boolean>(!getSoundEnabled());
  const [easterEggHearts, setEasterEggHearts] = useState<EasterEggHeart[]>([]);
  const [showNotificationsList, setShowNotificationsList] = useState<boolean>(false);

  // Synchronize mute setting
  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    setSoundEnabled(!nextMute);
    playSound('click');
  };

  // Easter Egg: Rainfall of hearts
  const triggerHeartsRain = () => {
    playSound('win');
    addNotification(`💖 Sweet Easter Egg! Sending a rainfall of love to ${activeUser.nickname}!`);
    
    const heartEmojis = ['❤️', '💖', '💝', '💕', '💘', '🌸', '✨'];
    const newHearts: EasterEggHeart[] = Array.from({ length: 30 }).map((_, idx) => ({
      id: Date.now() + idx,
      x: Math.random() * 100, // percentage of screen width
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      size: 15 + Math.random() * 25, // size in pixels
      delay: Math.random() * 1.5, // delay in seconds
      duration: 2 + Math.random() * 3, // duration in seconds
    }));

    setEasterEggHearts(newHearts);

    // Clear after animation finishes
    setTimeout(() => {
      setEasterEggHearts([]);
    }, 5500);
  };

  const currentTheme = THEME_PALETTES[activeTheme] || THEME_PALETTES.pink;

  // Active Daily Question
  const todayQuestion = dailyQuestions[0] || {
    id: 'default',
    question: "What's one small thing that made you smile today? 💕",
    answers: {},
  };

  // Quick navigation link handlers
  const handleNavigate = (tab: TabKey) => {
    playSound('click');
    setActiveTab(tab);
  };

  if (!activeUser) {
    return (
      <AuthScreen
        login={login}
        signup={signup}
        authError={authError}
        isAuthenticating={isAuthenticating}
      />
    );
  }

  return (
    <div
      id="app-root-container"
      className={`min-h-screen relative overflow-x-hidden flex flex-col justify-between font-sans transition-all duration-500 pb-20 md:pb-0 ${currentTheme.bg}`}
    >
      {/* Easter Egg Falling Hearts */}
      {easterEggHearts.map((h) => (
        <span
          key={h.id}
          className="fixed z-50 pointer-events-none select-none animate-fall-fade inline-block"
          style={{
            left: `${h.x}%`,
            top: `-40px`,
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}

      {/* Decorative Floating Clouds Background (Pure CSS animations) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-12 left-10 text-6xl opacity-20 animate-float-slow">☁️</div>
        <div className="absolute top-36 right-16 text-5xl opacity-15 animate-float-delayed">☁️</div>
        <div className="absolute bottom-48 left-16 text-5xl opacity-15 animate-float-delayed">☁️</div>
        <div className="absolute bottom-24 right-20 text-6xl opacity-20 animate-float-slow">☁️</div>
        <div className="absolute top-1/2 left-[45%] text-2xl opacity-10 animate-float-slow">⭐</div>
        <div className="absolute top-20 right-[35%] text-2xl opacity-10 animate-float-delayed">✨</div>
      </div>

      {/* HEADER NAVIGATION BAR (DESKTOP) */}
      <header className="sticky top-2 sm:top-4 z-40 mx-2 sm:mx-4 md:mx-6 my-2 bold-card px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between shadow-md">
        <button
          id="brand-logo"
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
        >
          <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform duration-300">❤️</span>
          <h1 className="font-black text-xs sm:text-base text-[#FF6B6B] tracking-tight">Game of Friends</h1>
        </button>

        {/* Desktop Menu links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#9A8C98]">
          <button
            id="nav-home-dt"
            onClick={() => handleNavigate('home')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'home' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Home
          </button>
          <button
            id="nav-games-dt"
            onClick={() => handleNavigate('games')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'games' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Arcade
          </button>
          <button
            id="nav-messages-dt"
            onClick={() => handleNavigate('messages')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'messages' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Chat
          </button>
          <button
            id="nav-achievements-dt"
            onClick={() => handleNavigate('achievements')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'achievements' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Badges
          </button>
          <button
            id="nav-leaderboard-dt"
            onClick={() => handleNavigate('leaderboard')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'leaderboard' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> Hall of Fame
          </button>
          <button
            id="nav-profile-dt"
            onClick={() => handleNavigate('profile')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'profile' ? currentTheme.primary : 'hover:text-[#FF6B6B] text-[#9A8C98]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile
          </button>
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mute Toggle */}
          <button
            id="global-mute-toggle"
            onClick={toggleMute}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-600 hover:text-pink-600 cursor-pointer"
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />}
          </button>

          {/* Notifications List Bell */}
          <div className="relative">
            <button
              id="global-notif-bell"
              onClick={() => { setShowNotificationsList(!showNotificationsList); playSound('click'); }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-600 hover:text-pink-600 cursor-pointer relative"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotificationsList && (
              <div className="absolute right-0 mt-2.5 w-64 sm:w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50 animate-pop text-left">
                <div className="flex justify-between items-center pb-2 border-b mb-2">
                  <span className="text-xs font-extrabold text-gray-800">Notifications Log</span>
                  <button
                    onClick={() => setShowNotificationsList(false)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 font-bold"
                  >
                    Close
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic text-center py-4">No recent events.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2 bg-pink-50/40 rounded-xl text-[10px] border border-pink-100/30 flex justify-between items-start gap-1"
                      >
                        <span className="text-gray-700 leading-snug">{notif.text}</span>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-gray-300 hover:text-gray-500 text-xs shrink-0 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Profile & Partner Online Quick Indicator */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Active User */}
            <button
              id="active-profile-indicator"
              onClick={() => handleNavigate('profile')}
              className="flex items-center gap-1 bg-white border border-pink-100 sm:border-2 shadow-sm rounded-full p-1 sm:py-1 sm:pl-1.5 sm:pr-2.5 hover:scale-102 transition-transform cursor-pointer"
              title="View my profile"
            >
              <span className="text-base sm:text-lg select-none">{activeUser.avatar}</span>
              <span className="text-[10px] font-black text-gray-700 hidden sm:inline-block">
                {activeUser.nickname}
              </span>
            </button>

            {/* Partner Connection Badge with Live Status */}
            {partnerUser ? (
              <button
                onClick={() => handleNavigate('profile')}
                className="flex items-center gap-1 bg-white border border-pink-100 sm:border-2 shadow-sm rounded-full p-1 sm:py-1 sm:pl-1.5 sm:pr-2.5 hover:scale-102 transition-transform cursor-pointer relative"
                title={`${partnerUser.nickname} is ${partnerOnline ? 'Online' : 'Offline'}`}
              >
                <span className="text-base sm:text-lg select-none">{partnerUser.avatar}</span>
                <span className="text-[10px] font-black text-gray-700 hidden sm:inline-block mr-1">
                  {partnerUser.nickname}
                </span>
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white ${
                  partnerOnline ? 'bg-[#4CAF50] animate-pulse' : 'bg-gray-300'
                }`} />
              </button>
            ) : (
              <button
                onClick={() => handleNavigate('profile')}
                className="flex items-center gap-0.5 bg-pink-50 border border-pink-100 sm:border-2 shadow-sm rounded-full py-1 px-2.5 sm:px-3 hover:scale-102 transition-all cursor-pointer text-pink-600 font-black text-[9px] sm:text-[10px] uppercase tracking-wider"
                title="Connect with a partner"
              >
                <span>🔗</span> <span className="hidden xs:inline">Link Partner</span><span className="inline xs:hidden">Link</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT STAGE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8 z-10 flex flex-col justify-start relative">
        
        {/* TAB 1: LANDING HOME HERO SECTION */}
        {activeTab === 'home' && (
          <div id="home-view" className="space-y-12 max-w-4xl mx-auto text-center w-full my-auto animate-fade-in">
            {/* Welcoming Hero Section */}
            <div className="space-y-4">
              {/* Easter Egg Trigger Title */}
              <button
                id="easter-egg-title-trigger"
                onClick={triggerHeartsRain}
                className="inline-flex items-center gap-1 text-xs font-black bg-rose-100 text-rose-700 px-3.5 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-sm cursor-pointer border border-rose-200"
              >
                <Sparkles className="w-3 h-3 text-rose-500" /> Tap for Magic Rain!
              </button>

              <h2 className="text-3xl sm:text-5xl font-black text-gray-800 tracking-tight leading-tight select-none">
                Welcome to <br /> Game of Friends <span className="text-rose-500 inline-block animate-pulse">❤️</span>
              </h2>
              <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                "A place where we can play, laugh, and leave little surprises for each other."
              </p>
            </div>

            {/* Core Buttons Launcher Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <button
                id="launch-arcade-grid"
                onClick={() => handleNavigate('games')}
                className="p-6 bg-white border border-pink-100 rounded-3xl text-center shadow-sm hover:scale-[1.03] hover:shadow transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <span className="text-4xl group-hover:animate-bounce-slow">🎮</span>
                <span className="font-extrabold text-sm text-gray-800">Play Games</span>
                <span className="text-[10px] text-gray-400">6 cozy arcade games</span>
              </button>

              <button
                id="launch-messages-grid"
                onClick={() => handleNavigate('messages')}
                className="p-6 bg-white border border-pink-100 rounded-3xl text-center shadow-sm hover:scale-[1.03] hover:shadow transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group animate-pulse-slow"
              >
                <span className="text-4xl group-hover:scale-110 duration-200">💌</span>
                <span className="font-extrabold text-sm text-gray-800">Messages</span>
                <span className="text-[10px] text-gray-400">Stickers, GIFs & Capsule</span>
              </button>

              <button
                id="launch-achievements-grid"
                onClick={() => handleNavigate('achievements')}
                className="p-6 bg-white border border-pink-100 rounded-3xl text-center shadow-sm hover:scale-[1.03] hover:shadow transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <span className="text-4xl group-hover:rotate-12 duration-200">🏆</span>
                <span className="font-extrabold text-sm text-gray-800">Achievements</span>
                <span className="text-[10px] text-gray-400">Badge room & progress</span>
              </button>

              <button
                id="launch-hall-grid"
                onClick={() => handleNavigate('leaderboard')}
                className="p-6 bg-white border border-pink-100 rounded-3xl text-center shadow-sm hover:scale-[1.03] hover:shadow transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <span className="text-4xl group-hover:scale-110 duration-200">👑</span>
                <span className="font-extrabold text-sm text-gray-800">Hall of Fame</span>
                <span className="text-[10px] text-gray-400">Friendly couple stats</span>
              </button>
            </div>

            {/* Quick Daily Question Promo card */}
            <div className="max-w-xl mx-auto p-5 bg-white/70 backdrop-blur-sm rounded-3xl border border-pink-100/50 shadow-sm text-left flex flex-col sm:flex-row items-center gap-4">
              <span className="text-4xl select-none">💬</span>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[9px] font-extrabold text-pink-500 uppercase tracking-widest block mb-0.5">Bonding Quest</span>
                <h4 className="font-bold text-xs text-gray-800 leading-normal">{todayQuestion.question}</h4>
                <p className="text-[10px] text-gray-400 mt-1">Answer to reveal each other's hidden answers!</p>
              </div>
              <button
                id="go-bonding-btn"
                onClick={() => handleNavigate('messages')}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-xs shrink-0 shadow-sm transition-all active:scale-95"
              >
                Go Answer 💕
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GAMES HUB ARCADE */}
        {activeTab === 'games' && (
          <GameHub
            activeUser={activeUser}
            partnerUser={partnerUser || PLACEHOLDER_PARTNER}
            onRecordGame={recordGamePlayed}
            onUpdateSnakeScore={updateSnakeHighScore}
            onUpdateReactionTime={updateReactionTime}
            onUnlockAchievement={unlockAchievement}
          />
        )}

        {/* TAB 3: SECRET PRIVATE PORTAL MESSAGES */}
        {activeTab === 'messages' && (
          <MessagesSection
            messages={messages}
            activeUser={activeUser}
            partnerUser={partnerUser || PLACEHOLDER_PARTNER}
            dailyQuestion={todayQuestion}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onClearMessages={clearMessages}
            onAddReaction={addReaction}
            onReplyToMessage={replyToMessage}
            onAnswerQuestion={answerDailyQuestion}
          />
        )}

        {/* TAB 4: ACHIEVEMENTS TROPHY ROOM */}
        {activeTab === 'achievements' && (
          <AchievementsSection activeUser={activeUser} />
        )}

        {/* TAB 5: LEADERBOARDS STATS */}
        {activeTab === 'leaderboard' && (
          <LeaderboardSection
            leaderboard={leaderboard}
            activeUser={activeUser}
            partnerUser={partnerUser || PLACEHOLDER_PARTNER}
          />
        )}

        {/* TAB 6: PROFILES & COIN SHOP */}
        {activeTab === 'profile' && (
          <ProfileSection
            profiles={profiles}
            activeUser={activeUser}
            partnerUser={partnerUser}
            partnerOnline={partnerOnline}
            activeTheme={activeTheme}
            onLinkPartner={linkPartner}
            onLogout={logout}
            onUpdateNickname={updateNickname}
            onUpdateAvatar={updateAvatar}
            onChangeTheme={changeTheme}
            onSpendCoins={spendCoins}
            onAddCoins={addCoins}
            onAddNotification={addNotification}
          />
        )}
      </main>

      {/* FIXED FOOTER NAVIGATION BAR (MOBILE ONLY) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-100 p-2 flex justify-around items-center z-40 shadow-lg">
        <button
          id="nav-home-mob"
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Home</span>
        </button>

        <button
          id="nav-games-mob"
          onClick={() => handleNavigate('games')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'games' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <Gamepad2 className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Arcade</span>
        </button>

        <button
          id="nav-messages-mob"
          onClick={() => handleNavigate('messages')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'messages' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <Mail className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Chat</span>
        </button>

        <button
          id="nav-leaderboard-mob"
          onClick={() => handleNavigate('leaderboard')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'leaderboard' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <Crown className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Hall</span>
        </button>

        <button
          id="nav-achievements-mob"
          onClick={() => handleNavigate('achievements')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'achievements' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <Award className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Badges</span>
        </button>

        <button
          id="nav-profile-mob"
          onClick={() => handleNavigate('profile')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'profile' ? 'text-pink-600' : 'text-gray-400'}`}
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[9px] font-black mt-0.5">Me</span>
        </button>
      </footer>
    </div>
  );
}
