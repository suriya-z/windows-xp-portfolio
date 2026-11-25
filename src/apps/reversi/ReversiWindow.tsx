import { useEffect, useState } from 'react';
import { sound } from '../../os/sound';
import { cpuMove, newGame, playerMove, score, validMoves } from './reversi';

/** How long the computer "thinks" before it moves, in milliseconds. */
export const CPU_THINKING_MS = 700;

const WINNER_TEXT = { player: 'BLUE WINS!', cpu: 'RED WINS!', draw: 'DRAW' } as const;

/** Internet Reversi: the player (blue) against the computer (red). */
export default function ReversiWindow() {
  const [game, setGame] = useState(newGame);
  const scores = score(game.board);
  const playerMoves = game.turn === 'player' && !game.winner ? validMoves(game.board, 'player') : [];
  const winnerText = game.winner ? WINNER_TEXT[game.winner] : null;

  // The computer moves after a pause; a new game (or closing the window) calls the pending move off.
  useEffect(() => {
    if (game.turn !== 'cpu' || game.winner) return;
    const timer = setTimeout(() => {
      sound.beep(450, 50, 'sine');
      setGame(cpuMove(game));
    }, CPU_THINKING_MS);
    return () => clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    if (game.winner === 'player') {
      sound.tune([
        { freq: 523, ms: 100, wave: 'triangle', at: 0 },
        { freq: 659, ms: 100, wave: 'triangle', at: 120 },
        { freq: 783, ms: 100, wave: 'triangle', at: 240 },
        { freq: 1046, ms: 300, wave: 'triangle', at: 360 },
      ]);
    } else if (game.winner === 'cpu') {
      sound.play('error');
    }
  }, [game.winner]);

  const handleCellClick = (cell: number) => {
    const next = playerMove(game, cell);
    if (!next) {
      if (game.turn === 'player' && !game.winner) sound.play('error');
      return;
    }
    sound.beep(600, 50, 'sine');
    // The computer had no move and passes straight back.
    if (next.turn === 'player' && !next.winner) sound.beep(400, 100, 'square');
    setGame(next);
  };

  const reset = () => {
    setGame(newGame());
    sound.beep(880, 100, 'sine');
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-[#1e4620] text-white font-mono p-2 select-none justify-between">
      {/* Score display board */}
      <div className="bg-black/40 border border-white/20 p-2 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white"></span>
          <span>Blue (User): <b>{scores.player}</b></span>
        </div>

        <div className="text-center font-bold text-yellow-400">
          {winnerText ? (
            <span className="animate-pulse tracking-widest">{winnerText}</span>
          ) : (
            <span>{game.turn === 'player' ? 'YOUR TURN' : 'CPU THINKING...'}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>CPU (Suriya): <b>{scores.cpu}</b></span>
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white"></span>
        </div>
      </div>

      {/* 8x8 Felt board grid */}
      <div className="flex-1 flex items-center justify-center py-2">
        <div
          role="grid"
          aria-label="Board"
          className="grid grid-cols-8 grid-rows-8 border-2 border-black bg-emerald-800 shadow-xl max-w-[280px] max-h-[280px] w-full aspect-square"
        >
          {game.board.map((val, i) => {
            const isValidMove = playerMoves.includes(i);

            return (
              <div
                key={i}
                role="gridcell"
                aria-label={`Row ${Math.floor(i / 8) + 1}, column ${(i % 8) + 1}${val ? `: ${val === 'player' ? 'blue' : 'red'}` : ''}`}
                onClick={() => handleCellClick(i)}
                className={`border border-emerald-950 flex items-center justify-center relative transition-colors ${isValidMove ? 'bg-emerald-700/80 cursor-pointer hover:bg-emerald-600' : ''}`}
              >
                {val === 'player' && (
                  <div className="w-[80%] h-[80%] rounded-full bg-blue-600 border border-white flex items-center justify-center shadow-md animate-scale">
                    <div className="w-[50%] h-[50%] rounded-full bg-blue-400 opacity-50"></div>
                  </div>
                )}
                {val === 'cpu' && (
                  <div className="w-[80%] h-[80%] rounded-full bg-red-600 border border-white flex items-center justify-center shadow-md animate-scale">
                    <div className="w-[50%] h-[50%] rounded-full bg-red-400 opacity-50"></div>
                  </div>
                )}
                {isValidMove && (
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 opacity-60 animate-ping"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control restart options */}
      <div className="flex space-x-2 justify-center">
        <button
          onClick={reset}
          className="px-3 py-1 bg-zinc-900 border border-white text-xs hover:bg-white hover:text-black cursor-pointer flex items-center space-x-1"
        >
          <span>RESTART MATCH</span>
        </button>
      </div>
    </div>
  );
}
