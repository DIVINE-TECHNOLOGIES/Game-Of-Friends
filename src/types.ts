export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string; // emoji or key
  favoriteGame: string;
  gamesPlayed: number;
  messagesSent: number;
  achievements: string[]; // ids of unlocked achievements
  level: number;
  xp: number;
  coins: number;
  loginStreak: number;
  lastLoginDate: string; // YYYY-MM-DD
  themeColor: 'pink' | 'purple' | 'blue' | 'cream' | 'dark';
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageReply {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'sticker' | 'gif';
  createdAt: string;
  reactions: MessageReaction[];
  replies: MessageReply[];
  isSurprise?: boolean;
  revealAt?: string; // YYYY-MM-DD HH:mm or just date
  isReadByOther?: boolean;
}

export interface DailyQuestion {
  id: string;
  question: string;
  answers: {
    [userId: string]: {
      answer: string;
      createdAt: string;
    };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or lucide icon name
  badgeColor: string;
  xpReward: number;
}

export interface LeaderboardStats {
  highestSnakeScore: { name: string; score: number }[];
  fastestReactionTime: { name: string; time: number }[]; // in ms
  mostGamesWon: { name: string; count: number }[];
  mostMessagesSent: { name: string; count: number }[];
  longestLoginStreak: { name: string; count: number }[];
}

export interface GameSkin {
  id: string;
  name: string;
  type: 'emoji' | 'color';
  value: string;
  cost: number;
}
