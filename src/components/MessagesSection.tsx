import React, { useState } from 'react';
import { Message, UserProfile } from '../types';
import { STICKERS, GIFS } from '../data/staticData';
import { playSound } from '../utils/sound';
import { Trash2 } from 'lucide-react';

interface MessagesSectionProps {
  messages: Message[];
  activeUser: UserProfile;
  partnerUser: UserProfile;
  dailyQuestion: {
    id: string;
    question: string;
    answers: {
      [userId: string]: { answer: string; createdAt: string };
    };
  };
  onSendMessage: (content: string, type: 'text' | 'image' | 'sticker' | 'gif', isSurprise?: boolean, revealAt?: string) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onClearMessages?: () => void;
  onAddReaction: (id: string, emoji: string) => void;
  onReplyToMessage: (id: string, reply: string) => void;
  onAnswerQuestion: (questionId: string, answer: string) => void;
}

export default function MessagesSection({
  messages,
  activeUser,
  partnerUser,
  dailyQuestion,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onClearMessages,
  onAddReaction,
  onReplyToMessage,
  onAnswerQuestion,
}: MessagesSectionProps) {
  const [inputText, setInputText] = useState<string>('');
  const [showStickers, setShowStickers] = useState<boolean>(false);
  const [showGifs, setShowGifs] = useState<boolean>(false);
  const [showSurpriseForm, setShowSurpriseForm] = useState<boolean>(false);
  
  // Surprise form fields
  const [surpriseText, setSurpriseText] = useState<string>('');
  const [revealDate, setRevealDate] = useState<string>('');

  // Daily Question Input
  const [qAnswerText, setQAnswerText] = useState<string>('');

  // Message Reply inputs by message ID
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');

  // Message Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  const handleSendSticker = (emoji: string) => {
    onSendMessage(emoji, 'sticker');
    setShowStickers(false);
  };

  const handleSendGif = (gifUrl: string) => {
    onSendMessage(gifUrl, 'gif');
    setShowGifs(false);
  };

  const handleSendSurprise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surpriseText.trim() || !revealDate) return;
    onSendMessage(surpriseText.trim(), 'text', true, revealDate);
    setSurpriseText('');
    setRevealDate('');
    setShowSurpriseForm(false);
    playSound('correct');
  };

  const handleSendReply = (msgId: string) => {
    if (!replyInputText.trim()) return;
    onReplyToMessage(msgId, replyInputText.trim());
    setReplyInputText('');
    setActiveReplyId(null);
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editText.trim()) return;
    onEditMessage(msgId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qAnswerText.trim()) return;
    onAnswerQuestion(dailyQuestion.id, qAnswerText.trim());
    setQAnswerText('');
  };

  // Check if a surprise date has been passed/unlocked
  const isSurpriseUnlocked = (revealAt?: string) => {
    if (!revealAt) return true;
    const today = new Date();
    const targetDate = new Date(revealAt);
    return today >= targetDate;
  };

  const todayAnsweredByActive = dailyQuestion?.answers?.[activeUser.id];
  const todayAnsweredByPartner = dailyQuestion?.answers?.[partnerUser.id];

  return (
    <div id="messages-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
      {/* Left Columns (Chat Portal) */}
      <div className="lg:col-span-2 flex flex-col h-[480px] sm:h-[520px] md:h-[580px] lg:h-[650px] bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-pink-50/50 border-b border-pink-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">💌</span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm truncate">Our Secret Sandbox</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">Cozy private room for {activeUser.nickname} & {partnerUser.nickname}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                id="clear-chat-button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all messages? This will delete the entire chat history for both of you!")) {
                    onClearMessages?.();
                  }
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-red-100"
                title="Clear all messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="toggle-surprise-board"
              onClick={() => { setShowSurpriseForm(!showSurpriseForm); playSound('click'); }}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold text-[10px] sm:text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              🎁 <span className="hidden xs:inline">Leave a Surprise</span><span className="inline xs:hidden">Surprise</span>
            </button>
          </div>
        </div>

        {/* Chat bubbles area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-pink-50/10">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-4xl block mb-2">🕊️</span>
              <p className="text-xs">No messages yet. Send a cozy sticker or note below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isActiveUserMsg = msg.senderId === activeUser.id;
              const isSurprise = msg.isSurprise;
              const unlocked = isSurprise ? isSurpriseUnlocked(msg.revealAt) : true;
              
              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex flex-col ${isActiveUserMsg ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-gray-600">{msg.senderName}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble body */}
                  <div className="group relative max-w-[85%] sm:max-w-[70%]">
                    {isSurprise && !unlocked ? (
                      /* LOCKED SURPRISE CAPSULE */
                      <div className="p-4 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-3xl shadow-md border-2 border-yellow-300">
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="text-2xl animate-pulse">🎁</span>
                          <span className="font-extrabold text-xs tracking-wider uppercase">Surprise Note!</span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed bg-white/10 px-3 py-2 rounded-2xl">
                          🔒 This surprise capsule unlocks on <strong className="underline">{msg.revealAt}</strong>! No peeking!
                        </p>
                      </div>
                    ) : (
                      /* NORMAL MESSAGE BUBBLE */
                      <div
                        className={`p-3.5 rounded-3xl ${
                          isSurprise
                            ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-tr-none shadow-md border border-rose-300'
                            : isActiveUserMsg
                            ? 'bg-pink-500 text-white rounded-tr-none border border-pink-400'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                        }`}
                      >
                        {isSurprise && (
                          <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider font-extrabold opacity-90">
                            <span>🎁 Unlocked Surprise!</span>
                          </div>
                        )}

                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="px-2 py-1 text-sm bg-white text-gray-800 rounded-lg border focus:outline-none"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-0.5 bg-gray-400 text-white text-[10px] rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : msg.type === 'text' ? (
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        ) : msg.type === 'sticker' ? (
                          <span className="text-6xl inline-block select-none transform hover:scale-110 transition-transform">{msg.content}</span>
                        ) : (
                          /* GIF MESSAGE */
                          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white p-1">
                            <img src={msg.content} alt="gif" className="max-w-[160px] h-auto object-cover rounded-xl" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        {/* Edit/Delete overlays for self */}
                        {isActiveUserMsg && editingId !== msg.id && msg.type === 'text' && (
                          <div className="absolute right-0 top-[-25px] hidden group-hover:flex gap-1 bg-white border rounded-full px-1.5 py-0.5 shadow-sm">
                            <button
                              onClick={() => { setEditingId(msg.id); setEditText(msg.content); }}
                              className="text-[9px] font-bold text-gray-500 hover:text-pink-600 px-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteMessage(msg.id)}
                              className="text-[9px] font-bold text-gray-500 hover:text-red-600 px-1"
                            >
                              Del
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions Layer */}
                    {msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {msg.reactions.map((r, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => onAddReaction(msg.id, r.emoji)}
                            className="text-xs bg-gray-50 border px-1.5 py-0.5 rounded-full hover:bg-gray-100 flex items-center gap-0.5"
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[9px] font-semibold text-gray-400">{r.userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Reactions toolbar (appear on hover) */}
                    <div className="absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 px-1.5 py-1 bg-white border border-gray-200 rounded-full shadow-md z-10 transition-all duration-200" style={{ [isActiveUserMsg ? 'left' : 'right']: '102%' }}>
                      {['❤️', '😂', '🥰', '😍'].map((emo) => (
                        <button
                          key={emo}
                          onClick={() => onAddReaction(msg.id, emo)}
                          className="text-sm hover:scale-125 transition-all"
                        >
                          {emo}
                        </button>
                      ))}
                      <button
                        onClick={() => { setActiveReplyId(activeReplyId === msg.id ? null : msg.id); playSound('click'); }}
                        className="text-xs text-gray-400 hover:text-pink-500 font-bold px-1"
                        title="Reply"
                      >
                        💬
                      </button>
                    </div>
                  </div>

                  {/* Thread Replies */}
                  {msg.replies.length > 0 && (
                    <div className={`mt-1.5 pl-6 pr-2 space-y-1 w-[80%] ${isActiveUserMsg ? 'text-right flex flex-col items-end' : 'text-left'}`}>
                      {msg.replies.map((rep) => (
                        <div key={rep.id} className="bg-pink-50/50 p-2 rounded-2xl text-xs max-w-xs border border-pink-100/40 inline-block text-left">
                          <span className="font-extrabold text-[10px] text-pink-600 mr-1">{rep.senderName}:</span>
                          <span className="text-gray-700">{rep.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {activeReplyId === msg.id && (
                    <div className="mt-2 flex gap-1.5 pl-6 w-[80%]">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyInputText}
                        onChange={(e) => setReplyInputText(e.target.value)}
                        className="px-2 py-1 text-xs bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        className="px-3 py-1 bg-pink-500 text-white rounded-xl text-xs font-bold"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sticker/GIF Panels */}
        {showStickers && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Pick a Sticker 🧸</span>
              <button onClick={() => setShowStickers(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
            <div className="grid grid-cols-5 gap-3.5">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleSendSticker(sticker.emoji)}
                  className="text-4xl py-2 rounded-xl bg-white hover:bg-pink-50 hover:scale-105 active:scale-95 shadow-sm border border-gray-100 transition-all select-none"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {showGifs && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 max-h-48 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Pick a Cute GIF 🎬</span>
              <button onClick={() => setShowGifs(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GIFS.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSendGif(gif.url)}
                  className="rounded-xl overflow-hidden bg-white p-1 hover:border-pink-300 border-2 border-transparent transition-all hover:scale-[1.03]"
                >
                  <img src={gif.url} alt={gif.label} className="w-full h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <span className="text-[10px] text-gray-400 block text-center mt-0.5">{gif.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Surprise Box Capsule Form */}
        {showSurpriseForm && (
          <form onSubmit={handleSendSurprise} className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-orange-100 animate-slide-up space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-extrabold text-amber-800">
                <span>🎁</span>
                <span>Prepare a Time Capsule Surprise</span>
              </div>
              <button type="button" onClick={() => setShowSurpriseForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
            <p className="text-[11px] text-amber-600 leading-snug">
              This message will be sent inside a locked present box 🎁. Your partner won't be able to open or read it until the specific date you choose!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Write your secret surprise note... ❤️"
                value={surpriseText}
                onChange={(e) => setSurpriseText(e.target.value)}
                className="flex-1 px-4 py-2 bg-white rounded-xl border border-orange-200 focus:ring-2 focus:ring-amber-300 focus:outline-none text-xs text-gray-700"
              />
              <input
                type="date"
                required
                value={revealDate}
                onChange={(e) => setRevealDate(e.target.value)}
                className="px-4 py-2 bg-white rounded-xl border border-orange-200 focus:ring-2 focus:ring-amber-300 focus:outline-none text-xs text-gray-700"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Seal Present 🔒
              </button>
            </div>
          </form>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSendText} className="px-6 py-4 bg-white border-t border-gray-100 flex gap-2 items-center">
          <button
            type="button"
            id="picker-sticker"
            onClick={() => { setShowStickers(!showStickers); setShowGifs(false); playSound('click'); }}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-xl flex items-center justify-center transition-colors cursor-pointer"
            title="Stickers"
          >
            🧸
          </button>
          <button
            type="button"
            id="picker-gif"
            onClick={() => { setShowGifs(!showGifs); setShowStickers(false); playSound('click'); }}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-xl flex items-center justify-center transition-colors cursor-pointer"
            title="GIFs"
          >
            🎬
          </button>
          <input
            type="text"
            id="chat-input-text"
            placeholder="Type a sweet message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm text-gray-700 transition-all"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!inputText.trim()}
            className="h-10 px-5 rounded-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center cursor-pointer"
          >
            Send ❤️
          </button>
        </form>
      </div>

      {/* Right Column: Daily Question Space */}
      <div className="flex flex-col h-auto lg:h-[650px] bg-gradient-to-b from-pink-50 to-purple-50 rounded-3xl border border-pink-100 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="text-center">
          <span className="text-4xl animate-bounce-slow block mb-1">💕</span>
          <h3 className="text-lg font-black text-gray-800">Couple Questions</h3>
          <p className="text-xs text-gray-400">Unlock each other's secret answers daily!</p>
        </div>

        {/* Active question panel */}
        <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm space-y-4">
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
            <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider block mb-1">Daily Quest 🌸</span>
            <p className="text-xs font-bold text-gray-800 leading-relaxed">{dailyQuestion.question}</p>
          </div>

          {!todayAnsweredByActive ? (
            /* ACTIVE HAS NOT ANSWERED */
            <form onSubmit={handleAnswerSubmit} className="space-y-2">
              <textarea
                required
                rows={3}
                placeholder="Write your secret answer here..."
                value={qAnswerText}
                onChange={(e) => setQAnswerText(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 text-xs text-gray-700 resize-none"
              />
              <button
                type="submit"
                id="answer-submit-btn"
                className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Submit Answer (Gain +30 XP!)
              </button>
            </form>
          ) : (
            /* ACTIVE HAS ANSWERED */
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-left">
                <span className="text-[10px] font-extrabold text-emerald-600 block mb-1">✓ Your Answer:</span>
                <p className="text-xs text-emerald-800 italic">"{todayAnsweredByActive.answer}"</p>
              </div>

              {todayAnsweredByPartner ? (
                /* PARTNER ALSO ANSWERED: REVEAL! */
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-left">
                  <span className="text-[10px] font-extrabold text-purple-600 block mb-1">✓ {partnerUser.nickname}'s Answer:</span>
                  <p className="text-xs text-purple-800 italic">"{todayAnsweredByPartner.answer}"</p>
                </div>
              ) : (
                /* PARTNER HAS NOT ANSWERED YET */
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <span className="text-xl">🔒</span>
                  <p className="text-xs font-semibold text-gray-500 mt-1">Waiting for {partnerUser.nickname} to answer...</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Their answer will reveal once both submit!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="bg-white/60 p-4 rounded-xl border border-pink-100/40 text-center flex-1 flex flex-col justify-center space-y-2">
          <span className="text-2xl">🌱</span>
          <p className="text-xs font-bold text-gray-700">Daily Bonding</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Answering daily questions builds your level streak, grants you 10 golden coins 🪙, and creates beautiful memory logs for you two to read later!
          </p>
        </div>
      </div>
    </div>
  );
}
