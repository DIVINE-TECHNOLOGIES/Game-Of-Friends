import type { Handler } from '@netlify/functions';

type LoginBody = { username?: string; password?: string };

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

type DBState = {
  users: Record<string, User>;
};

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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body: LoginBody = {};
  try {
    body = event.body ? (JSON.parse(event.body) as LoginBody) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const username = body.username;
  const password = body.password;

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Username and password are required!' }),
    };
  }

  const normalizedUsername = normalize(username);

  if ((normalizedUsername === 'ayan' || normalizedUsername === 'aulia') && password === 'love') {
    const ayanExists = Object.values(db.users).some((u) => u.username === 'ayan');
    const auliaExists = Object.values(db.users).some((u) => u.username === 'aulia');

    if (!ayanExists || !auliaExists) {
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
        partnerId: user2Id,
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
        partnerId: user1Id,
      };
    }
  }

  const user = Object.values(db.users).find((u) => u.username === normalizedUsername && u.password === password);
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password!' }) };
  }

  const today = new Date().toISOString().split('T')[0];
  if (user.lastLoginDate !== today) {
    let newStreak = 1;
    if (user.lastLoginDate) {
      const lastDate = new Date(user.lastLoginDate);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) newStreak = user.loginStreak + 1;
      else if (diffDays > 1) newStreak = 1;
    }
    user.loginStreak = newStreak;
    user.coins += 20;
    user.lastLoginDate = today;
  }

  const { password: _, ...userWithoutPassword } = user;
  return { statusCode: 200, body: JSON.stringify({ success: true, user: userWithoutPassword }) };
};

