import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, Smile, Gamepad2, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface AuthScreenProps {
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    partnerUsername: string,
    password: string,
    nickname: string,
    partnerNickname: string,
    avatar: string,
    partnerAvatar: string,
    favoriteGame: string
  ) => Promise<boolean>;
  authError: string | null;
  isAuthenticating: boolean;
}

const AVATAR_OPTIONS = ['🐰', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐣', '🦄'];
const GAME_OPTIONS = ['Memory Card Game', 'Heart Collector', 'Retro Snake', 'Tic Tac Toe', 'Reaction speed'];

export default function AuthScreen({ login, signup, authError, isAuthenticating }: AuthScreenProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐰');
  const [selectedGame, setSelectedGame] = useState('Memory Card Game');
  
  // Friend's signup states
  const [partnerUsername, setPartnerUsername] = useState('');
  const [partnerNickname, setPartnerNickname] = useState('');
  const [partnerSelectedAvatar, setPartnerSelectedAvatar] = useState('🐱');

  const [localError, setLocalError] = useState<string | null>(null);

  const handleTabChange = (isLogin: boolean) => {
    setIsLoginTab(isLogin);
    setLocalError(null);
    playSound('click');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (isLoginTab) {
      if (!trimmedUsername || !trimmedPassword) {
        setLocalError('Please enter both username and password!');
        return;
      }
      await login(trimmedUsername, trimmedPassword);
    } else {
      const trimmedPartnerUsername = partnerUsername.trim();
      const trimmedNickname = nickname.trim() || trimmedUsername;
      const trimmedPartnerNickname = partnerNickname.trim() || trimmedPartnerUsername;

      if (!trimmedUsername || !trimmedPartnerUsername || !trimmedPassword || !trimmedNickname || !trimmedPartnerNickname) {
        setLocalError('All usernames, nicknames, and the shared password are required!');
        return;
      }

      if (trimmedUsername.toLowerCase() === trimmedPartnerUsername.toLowerCase()) {
        setLocalError("Your username and your friend's username must be different!");
        return;
      }

      await signup(
        trimmedUsername,
        trimmedPartnerUsername,
        trimmedPassword,
        trimmedNickname,
        trimmedPartnerNickname,
        selectedAvatar,
        partnerSelectedAvatar,
        selectedGame
      );
    }
  };

  const handleDemoLogin = async (user: 'ayan' | 'aulia') => {
    playSound('click');
    if (user === 'ayan') {
      await login('ayan', 'love');
    } else {
      await login('aulia', 'love');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDE2E4] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FFD1DC]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#B2CEFE]/30 blur-3xl pointer-events-none" />

      {/* Main Container - Expands nicely during signup */}
      <div className={`w-full ${isLoginTab ? 'max-w-md' : 'max-w-xl'} z-10 transition-all duration-300`}>
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white border-4 border-white shadow-lg mb-2 animate-bounce">
            <span className="text-2xl">❤️</span>
          </div>
          <h1 className="text-3xl font-black text-[#FF6B6B] tracking-tight drop-shadow-sm">
            Game of Friends
          </h1>
          <p className="text-[10px] text-[#9A8C98] mt-1 font-bold uppercase tracking-wider">
            Your shared playground, arcade & safe-space
          </p>
        </div>

        {/* Card */}
        <div className="bold-card p-5 md:p-7 bg-white/90 backdrop-blur-md rounded-[32px] border-4 border-white shadow-xl">
          
          {/* Tabs */}
          <div className="flex bg-[#FFF0F2] rounded-2xl p-1 mb-5 border-2 border-white">
            <button
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isLoginTab
                  ? 'bg-[#FF6B6B] text-white shadow-md'
                  : 'text-[#9A8C98] hover:text-[#FF6B6B]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                !isLoginTab
                  ? 'bg-[#FF6B6B] text-white shadow-md'
                  : 'text-[#9A8C98] hover:text-[#FF6B6B]'
              }`}
            >
              Sign Up Together
            </button>
          </div>

          {/* Errors */}
          {(localError || authError) && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-100 text-red-600 rounded-xl text-xs font-bold text-center">
              ⚠️ {localError || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isLoginTab ? (
              // Login Fields
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#9A8C98] mb-1.5 ml-1">
                    Your Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C98]">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ayan"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFF5E1]/30 border-2 border-[#FFE5EC] rounded-2xl text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#FF6B6B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#9A8C98] mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C98]">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFF5E1]/30 border-2 border-[#FFE5EC] rounded-2xl text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#FF6B6B] transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Dual Sign Up Fields
              <div className="space-y-5">
                <p className="text-[11px] font-bold text-[#FF6B6B] bg-[#FFF0F2] p-2.5 rounded-xl text-center border border-[#FFE5EC]">
                  🌸 Create accounts for both of you at once! You'll share a password to enter your joint playground.
                </p>

                {/* 2 Column Profile setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1: My Profile */}
                  <div className="p-4 bg-[#FFF5E1]/20 rounded-2xl border-2 border-[#FFF0F2] space-y-3">
                    <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 border-b pb-1.5 border-[#FFE5EC]">
                      <span>🏡</span> Your Profile
                    </h3>
                    
                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Your Username
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ayan"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#FFE5EC] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF6B6B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Your Nickname
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ayan ❤️"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#FFE5EC] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF6B6B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Your Avatar: {selectedAvatar}
                      </label>
                      <div className="grid grid-cols-6 gap-1 bg-white p-1.5 rounded-xl border-2 border-[#FFE5EC]">
                        {AVATAR_OPTIONS.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setSelectedAvatar(emoji); playSound('click'); }}
                            className={`text-lg p-0.5 rounded-lg transition-all hover:scale-125 cursor-pointer ${
                              selectedAvatar === emoji ? 'bg-[#FFD1DC] border' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Friend's Profile */}
                  <div className="p-4 bg-[#E2EDFF]/10 rounded-2xl border-2 border-[#E2EDFF] space-y-3">
                    <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 border-b pb-1.5 border-[#E2EDFF]">
                      <span>🤝</span> Friend's Profile
                    </h3>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Friend's Username
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. aulia"
                        value={partnerUsername}
                        onChange={(e) => setPartnerUsername(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#E2EDFF] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#4B88FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Friend's Nickname
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aulia ✨"
                        value={partnerNickname}
                        onChange={(e) => setPartnerNickname(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#E2EDFF] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#4B88FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                        Friend's Avatar: {partnerSelectedAvatar}
                      </label>
                      <div className="grid grid-cols-6 gap-1 bg-white p-1.5 rounded-xl border-2 border-[#E2EDFF]">
                        {AVATAR_OPTIONS.slice(1, 7).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setPartnerSelectedAvatar(emoji); playSound('click'); }}
                            className={`text-lg p-0.5 rounded-lg transition-all hover:scale-125 cursor-pointer ${
                              partnerSelectedAvatar === emoji ? 'bg-[#D0E2FF] border' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password and Favorite Game */}
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                      🔐 Shared Password (Used for Both)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF6B6B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-[#9A8C98] mb-1">
                      🎮 Favorite Game
                    </label>
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF6B6B]"
                    >
                      {GAME_OPTIONS.map((game) => (
                        <option key={game} value={game}>{game}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{isLoginTab ? 'Sign In to play' : 'Create Accounts Together'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-8 pt-6 border-t border-dashed border-[#FFE5EC]">
            <p className="text-center text-[11px] font-black uppercase tracking-wider text-[#9A8C98] mb-3">
              💡 Quick Test Accounts (Dual-Perspective Demo)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('ayan')}
                className="bg-[#FFE5EC] hover:bg-[#ffd6df] text-[#FF6B6B] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>🐰</span> Login Ayan
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('aulia')}
                className="bg-[#E2EDFF] hover:bg-[#d0e2ff] text-[#1e88e5] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>🐱</span> Login Aulia
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2.5 font-medium italic">
              *Pro tip: Open the app in two browser windows or tabs, log in as Ayan in one and Aulia in the other, and watch the real-time online status and chat in action!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
