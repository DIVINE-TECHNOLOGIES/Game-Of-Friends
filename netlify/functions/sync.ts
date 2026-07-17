import type { Handler } from '@netlify/functions';

type DBState = {
  users: any;
  messages: any[];
  dailyQuestions: any[];
  leaderboard: any;
};

let db: DBState = {
  users: {},
  messages: [],
  dailyQuestions: [{ id: 'q_default', question: 'What is your absolute favorite memory together? 🌸', answers: {} }],
  leaderboard: {
    highestSnakeScore: [],
    fastestReactionTime: [],
    mostGamesWon: [],
    mostMessagesSent: [],
    longestLoginStreak: [],
  },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const qs = event.queryStringParameters || {};
  const userId = qs.userId;
  if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId query param' }) };

  const user = db.users[userId];
  if (!user) return { statusCode: 404, body: JSON.stringify({ error: 'User profile not found' }) };

  return {
    statusCode: 200,
    body: JSON.stringify({
      user,
      partner: user.partnerId ? { ...db.users[user.partnerId] } : null,
      partnerOnline: false,
      messages: db.messages,
      dailyQuestions: db.dailyQuestions,
      leaderboard: db.leaderboard,
    }),
  };
};

