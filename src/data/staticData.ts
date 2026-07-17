import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'play_1',
    title: 'First Date',
    description: 'Play your first game together in our little world!',
    icon: '🎮',
    badgeColor: 'bg-pink-100 text-pink-600 border-pink-200',
    xpReward: 100,
  },
  {
    id: 'play_10',
    title: 'Co-Op Masters',
    description: 'Played 10 games together!',
    icon: '🏆',
    badgeColor: 'bg-amber-100 text-amber-600 border-amber-200',
    xpReward: 250,
  },
  {
    id: 'msg_1',
    title: 'Love Note',
    description: 'Sent your first private message!',
    icon: '💌',
    badgeColor: 'bg-red-100 text-red-600 border-red-200',
    xpReward: 100,
  },
  {
    id: 'msg_10',
    title: 'Chatterbox',
    description: 'Sent 10 messages to each other!',
    icon: '💬',
    badgeColor: 'bg-purple-100 text-purple-600 border-purple-200',
    xpReward: 200,
  },
  {
    id: 'win_ttt',
    title: 'Tic-Tac-Toe Pro',
    description: 'Won a game of Tic Tac Toe!',
    icon: '❤️',
    badgeColor: 'bg-rose-100 text-rose-600 border-rose-200',
    xpReward: 150,
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Matched all memory cards in under 30 seconds!',
    icon: '🧠',
    badgeColor: 'bg-blue-100 text-blue-600 border-blue-200',
    xpReward: 200,
  },
  {
    id: 'snake_champion',
    title: 'Snake Champion',
    description: 'Reached a score of 15 or higher in Snake!',
    icon: '🐍',
    badgeColor: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    xpReward: 200,
  },
  {
    id: 'reaction_speed',
    title: 'Lightning Speed',
    description: 'Got a reaction time under 250ms!',
    icon: '🎯',
    badgeColor: 'bg-orange-100 text-orange-600 border-orange-200',
    xpReward: 150,
  },
  {
    id: 'heart_collector',
    title: 'Heart Collector',
    description: 'Collected 20 hearts in Heart Collector game!',
    icon: '💖',
    badgeColor: 'bg-pink-100 text-pink-600 border-pink-200',
    xpReward: 200,
  },
  {
    id: 'wheel_spinner',
    title: 'Fate Seeker',
    description: 'Spun the wheel of destiny!',
    icon: '🎲',
    badgeColor: 'bg-teal-100 text-teal-600 border-teal-200',
    xpReward: 100,
  },
];

export const DAILY_QUESTIONS = [
  "What is your absolute favorite memory of us together? 💕",
  "If we could teleport to any place in the world right now, where would we go? ✈️",
  "What is a small thing I did recently that made you smile or feel loved? 🥰",
  "What's our perfect Sunday morning routine? ☕🥞",
  "If we were characters in a fantasy game or show, who would we be? ⚔️🧙‍♀️",
  "What song always makes you think of me when you hear it? 🎵",
  "What is the next cozy adventure or date you want us to go on? 🍦🎬",
  "What is a superpower you'd give me, and what would your superpower be? 🦸‍♂️🦸‍♀️",
  "What is your favorite picture of us together, and why? 📸",
  "If we opened a cozy coffee shop or bookstore together, what would we name it? ☕📚",
];

export const AVATARS = [
  { id: 'cat_cute', emoji: '🐱', label: 'Cozy Cat', cost: 0 },
  { id: 'bunny_hug', emoji: '🐰', label: 'Fluffy Bunny', cost: 0 },
  { id: 'bear_cozy', emoji: '🐻', label: 'Cuddly Bear', cost: 0 },
  { id: 'panda_sleep', emoji: '🐼', label: 'Sleepy Panda', cost: 0 },
  { id: 'koala_love', emoji: '🐨', label: 'Snugly Koala', cost: 50 },
  { id: 'fox_adventure', emoji: '🦊', label: 'Crafty Fox', cost: 50 },
  { id: 'hamster_cheek', emoji: '🐹', label: 'Chubby Hamster', cost: 100 },
  { id: 'penguin_cozy', emoji: '🐧', label: 'Ice Penguin', cost: 100 },
  { id: 'frog_happy', emoji: '🐸', label: 'Happy Frog', cost: 150 },
  { id: 'unicorn_dream', emoji: '🦄', label: 'Dreamy Unicorn', cost: 200 },
];

export const THEME_PALETTES = {
  pink: {
    primary: 'bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-black tracking-tight rounded-full shadow-md',
    secondary: 'bg-[#FFD1DC] text-[#FF6B6B] border-white font-bold',
    accent: 'text-[#FF6B6B]',
    bg: 'bg-[#FDE2E4]',
    card: 'bold-card text-[#4A4A4A]',
    scrollbar: 'scrollbar-pink',
    badge: 'bg-[#FFD1DC] text-[#FF6B6B] border border-white font-bold',
    solidBg: 'bg-[#FFD1DC]',
    name: 'Cherry Blossom ❤️'
  },
  purple: {
    primary: 'bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-black tracking-tight rounded-full shadow-md',
    secondary: 'bg-[#E0BBE4] text-[#9C27B0] border-white font-bold',
    accent: 'text-[#9C27B0]',
    bg: 'bg-[#f3e5f5]',
    card: 'bold-card text-[#4A4A4A]',
    scrollbar: 'scrollbar-purple',
    badge: 'bg-[#E0BBE4] text-[#9C27B0] border border-white font-bold',
    solidBg: 'bg-[#E0BBE4]',
    name: 'Lavender Fields 💜'
  },
  blue: {
    primary: 'bg-[#1e88e5] hover:bg-[#1565c0] text-white font-black tracking-tight rounded-full shadow-md',
    secondary: 'bg-[#B2CEFE] text-[#1e88e5] border-white font-bold',
    accent: 'text-[#1e88e5]',
    bg: 'bg-[#e3f2fd]',
    card: 'bold-card text-[#4A4A4A]',
    scrollbar: 'scrollbar-blue',
    badge: 'bg-[#B2CEFE] text-[#1e88e5] border border-white font-bold',
    solidBg: 'bg-[#B2CEFE]',
    name: 'Cloud Nine 💙'
  },
  cream: {
    primary: 'bg-[#5A5A40] hover:bg-[#4a4a33] text-white font-black tracking-tight rounded-full shadow-md',
    secondary: 'bg-[#FFF5E1] text-[#5A5A40] border-white font-bold',
    accent: 'text-[#5A5A40]',
    bg: 'bg-[#FFF5E1]',
    card: 'bold-card text-[#4A4A4A]',
    scrollbar: 'scrollbar-cream',
    badge: 'bg-[#FFF5E1] text-[#5A5A40] border border-white font-bold',
    solidBg: 'bg-[#FFF5E1]',
    name: 'Warm Vanilla 💛'
  },
  dark: {
    primary: 'bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-black tracking-tight rounded-full shadow-md',
    secondary: 'bg-slate-800 text-slate-100 border-slate-700 font-bold',
    accent: 'text-[#FF6B6B]',
    bg: 'bg-slate-950',
    card: 'bold-card-dark text-slate-100',
    scrollbar: 'scrollbar-dark',
    badge: 'bg-slate-800 text-[#FF6B6B] border border-slate-700 font-bold',
    solidBg: 'bg-slate-850',
    name: 'Midnight Stars 🌌'
  },
};

export const STICKERS = [
  { id: 's1', emoji: '💖', label: 'Heart Sparkle' },
  { id: 's2', emoji: '🥰', label: 'Smiling Heart' },
  { id: 's3', emoji: '🧸', label: 'Teddy Bear' },
  { id: 's4', emoji: '🍪', label: 'Cookie Love' },
  { id: 's5', emoji: '🎈', label: 'Love Balloon' },
  { id: 's6', emoji: '🐱‍👤', label: 'Ninja Cat' },
  { id: 's7', emoji: '✨', label: 'Magic Sparkles' },
  { id: 's8', emoji: '🐼', label: 'Sleepy Panda' },
  { id: 's9', emoji: '🧁', label: 'Sweet Cupcake' },
  { id: 's10', emoji: '🌹', label: 'Romantic Rose' },
];

export const GIFS = [
  { id: 'g1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmdqdDNyZXZ5eXpxYm16M2Q5aHA4MTB4cnYwMXFpZHppdmY2dnV4NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbhswvKCc/giphy.gif', label: 'Cute Cat Headpat' },
  { id: 'g2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjYxZDRiNWszYzN4OWF4aHpxNThobzRtZXg0YzlsdnRpeGs1cWtlbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/ZBQ0HHzT3OM4o/giphy.gif', label: 'Panda Hug' },
  { id: 'g3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczJ5czgwbDRscWN3Z3MxdG05N2dtNWJybWZ5a250bnBha21hdnczZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/14979eP5LaX0uA/giphy.gif', label: 'Chibi Wave' },
  { id: 'g4', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVqODh2dzZidnh3ajl4eXdtMnN3Mm5yN2hpcXR0bmxtcGc0aWpkayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/X3Yj4XbYf7C3C/giphy.gif', label: 'Bunny Kiss' },
  { id: 'g5', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVtcXZmdmVtMDV1MGtvaTMycmZqMndidmV2dnAzZHhsbDRscHNnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/8g7r9O0Rj8a6g/giphy.gif', label: 'Bear Hug' },
  { id: 'g6', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmsyeDRrM2U3dTFyZndqejZtY3RocjV0dWZtMHpqdHY3azI1OXh6cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/9f8v1Q1DHSvYk/giphy.gif', label: 'Happy Dance' }
];

export const WHEEL_CHALLENGES = [
  { text: "Tell me something you love about me ❤️", icon: "❤️" },
  { text: "Send a selfie right now! 📸", icon: "📸" },
  { text: "Pick our next movie 🎬", icon: "🎬" },
  { text: "Ice cream date is on you! 🍦", icon: "🍦" },
  { text: "Give me a huge hug next time you see me 🤗", icon: "🤗" },
  { text: "Choose what we have for dinner tonight! 🍕", icon: "🍕" },
  { text: "Sing me a 10-second song 🎵", icon: "🎵" },
  { text: "Give me a 1-minute back massage 💆‍♂️", icon: "💆‍♂️" },
];
