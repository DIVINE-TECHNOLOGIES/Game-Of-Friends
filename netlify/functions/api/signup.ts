import type { Handler } from '@netlify/functions';

type SignupBody = {
  username?: string;
  partnerUsername?: string;
  password?: string;
  nickname?: string;
  partnerNickname?: string;
  avatar?: string;
  partnerAvatar?: string;
  favoriteGame?: string;
};

type User = {
  id: string;
  username: string;
  password: string;
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
};

type DBState = { users: Record<string, User> };

let db: DBState = { users: {} };
let initialized = false;

function seedIfNeeded() {
  if (initialized) return;
  initialized = true;
}

function normalize(s?: string) {
  return (s ?? '').trim().toLowerCase();
}

export const handler: Handler = async (event) => {
  seedIfNeeded();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: SignupBody = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    username,
    partnerUsername,
    password,
    nickname,
    partnerNickname,
    avatar,
    partnerAvatar,
    favoriteGame,
  } = body;

  if (!username || !partnerUsername || !password || !nickname || !partnerNickname) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields (usernames, nicknames, and password) are required!' }) };
  }

  const normalizedUsername = normalize(username);
  const normalizedPartnerUsername = normalize(partnerUsername);

  if (normalizedUsername === normalizedPartnerUsername) {
    return { statusCode: 400, body: JSON.stringify({ error: "Your username and friend's username must be different!" }) };
  }

  const existsUser = Object.values(db.users).some((u) => u.username === normalizedUsername);
  const existsPartner = Object.values(db.users).some((u) => u.username === normalizedPartnerUsername);

  if (existsUser) return { statusCode: 400, body: JSON.stringify({ error: `Username "${username}" is already taken!` }) };
  if (existsPartner)
    return { statusCode: 400, body: JSON.stringify({ error: `Friend's username "${partnerUsername}" is already taken!` }) };

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
    partnerId,
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
    partnerId: userId,
  };

  db.users[userId] = newUser;
  db.users[partnerId] = newPartner;

  const { password: _, ...userWithoutPassword } = newUser;
  return { statusCode: 200, body: JSON.stringify({ success: true, user: userWithoutPassword }) };
};

