import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATARS, THEME_PALETTES } from '../data/staticData';
import { playSound } from '../utils/sound';
import { Link2, LogOut, ShieldAlert, Heart, Wifi, WifiOff } from 'lucide-react';

interface ProfileSectionProps {
  profiles: UserProfile[];
  activeUser: UserProfile;
  partnerUser: UserProfile | null;
  partnerOnline: boolean;
  activeTheme: string;
  onLinkPartner: (username: string) => Promise<boolean>;
  onLogout: () => void;
  onUpdateNickname: (userId: string, name: string) => void;
  onUpdateAvatar: (userId: string, emoji: string) => void;
  onChangeTheme: (theme: 'pink' | 'purple' | 'blue' | 'cream' | 'dark') => void;
  onSpendCoins: (amount: number) => Promise<boolean>;
  onAddCoins: (amount: number) => void;
  onAddNotification: (text: string) => void;
}

export default function ProfileSection({
  activeUser,
  partnerUser,
  partnerOnline,
  activeTheme,
  onLinkPartner,
  onLogout,
  onUpdateNickname,
  onUpdateAvatar,
  onChangeTheme,
  onSpendCoins,
  onAddNotification,
}: ProfileSectionProps) {
  const [nicknameInput, setNicknameInput] = useState<string>(activeUser.nickname);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [partnerUsernameInput, setPartnerUsernameInput] = useState<string>('');
  const [isLinking, setIsLinking] = useState<boolean>(false);

  // Track purchased/unlocked avatars
  const [unlockedAvatarIds, setUnlockedAvatarIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlocked_avatars');
    return saved ? JSON.parse(saved) : ['cat_cute', 'bunny_hug', 'bear_cozy', 'panda_sleep'];
  });

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    onUpdateNickname(activeUser.id, nicknameInput.trim());
    setIsEditingName(false);
    playSound('click');
    onAddNotification(`Nickname updated to ${nicknameInput}! ✨`);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerUsernameInput.trim()) return;
    setIsLinking(true);
    playSound('click');
    const success = await onLinkPartner(partnerUsernameInput.trim());
    setIsLinking(false);
    if (success) {
      setPartnerUsernameInput('');
    }
  };

  const handleBuyAvatar = async (avatarId: string, emoji: string, cost: number, label: string) => {
    // Check if already unlocked
    if (unlockedAvatarIds.includes(avatarId)) {
      onUpdateAvatar(activeUser.id, emoji);
      playSound('click');
      onAddNotification(`Equipped ${label}! ${emoji}`);
      return;
    }

    // Attempt to buy
    const success = await onSpendCoins(cost);
    if (success) {
      const updated = [...unlockedAvatarIds, avatarId];
      setUnlockedAvatarIds(updated);
      localStorage.setItem('unlocked_avatars', JSON.stringify(updated));
      onUpdateAvatar(activeUser.id, emoji);
      playSound('win');
      onAddNotification(`🎉 Purchased & equipped ${label}! -${cost} Coins 🪙`);
    } else {
      playSound('wrong');
      onAddNotification(`Oops! Not enough coins to unlock ${label}. Go play some games! 🧸`);
    }
  };

  const themeKeys = Object.keys(THEME_PALETTES) as ('pink' | 'purple' | 'blue' | 'cream' | 'dark')[];

  return (
    <div id="profiles-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full animate-fade-in">
      
      {/* Profile Card left columns */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Partner linking & Online Status Card */}
        <div className="bg-white rounded-3xl border-4 border-white p-6 shadow-md">
          <h3 className="font-extrabold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#FF6B6B]" />
            Your Friendship Circle
          </h3>
          
          {partnerUser ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-pink-50/30 rounded-2xl border border-pink-100/50">
              <div className="relative">
                <span className="text-5xl select-none">{partnerUser.avatar}</span>
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  partnerOnline ? 'bg-[#4CAF50] animate-pulse' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-black text-gray-800 text-base">{partnerUser.nickname}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    partnerOnline ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {partnerOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Level {partnerUser.level} • Favorite Game: {partnerUser.favoriteGame}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-[10px] text-gray-400 font-bold">
                  <span>🎮 {partnerUser.gamesPlayed} Played</span>
                  <span>💬 {partnerUser.messagesSent} Sent</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FFF5E1]/20 rounded-2xl border-2 border-[#FFE5EC] text-center sm:text-left space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFE5EC] flex items-center justify-center text-lg">
                  🤝
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-800 text-sm">Not linked with a friend yet</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Connect with your buddy or partner to share messages, unlock daily questions, and compare stats!
                  </p>
                </div>
              </div>

              {/* Form to link */}
              <form onSubmit={handleLinkSubmit} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-dashed border-[#FFE5EC]">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9A8C98]">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter partner's username"
                    value={partnerUsernameInput}
                    onChange={(e) => setPartnerUsernameInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#FFE5EC] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF6B6B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLinking ? 'Linking...' : 'Connect'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Edit Details */}
        <div className="bg-white rounded-3xl border-4 border-white p-6 shadow-md space-y-5 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm">👤 Personal Details</h3>
            {!isEditingName && (
              <button
                id="edit-nickname-toggle"
                onClick={() => { setIsEditingName(true); setNicknameInput(activeUser.nickname); playSound('click'); }}
                className="text-xs font-black text-[#FF6B6B] hover:underline cursor-pointer"
              >
                Edit Nickname
              </button>
            )}
          </div>

          {isEditingName ? (
            <form onSubmit={handleSaveNickname} className="flex gap-2">
              <input
                type="text"
                id="nickname-input-field"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={18}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:outline-none font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-black cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="bg-gray-50/50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Nickname</span>
                <span className="font-extrabold text-gray-800">{activeUser.nickname}</span>
              </div>
              <div className="bg-gray-50/50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Favorite Game</span>
                <span className="font-extrabold text-gray-800">{activeUser.favoriteGame}</span>
              </div>
              <div className="bg-gray-50/50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Games Played</span>
                <span className="font-extrabold text-gray-800">{activeUser.gamesPlayed} games</span>
              </div>
              <div className="bg-gray-50/50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Messages Sent</span>
                <span className="font-extrabold text-gray-800">{activeUser.messagesSent} messages</span>
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <span className="text-xs font-extrabold text-gray-500 block">🎨 Choose Room Theme</span>
            <div className="flex gap-2.5 flex-wrap">
              {themeKeys.map((theme) => (
                <button
                  key={theme}
                  onClick={() => onChangeTheme(theme)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeTheme === theme
                      ? 'bg-[#FFD1DC] text-[#FF6B6B] border-[#FF6B6B] scale-105 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {THEME_PALETTES[theme].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level stats, Coin Shop & Daily Rewards right column */}
      <div className="space-y-6">
        
        {/* Stats card */}
        <div className="bg-white rounded-3xl border-4 border-white p-6 shadow-md text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-[#FFD1DC] text-[#FF6B6B] rounded-full px-2.5 py-0.5 text-[10px] font-black">
            Level {activeUser.level}
          </div>

          <span className="text-4xl block mb-2 select-none">{activeUser.avatar}</span>
          <h4 className="font-extrabold text-gray-800 text-sm mb-1">{activeUser.nickname}</h4>
          
          {/* XP Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400 mb-1">
              <span>Experience Points</span>
              <span>{activeUser.xp} / 100 XP</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                style={{ width: `${activeUser.xp}%` }}
              />
            </div>
          </div>

          <div className="flex justify-around items-center mt-5 pt-4 border-t border-gray-100 text-center">
            <div>
              <span className="text-sm font-extrabold text-gray-800 block">🪙 {activeUser.coins}</span>
              <span className="text-[10px] text-gray-400 font-bold">Golden Coins</span>
            </div>
            <div className="h-6 w-px bg-gray-100" />
            <div>
              <span className="text-sm font-extrabold text-gray-800 block">🔥 {activeUser.loginStreak} days</span>
              <span className="text-[10px] text-gray-400 font-bold">Login Streak</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Account
          </button>
        </div>

        {/* Shop Panel */}
        <div className="bg-[#FFF5E1] border-4 border-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="text-center">
            <span className="text-3xl block mb-1 animate-pulse">🪙</span>
            <h4 className="font-black text-[#5A5A40] text-sm">Cozy Coin Shop</h4>
            <p className="text-[10px] text-[#5A5A40]/75">Spend coins to unlock premium partner avatars!</p>
          </div>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {AVATARS.map((avatar) => {
              const isUnlocked = unlockedAvatarIds.includes(avatar.id);
              const isEquipped = activeUser.avatar === avatar.emoji;
              return (
                <div
                  key={avatar.id}
                  className="flex items-center justify-between bg-white/85 p-2.5 rounded-xl border border-white text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{avatar.emoji}</span>
                    <div className="text-left">
                      <span className="font-extrabold text-gray-700 block text-[11px]">{avatar.label}</span>
                      <span className="text-[9px] text-gray-400 font-medium">
                        {isUnlocked ? 'Unlocked' : `${avatar.cost} Coins 🪙`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyAvatar(avatar.id, avatar.emoji, avatar.cost, avatar.label)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-amber-100 text-amber-800 cursor-default shadow-none border'
                        : isUnlocked
                        ? 'bg-[#5A5A40] hover:bg-[#4a4a33] text-white'
                        : activeUser.coins >= avatar.cost
                        ? 'bg-[#FF6B6B] hover:bg-[#ff5252] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : 'Unlock'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
