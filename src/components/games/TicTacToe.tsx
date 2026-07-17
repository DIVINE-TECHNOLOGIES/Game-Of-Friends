import React, { useState } from 'react';
import { playSound } from '../../utils/sound';

interface TicTacToeProps {
  onGameEnd: (won: boolean) => void;
  activeUserNickname: string;
  partnerUserNickname: string;
}

export default function TicTacToe({ onGameEnd, activeUserNickname, partnerUserNickname }: TicTacToeProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }

    if (squares.every((square) => square !== null)) {
      return { winner: 'Draw', line: null };
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    playSound('click');
    const newBoard = [...board];
    newBoard[index] = isXNext ? '💖' : '⭐';
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult.winner);
      setWinningLine(gameResult.line);
      if (gameResult.winner === 'Draw') {
        playSound('wrong');
        onGameEnd(false);
      } else {
        playSound('win');
        onGameEnd(true); // Current user got a win recorded!
      }
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    playSound('click');
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div id="ttt-game" className="flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">❤️ Tic Tac Toe</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Play against each other on the same screen! Match 3 to win cozy rewards.
        </p>
      </div>

      {/* Players Info */}
      <div className="flex gap-8 justify-center mb-6 text-sm">
        <div className={`px-4 py-2 rounded-full border transition-all duration-300 ${isXNext && !winner ? 'bg-pink-100 border-pink-300 scale-105 shadow-sm text-pink-700 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
          Player 1 (💖): {activeUserNickname}
        </div>
        <div className={`px-4 py-2 rounded-full border transition-all duration-300 ${!isXNext && !winner ? 'bg-purple-100 border-purple-300 scale-105 shadow-sm text-purple-700 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
          Player 2 (⭐): {partnerUserNickname}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 bg-pink-50/50 p-4 rounded-3xl border border-pink-100/60 max-w-xs w-full shadow-inner">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              id={`ttt-cell-${idx}`}
              onClick={() => handleClick(idx)}
              className={`h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 ${isWinningCell ? 'bg-rose-100/80 border-2 border-rose-300 animate-pulse' : 'hover:bg-pink-50/20'}`}
            >
              {cell && (
                <span className="animate-ping-once inline-block select-none transform hover:scale-110 duration-150">
                  {cell}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status / Celebration */}
      {winner && (
        <div className="mt-6 text-center animate-bounce-slow">
          <p className="text-xl font-extrabold text-pink-600">
            {winner === 'Draw' ? "It's a beautiful tie! 🧸" : `🎉 ${winner} Wins! Congratulations!`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {winner !== 'Draw' ? '+20 XP, +5 Coins 🪙' : '+5 XP'}
          </p>
        </div>
      )}

      {/* Restart Button */}
      <button
        id="ttt-reset"
        onClick={resetGame}
        className="mt-6 px-6 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        {winner ? 'Play Again 🌟' : 'Restart Game'}
      </button>
    </div>
  );
}
