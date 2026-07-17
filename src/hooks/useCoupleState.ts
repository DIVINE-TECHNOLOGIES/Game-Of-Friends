import { useState, useEffect } from 'react';
import { UserProfile, Message, DailyQuestion, LeaderboardStats } from '../types';
import { playSound } from '../utils/sound';

export function useCoupleState() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('couple_user_id');
  });
  
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserProfile | null>(null);
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats>({
    highestSnakeScore: [],
    fastestReactionTime: [],
    mostGamesWon: [],
    mostMessagesSent: [],
    longestLoginStreak: []
  });
  
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: Date }[]>([]);
  const [activeTheme, setActiveTheme] = useState<'pink' | 'purple' | 'blue' | 'cream' | 'dark'>('pink');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Sync data function
  const syncData = async (userIdToSync: string) => {
    try {
      const response = await fetch(`/api/sync?userId=${encodeURIComponent(userIdToSync)}`);
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      const data = await response.json();
      
      setActiveUser(data.user);
      setPartnerUser(data.partner);
      setPartnerOnline(data.partnerOnline);
      setMessages(data.messages);
      setDailyQuestions(data.dailyQuestions);
      setLeaderboard(data.leaderboard);
      
      if (data.user && data.user.themeColor) {
        setActiveTheme(data.user.themeColor);
      }
    } catch (err) {
      console.warn('Sync connection warning, retrying in next cycle...', err);
    }
  };

  // Poll server for updates & partner online status
  useEffect(() => {
    if (!currentUserId) {
      setActiveUser(null);
      setPartnerUser(null);
      setPartnerOnline(false);
      return;
    }

    // Immediate sync
    syncData(currentUserId);

    // Setup 4-second polling interval
    const interval = setInterval(() => {
      syncData(currentUserId);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Auth Operations
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.error || 'Login failed');
        playSound('click');
        return false;
      }
      
      localStorage.setItem('couple_user_id', data.user.id);
      setCurrentUserId(data.user.id);
      setActiveUser(data.user);
      playSound('win');
      addNotification(`Welcome back, ${data.user.nickname}! ❤️`);
      return true;
    } catch (err) {
      setAuthError('Connection failed. Is the server running?');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signup = async (
    username: string,
    partnerUsername: string,
    password: string,
    nickname: string,
    partnerNickname: string,
    avatar: string,
    partnerAvatar: string,
    favoriteGame: string
  ): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          partnerUsername,
          password,
          nickname,
          partnerNickname,
          avatar,
          partnerAvatar,
          favoriteGame
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.error || 'Signup failed');
        playSound('click');
        return false;
      }
      
      // Auto-login after signup
      return login(username, password);
    } catch (err) {
      setAuthError('Connection failed. Please check network.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const linkPartner = async (partnerUsername: string): Promise<boolean> => {
    if (!currentUserId) return false;
    try {
      const response = await fetch('/api/auth/partner/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, partnerUsername })
      });
      const data = await response.json();
      
      if (!response.ok) {
        addNotification(`⚠️ Link failed: ${data.error}`);
        playSound('click');
        return false;
      }
      
      addNotification(`🎉 Connected with ${data.partnerNickname}! Welcome to your joint world!`);
      playSound('win');
      if (currentUserId) {
        syncData(currentUserId);
      }
      return true;
    } catch (err) {
      addNotification('⚠️ Connection error linking partner.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('couple_user_id');
    setCurrentUserId(null);
    setActiveUser(null);
    setPartnerUser(null);
    setPartnerOnline(false);
    playSound('click');
  };

  // Profile operations (saves to backend)
  const updateNickname = async (userId: string, newName: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, nickname: newName })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAvatar = async (userId: string, emoji: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatar: emoji })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeTheme = async (theme: 'pink' | 'purple' | 'blue' | 'cream' | 'dark') => {
    if (!currentUserId) return;
    setActiveTheme(theme);
    playSound('click');
    try {
      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, themeColor: theme })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (text: string) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text,
      time: new Date()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const spendCoins = async (amount: number): Promise<boolean> => {
    if (!currentUserId || !activeUser || activeUser.coins < amount) return false;
    try {
      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, spendCoinsAmount: amount })
      });
      if (response.ok) {
        syncData(currentUserId);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const addCoins = async (amount: number) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, spendCoinsAmount: -amount }) // negative to add coins
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Messages Operations
  const sendMessage = async (content: string, type: 'text' | 'image' | 'sticker' | 'gif' = 'text', isSurprise = false, revealAt?: string) => {
    if (!currentUserId) return;
    
    // Optimistic fast render
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      senderId: currentUserId,
      senderName: activeUser?.nickname || 'Me',
      content,
      type,
      createdAt: new Date().toISOString(),
      reactions: [],
      replies: []
    };
    setMessages(prev => [...prev, tempMsg]);
    playSound('message');

    try {
      const response = await fetch('/api/sync/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUserId, content, type, isSurprise, revealAt })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!currentUserId) return;
    playSound('click');
    try {
      const response = await fetch('/api/sync/message/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, messageId, content: newContent })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUserId) return;
    playSound('click');
    try {
      const response = await fetch('/api/sync/message/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, messageId })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearMessages = async () => {
    if (!currentUserId) return;
    playSound('click');
    try {
      const response = await fetch('/api/sync/message/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    playSound('click');
    try {
      const response = await fetch('/api/sync/message/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, messageId, emoji })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const replyToMessage = async (messageId: string, replyContent: string) => {
    if (!currentUserId) return;
    playSound('message');
    try {
      const response = await fetch('/api/sync/message/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, messageId, replyContent })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Daily Question Operations
  const answerDailyQuestion = async (questionId: string, answerText: string) => {
    if (!currentUserId) return;
    playSound('correct');
    addNotification(`Question answered! +30 XP, +10 Coins 🪙`);
    try {
      const response = await fetch('/api/sync/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, questionId, answerText })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Game Stats Operations
  const recordGamePlayed = async (gameName: string, won = false) => {
    if (!currentUserId) return;
    playSound(won ? 'win' : 'click');
    try {
      const response = await fetch('/api/sync/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, gameName, won })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSnakeHighScore = async (score: number) => {
    if (!currentUserId) return;
    if (score >= 15) {
      addNotification(`🎉 New High Score! You got ${score} in Snake!`);
    }
    try {
      const response = await fetch('/api/sync/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, snakeScore: score })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateReactionTime = async (timeMs: number) => {
    if (!currentUserId) return;
    if (timeMs < 250) {
      addNotification(`⚡ Lightning reaction! You hit ${timeMs}ms!`);
    }
    try {
      const response = await fetch('/api/sync/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, reactionTime: timeMs })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/sync/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, unlockAchievementId: achievementId })
      });
      if (response.ok) {
        syncData(currentUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    profiles: activeUser ? [activeUser, ...(partnerUser ? [partnerUser] : [])] : [],
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
  };
}
