import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// In-Memory Database State with persistent backup to db.json
interface User {
  id: string;
  username: string;
  password?: string;
  nickname: string;
  avatar: string;
  favoriteGame: string;
  gamesPlayed: number;
  messagesSent: number;
  achievements: string[];
  level: number;
  xp: number;
  coins: number;
  loginStreak: number;
  lastLoginDate: string;
  themeColor: 'pink' | 'purple' | 'blue' | 'cream' | 'dark';
  partnerId?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'sticker' | 'gif';
  createdAt: string;
  reactions: { emoji: string; userIds: string[] }[];
  replies: { id: string; senderId: string; senderName: string; content: string; createdAt: string }[];
  isSurprise?: boolean;
  revealAt?: string;
}

interface DailyQuestion {
  id: string;
  question: string;
  answers: {
    [userId: string]: {
      answer: string;
      createdAt: string;
    };
  };
}

interface LeaderboardStats {
  highestSnakeScore: { name: string; score: number }[];
  fastestReactionTime: { name: string; time: number }[];
  mostGamesWon: { name: string; count: number }[];
  mostMessagesSent: { name: string; count: number }[];
  longestLoginStreak: { name: string; count: number }[];
}

interface DBState {
  users: Record<string, User>;
  messages: Message[];
  dailyQuestions: DailyQuestion[];
  leaderboard: LeaderboardStats;
}

const DEFAULT_LEADERBOARD: LeaderboardStats = {
  highestSnakeScore: [],
  fastestReactionTime: [],
  mostGamesWon: [],
  mostMessagesSent: [],
  longestLoginStreak: []
};

const INITIAL_MESSAGES: Message[] = [];

let db: DBState = {
  users: {},
  messages: INITIAL_MESSAGES,
  dailyQuestions: [
    {
      id: 'q_default',
      question: "What is your absolute favorite memory together? 🌸",
      answers: {}
    }
  ],
  leaderboard: DEFAULT_LEADERBOARD
};

// Load database from file
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      
      // If we are starting fresh and the old mock data is present in db.json, let's wipe it
      if (db.users && (db.users.user1 || Object.values(db.users).some(u => u.username === 'ayan'))) {
        console.log('Detected pre-existing mock users. Resetting database to an empty state as requested!');
        db = {
          users: {},
          messages: [],
          dailyQuestions: [
            {
              id: 'q_default',
              question: "What is your absolute favorite memory together? 🌸",
              answers: {}
            }
          ],
          leaderboard: {
            highestSnakeScore: [],
            fastestReactionTime: [],
            mostGamesWon: [],
            mostMessagesSent: [],
            longestLoginStreak: []
          }
        };
        saveDB();
      }
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to initial state', err);
  }
}

// Save database to file
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file', err);
  }
}

loadDB();

// Active heartbeats map to track online status
const userHeartbeats: Record<string, number> = {};

// Helper to determine online status
function isUserOnline(userId: string): boolean {
  const lastActive = userHeartbeats[userId];
  if (!lastActive) return false;
  return Date.now() - lastActive < 12000; // active in the last 12 seconds
}

/* ================== API ENDPOINTS ================== */

// Heartbeat & Online Ping
app.post('/api/sync/heartbeat', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }
  
  userHeartbeats[userId] = Date.now();
  
  // Find partner online status
  const user = db.users[userId];
  let partnerOnline = false;
  let partnerNickname = '';
  
  if (user && user.partnerId) {
    partnerOnline = isUserOnline(user.partnerId);
    const partner = db.users[user.partnerId];
    if (partner) {
      partnerNickname = partner.nickname;
    }
  }
  
  res.json({
    online: true,
    partnerOnline,
    partnerNickname
  });
});

// Signup Endpoint (Dual profile registration with shared password)
app.post('/api/auth/signup', (req, res) => {
  const {
    username,
    partnerUsername,
    password,
    nickname,
    partnerNickname,
    avatar,
    partnerAvatar,
    favoriteGame
  } = req.body;

  if (!username || !partnerUsername || !password || !nickname || !partnerNickname) {
    res.status(400).json({ error: 'All fields (usernames, nicknames, and password) are required!' });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPartnerUsername = partnerUsername.trim().toLowerCase();

  if (normalizedUsername === normalizedPartnerUsername) {
    res.status(400).json({ error: "Your username and friend's username must be different!" });
    return;
  }

  // Check if either username already exists
  const existsUser = Object.values(db.users).some(u => u.username === normalizedUsername);
  const existsPartner = Object.values(db.users).some(u => u.username === normalizedPartnerUsername);

  if (existsUser) {
    res.status(400).json({ error: `Username "${username}" is already taken!` });
    return;
  }
  if (existsPartner) {
    res.status(400).json({ error: `Friend's username "${partnerUsername}" is already taken!` });
    return;
  }

  const userId = `u_self_${Date.now()}`;
  const partnerId = `u_friend_${Date.now() + 1}`;

  const newUser: User = {
    id: userId,
    username: normalizedUsername,
    password,
    nickname: nickname.trim(),
    avatar: avatar || '🐰',
    favoriteGame: favoriteGame || 'Memory Card Game',
    gamesPlayed: 0,
    messagesSent: 0,
    achievements: [],
    level: 1,
    xp: 0,
    coins: 100,
    loginStreak: 1,
    lastLoginDate: new Date().toISOString().split('T')[0],
    themeColor: 'pink',
    partnerId: partnerId
  };

  const newPartner: User = {
    id: partnerId,
    username: normalizedPartnerUsername,
    password,
    nickname: partnerNickname.trim(),
    avatar: partnerAvatar || '🐱',
    favoriteGame: 'Heart Collector',
    gamesPlayed: 0,
    messagesSent: 0,
    achievements: [],
    level: 1,
    xp: 0,
    coins: 100,
    loginStreak: 0,
    lastLoginDate: '',
    themeColor: 'purple',
    partnerId: userId
  };

  db.users[userId] = newUser;
  db.users[partnerId] = newPartner;

  // Add a cozy automated system welcome message in their chat
  const welcomeMsg: Message = {
    id: `m_welcome_${Date.now()}`,
    senderId: 'system',
    senderName: 'Friendship Engine ✨',
    content: `Welcome to Game of Friends, ${newUser.nickname} and ${newPartner.nickname}! Your safe-space and shared playground is ready. Play games together, share messages, and complete daily questions! ❤️`,
    type: 'text',
    createdAt: new Date().toISOString(),
    reactions: [],
    replies: []
  };
  db.messages.push(welcomeMsg);

  saveDB();

  // Strip password
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, user: userWithoutPassword });
});

// Login Endpoint (Supports on-demand demo user bootstrapping)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required!' });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();

  // If demo users are requested but do not exist in db, we auto-create them on the fly!
  if ((normalizedUsername === 'ayan' || normalizedUsername === 'aulia') && password === 'love') {
    const ayanExists = Object.values(db.users).some(u => u.username === 'ayan');
    const auliaExists = Object.values(db.users).some(u => u.username === 'aulia');
    
    if (!ayanExists || !auliaExists) {
      console.log('Bootstrapping Ayan and Aulia demo accounts on-demand...');
      const user1Id = 'user1';
      const user2Id = 'user2';
      
      db.users[user1Id] = {
        id: user1Id,
        username: 'ayan',
        password: 'love',
        nickname: 'Ayan ❤️',
        avatar: '🐰',
        favoriteGame: 'Memory Card Game',
        gamesPlayed: 14,
        messagesSent: 25,
        achievements: ['msg_1', 'play_1'],
        level: 3,
        xp: 45,
        coins: 180,
        loginStreak: 3,
        lastLoginDate: new Date().toISOString().split('T')[0],
        themeColor: 'pink',
        partnerId: user2Id
      };
      
      db.users[user2Id] = {
        id: user2Id,
        username: 'aulia',
        password: 'love',
        nickname: 'Aulia ✨',
        avatar: '🐱',
        favoriteGame: 'Heart Collector',
        gamesPlayed: 18,
        messagesSent: 34,
        achievements: ['msg_1', 'play_1', 'msg_10'],
        level: 4,
        xp: 80,
        coins: 240,
        loginStreak: 4,
        lastLoginDate: new Date().toISOString().split('T')[0],
        themeColor: 'purple',
        partnerId: user1Id
      };

      db.messages = [
        {
          id: 'm1',
          senderId: 'user1',
          senderName: 'Ayan ❤️',
          content: 'Welcome to Game of Friends! I built this space just for us. 🥰',
          type: 'text',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          reactions: [{ emoji: '❤️', userIds: ['user2'] }],
          replies: []
        },
        {
          id: 'm2',
          senderId: 'user2',
          senderName: 'Aulia ✨',
          content: 'Oh my goodness, this is the cutest thing ever! I love it so much 💖😭',
          type: 'text',
          createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
          reactions: [{ emoji: '🥰', userIds: ['user1'] }],
          replies: []
        }
      ];

      db.leaderboard = {
        highestSnakeScore: [
          { name: 'Ayan ❤️', score: 12 },
          { name: 'Aulia ✨', score: 14 }
        ],
        fastestReactionTime: [
          { name: 'Ayan ❤️', time: 320 },
          { name: 'Aulia ✨', time: 290 }
        ],
        mostGamesWon: [
          { name: 'Ayan ❤️', count: 5 },
          { name: 'Aulia ✨', count: 7 }
        ],
        mostMessagesSent: [
          { name: 'Ayan ❤️', count: 8 },
          { name: 'Aulia ✨', count: 12 }
        ],
        longestLoginStreak: [
          { name: 'Ayan ❤️', count: 3 },
          { name: 'Aulia ✨', count: 4 }
        ]
      };

      saveDB();
    }
  }

  const user = Object.values(db.users).find(u => u.username === normalizedUsername && u.password === password);

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password!' });
    return;
  }

  // Record login activity & update streak
  const today = new Date().toISOString().split('T')[0];
  if (user.lastLoginDate !== today) {
    let newStreak = 1;
    if (user.lastLoginDate) {
      const lastDate = new Date(user.lastLoginDate);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = user.loginStreak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }
    user.loginStreak = newStreak;
    user.coins += 20; // daily coins reward
    user.lastLoginDate = today;
  }

  userHeartbeats[user.id] = Date.now();
  saveDB();

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Link Partner
app.post('/api/auth/partner/link', (req, res) => {
  const { userId, partnerUsername } = req.body;

  if (!userId || !partnerUsername) {
    res.status(400).json({ error: 'User ID and partner username are required' });
    return;
  }

  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const targetPartner = Object.values(db.users).find(
    u => u.username === partnerUsername.trim().toLowerCase()
  );

  if (!targetPartner) {
    res.status(404).json({ error: 'Partner username not found! Please check spelling.' });
    return;
  }

  if (targetPartner.id === userId) {
    res.status(400).json({ error: 'You cannot link with yourself!' });
    return;
  }

  // Set link bidirectional
  user.partnerId = targetPartner.id;
  targetPartner.partnerId = user.id;
  saveDB();

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword, partnerNickname: targetPartner.nickname });
});

// Full Sync Fetch API
app.get('/api/sync', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: 'Missing userId query param' });
    return;
  }

  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }

  // Update heartbeat
  userHeartbeats[userId] = Date.now();

  const partner = user.partnerId ? db.users[user.partnerId] : null;

  // Filter messages that belong to this couple (if linked)
  let filteredMessages = db.messages;
  if (user.partnerId) {
    const coupleIds = [user.id, user.partnerId];
    filteredMessages = db.messages.filter(m => 
      coupleIds.includes(m.senderId) || m.senderId === 'system'
    );
  } else {
    // If no partner yet, show only system messages and own messages
    filteredMessages = db.messages.filter(m => m.senderId === user.id || m.senderId === 'system');
  }

  const partnerOnline = user.partnerId ? isUserOnline(user.partnerId) : false;

  res.json({
    user,
    partner: partner ? {
      id: partner.id,
      nickname: partner.nickname,
      avatar: partner.avatar,
      level: partner.level,
      xp: partner.xp,
      coins: partner.coins,
      loginStreak: partner.loginStreak,
      favoriteGame: partner.favoriteGame,
      gamesPlayed: partner.gamesPlayed,
      messagesSent: partner.messagesSent,
      achievements: partner.achievements,
      themeColor: partner.themeColor
    } : null,
    partnerOnline,
    messages: filteredMessages,
    dailyQuestions: db.dailyQuestions,
    leaderboard: db.leaderboard
  });
});

// Post message
app.post('/api/sync/message', (req, res) => {
  const { senderId, content, type, isSurprise, revealAt } = req.body;
  const user = db.users[senderId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const newMsg: Message = {
    id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    senderId,
    senderName: user.nickname,
    content,
    type: type || 'text',
    createdAt: new Date().toISOString(),
    reactions: [],
    replies: [],
    isSurprise,
    revealAt
  };

  db.messages.push(newMsg);
  
  // Increment message count
  user.messagesSent += 1;
  saveDB();

  res.json({ success: true, message: newMsg, user });
});

// React to message
app.post('/api/sync/message/reaction', (req, res) => {
  const { userId, messageId, emoji } = req.body;
  const message = db.messages.find(m => m.id === messageId);
  if (!message) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  const reactionIdx = message.reactions.findIndex(r => r.emoji === emoji);
  if (reactionIdx > -1) {
    const userIds = message.reactions[reactionIdx].userIds;
    if (userIds.includes(userId)) {
      message.reactions[reactionIdx].userIds = userIds.filter(id => id !== userId);
      if (message.reactions[reactionIdx].userIds.length === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji);
      }
    } else {
      message.reactions[reactionIdx].userIds.push(userId);
    }
  } else {
    message.reactions.push({ emoji, userIds: [userId] });
  }

  saveDB();
  res.json({ success: true, message });
});

// Reply to message
app.post('/api/sync/message/reply', (req, res) => {
  const { userId, messageId, replyContent } = req.body;
  const user = db.users[userId];
  const message = db.messages.find(m => m.id === messageId);
  if (!user || !message) {
    res.status(404).json({ error: 'User or Message not found' });
    return;
  }

  const newReply = {
    id: `rep_${Date.now()}`,
    senderId: userId,
    senderName: user.nickname,
    content: replyContent,
    createdAt: new Date().toISOString()
  };

  message.replies.push(newReply);
  saveDB();

  res.json({ success: true, message });
});

// Edit message
app.post('/api/sync/message/edit', (req, res) => {
  const { userId, messageId, content } = req.body;
  const message = db.messages.find(m => m.id === messageId && m.senderId === userId);
  if (!message) {
    res.status(404).json({ error: 'Message not found or unauthorized' });
    return;
  }

  message.content = content;
  saveDB();
  res.json({ success: true, message });
});

// Delete message
app.post('/api/sync/message/delete', (req, res) => {
  const { userId, messageId } = req.body;
  const index = db.messages.findIndex(m => m.id === messageId && m.senderId === userId);
  if (index === -1) {
    res.status(404).json({ error: 'Message not found or unauthorized' });
    return;
  }

  db.messages.splice(index, 1);
  saveDB();
  res.json({ success: true });
});

// Clear all messages
app.post('/api/sync/message/clear', (req, res) => {
  const { userId } = req.body;
  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const coupleIds = [user.id];
  if (user.partnerId) {
    coupleIds.push(user.partnerId);
  }

  db.messages = db.messages.filter(m => {
    const isFromCouple = coupleIds.includes(m.senderId);
    const isSystemMessage = m.senderId === 'system' && (
      m.content.includes(user.nickname) || 
      (user.partnerId && m.content.includes(db.users[user.partnerId]?.nickname || ''))
    );
    return !isFromCouple && !isSystemMessage;
  });

  saveDB();
  res.json({ success: true });
});

// Answer Daily Question
app.post('/api/sync/question', (req, res) => {
  const { userId, questionId, answerText } = req.body;
  let question = db.dailyQuestions.find(q => q.id === questionId);
  
  if (!question) {
    // Lazy create question
    question = {
      id: questionId,
      question: "What's your dream vacation spot together? 🌍",
      answers: {}
    };
    db.dailyQuestions.push(question);
  }

  question.answers[userId] = {
    answer: answerText,
    createdAt: new Date().toISOString()
  };

  // Grant reward
  const user = db.users[userId];
  if (user) {
    user.xp += 30;
    user.coins += 10;
    if (user.xp >= 100) {
      user.level += Math.floor(user.xp / 100);
      user.xp = user.xp % 100;
    }
  }

  saveDB();
  res.json({ success: true, dailyQuestions: db.dailyQuestions, user });
});

// Record Game Played
app.post('/api/sync/game', (req, res) => {
  const { userId, gameName, won, snakeScore, reactionTime, unlockAchievementId } = req.body;
  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.gamesPlayed += 1;
  user.xp += 20;
  user.coins += 5;

  if (unlockAchievementId && !user.achievements.includes(unlockAchievementId)) {
    user.achievements.push(unlockAchievementId);
  }

  if (user.xp >= 100) {
    user.level += Math.floor(user.xp / 100);
    user.xp = user.xp % 100;
  }

  // Update Snake High score
  if (snakeScore !== undefined) {
    const existing = db.leaderboard.highestSnakeScore.find(i => i.name === user.nickname);
    if (existing) {
      if (snakeScore > existing.score) {
        existing.score = snakeScore;
      }
    } else {
      db.leaderboard.highestSnakeScore.push({ name: user.nickname, score: snakeScore });
    }
    db.leaderboard.highestSnakeScore.sort((a, b) => b.score - a.score);
  }

  // Update Reaction Time
  if (reactionTime !== undefined) {
    const existing = db.leaderboard.fastestReactionTime.find(i => i.name === user.nickname);
    if (existing) {
      if (reactionTime < existing.time) {
        existing.time = reactionTime;
      }
    } else {
      db.leaderboard.fastestReactionTime.push({ name: user.nickname, time: reactionTime });
    }
    db.leaderboard.fastestReactionTime.sort((a, b) => a.time - b.time);
  }

  // Update game wins leaderboard
  if (won) {
    const existing = db.leaderboard.mostGamesWon.find(i => i.name === user.nickname);
    if (existing) {
      existing.count += 1;
    } else {
      db.leaderboard.mostGamesWon.push({ name: user.nickname, count: 1 });
    }
    db.leaderboard.mostGamesWon.sort((a, b) => b.count - a.count);
  }

  saveDB();
  res.json({ success: true, user, leaderboard: db.leaderboard });
});

// Update Profile Detail
app.post('/api/sync/profile', (req, res) => {
  const { userId, nickname, avatar, themeColor, spendCoinsAmount } = req.body;
  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (nickname) user.nickname = nickname;
  if (avatar) user.avatar = avatar;
  if (themeColor) user.themeColor = themeColor;
  if (spendCoinsAmount !== undefined) {
    if (user.coins >= spendCoinsAmount) {
      user.coins -= spendCoinsAmount;
    } else {
      res.status(400).json({ error: 'Insufficient coins' });
      return;
    }
  }

  saveDB();
  res.json({ success: true, user });
});

/* ================== VITE MIDDLEWARE SETUP ================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
