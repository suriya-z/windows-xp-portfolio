export type Side = 'player' | 'cpu';

/** 64 squares, row by row: null when empty, otherwise whose disc it is. */
export type Board = (Side | null)[];

export interface ReversiGame {
  board: Board;
  turn: Side;
  winner: Side | 'draw' | null;
}

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export const newGame = (): ReversiGame => {
  const board: Board = Array(64).fill(null);
  board[27] = 'cpu';
  board[28] = 'player';
  board[35] = 'player';
  board[36] = 'cpu';
  return { board, turn: 'player', winner: null };
};

export const score = (board: Board) => ({
  player: board.filter((d) => d === 'player').length,
  cpu: board.filter((d) => d === 'cpu').length,
});

/** The opponent discs a disc at `cell` would turn over. */
const outflanked = (board: Board, cell: number, side: Side): number[] => {
  if (board[cell] !== null) return [];
  const row = Math.floor(cell / 8);
  const col = cell % 8;
  const flips: number[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const line: number[] = [];
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] !== null && board[r * 8 + c] !== side) {
      line.push(r * 8 + c);
      r += dr;
      c += dc;
    }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === side) flips.push(...line);
  }
  return flips;
};

export const validMoves = (board: Board, side: Side): number[] =>
  board.map((_, cell) => cell).filter((cell) => outflanked(board, cell, side).length > 0);

const opponent = (side: Side): Side => (side === 'player' ? 'cpu' : 'player');

/** Places a disc, turns over what it outflanks, and works out who moves next or who has won. */
const place = (game: ReversiGame, cell: number, side: Side): ReversiGame => {
  const board = [...game.board];
  for (const flip of outflanked(board, cell, side)) board[flip] = side;
  board[cell] = side;

  // A side with no move passes; when neither can move the game is over.
  const next = [opponent(side), side].find((s) => validMoves(board, s).length > 0);
  if (next) return { board, turn: next, winner: null };
  const { player, cpu } = score(board);
  return { board, turn: side, winner: player > cpu ? 'player' : cpu > player ? 'cpu' : 'draw' };
};

/** The player's move at `cell`, or null when it is not their turn or the move is not allowed. */
export const playerMove = (game: ReversiGame, cell: number): ReversiGame | null => {
  if (game.winner || game.turn !== 'player' || !validMoves(game.board, 'player').includes(cell)) return null;
  return place(game, cell, 'player');
};

const CORNERS = [0, 7, 56, 63];

/** The computer's move: a corner if it can take one, otherwise the move that turns over the most discs. */
export const cpuMove = (game: ReversiGame): ReversiGame => {
  if (game.winner || game.turn !== 'cpu') return game;
  const moves = validMoves(game.board, 'cpu');
  if (moves.length === 0) return { ...game, turn: 'player' };
  const corner = moves.find((m) => CORNERS.includes(m));
  const best =
    corner ??
    moves.reduce((a, b) => (outflanked(game.board, b, 'cpu').length > outflanked(game.board, a, 'cpu').length ? b : a));
  return place(game, best, 'cpu');
};
