import type { Handler } from '@netlify/functions';

type Body = { userId?: string; partnerUsername?: string };

type User = {
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
};

type DBState = { users: Record<string, User> };

let db: DBState = { users: {} };
let initialized = false;

function seedIfNeeded() {
  if (initialized) return;
  initialized = true;
}

export const handler: Handler = async (event) => {
  seedIfNeeded();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: Body = {};
  try {
    body = event.body ? (JSON.parse(event.body) as Body) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { userId, partnerUsername } = body;
  if (!userId || !partnerUsername) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User ID and partner username are required' }) };
  }

  const user = db.users[userId];
  if (!user) return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };

  const targetPartner = Object.values(db.users).find((u) => u.username === partnerUsername.trim().toLowerCase());
  if (!targetPartner) return { statusCode: 404, body: JSON.stringify({ error: 'Partner username not found! Please check spelling.' }) };
  if (targetPartner.id === userId) return { statusCode: 400, body: JSON.stringify({ error: 'You cannot link with yourself!' }) };

  user.partnerId = targetPartner.id;
  targetPartner.partnerId = user.id;

  return { statusCode: 200, body: JSON.stringify({ success: true, user, partnerNickname: targetPartner.nickname }) };
};

