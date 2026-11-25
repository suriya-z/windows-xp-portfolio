import { describe, expect, it } from 'vitest';
import { cpuMove, newGame, playerMove, score, validMoves, type Board } from './reversi';

describe('reversi', () => {
  it('starts with two discs each and four moves for the player', () => {
    const game = newGame();

    expect(score(game.board)).toEqual({ player: 2, cpu: 2 });
    expect(game.turn).toBe('player');
    expect(validMoves(game.board, 'player')).toEqual([19, 26, 37, 44]);
  });

  it('turns over the discs a move outflanks and hands the turn to the computer', () => {
    const game = playerMove(newGame(), 19)!;

    expect(game.board[27]).toBe('player');
    expect(score(game.board)).toEqual({ player: 4, cpu: 1 });
    expect(game.turn).toBe('cpu');
  });

  it('refuses a move that outflanks nothing', () => {
    expect(playerMove(newGame(), 0)).toBeNull();
  });

  it('has the computer take a corner whenever it can', () => {
    const board: Board = Array(64).fill(null);
    // Row 1: _ P C   — the corner outflanks one disc.
    board[1] = 'player';
    board[2] = 'cpu';
    // Rows 4-6: C P P P _ — the far square outflanks three, but is not a corner.
    board[32] = 'cpu';
    board[33] = 'player';
    board[34] = 'player';
    board[35] = 'player';

    const game = cpuMove({ board, turn: 'cpu', winner: null });

    expect(game.board[0]).toBe('cpu');
  });

  it('ends the game, and names the winner, when neither side can move', () => {
    const board: Board = Array(64).fill(null);
    board[0] = 'player';
    board[1] = 'cpu';

    const game = playerMove({ board, turn: 'player', winner: null }, 2)!;

    expect(game.winner).toBe('player');
  });
});
