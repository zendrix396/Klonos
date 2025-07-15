import { Piece, PieceColor, Position, GameState, Move } from './types';

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Black pieces
  board[0][0] = { type: 'rook', color: 'black', image: 'pieces/black_rook.png' };
  board[0][1] = { type: 'knight', color: 'black', image: 'pieces/black_knight.png' };
  board[0][2] = { type: 'bishop', color: 'black', image: 'pieces/black_bishop.png' };
  board[0][3] = { type: 'queen', color: 'black', image: 'pieces/black_queen.png' };
  board[0][4] = { type: 'king', color: 'black', image: 'pieces/black_king.png' };
  board[0][5] = { type: 'bishop', color: 'black', image: 'pieces/black_bishop.png' };
  board[0][6] = { type: 'knight', color: 'black', image: 'pieces/black_knight.png' };
  board[0][7] = { type: 'rook', color: 'black', image: 'pieces/black_rook.png' };
  
  // Black pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black', image: 'pieces/black_pawn.png' };
  }
  
  // White pawns
  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: 'pawn', color: 'white', image: 'pieces/white_pawn.png' };
  }
  
  // White pieces
  board[7][0] = { type: 'rook', color: 'white', image: 'pieces/white_rook.png' };
  board[7][1] = { type: 'knight', color: 'white', image: 'pieces/white_knight.png' };
  board[7][2] = { type: 'bishop', color: 'white', image: 'pieces/white_bishop.png' };
  board[7][3] = { type: 'queen', color: 'white', image: 'pieces/white_queen.png' };
  board[7][4] = { type: 'king', color: 'white', image: 'pieces/white_king.png' };
  board[7][5] = { type: 'bishop', color: 'white', image: 'pieces/white_bishop.png' };
  board[7][6] = { type: 'knight', color: 'white', image: 'pieces/white_knight.png' };
  board[7][7] = { type: 'rook', color: 'white', image: 'pieces/white_rook.png' };
  
  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    castlingRights: {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    },
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    moveHistory: []
  };
}

function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

function getPawnMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // One square forward
  const oneForward = { row: pos.row + direction, col: pos.col };
  if (isValidPosition(oneForward) && !board[oneForward.row][oneForward.col]) {
    moves.push(oneForward);
    
    // Two squares forward from starting position
    if (pos.row === startRow) {
      const twoForward = { row: pos.row + 2 * direction, col: pos.col };
      if (!board[twoForward.row][twoForward.col]) {
        moves.push(twoForward);
      }
    }
  }
  
  // Captures
  const captureLeft = { row: pos.row + direction, col: pos.col - 1 };
  const captureRight = { row: pos.row + direction, col: pos.col + 1 };
  
  if (isValidPosition(captureLeft) && board[captureLeft.row][captureLeft.col]?.color !== piece.color && board[captureLeft.row][captureLeft.col]) {
    moves.push(captureLeft);
  }
  
  if (isValidPosition(captureRight) && board[captureRight.row][captureRight.col]?.color !== piece.color && board[captureRight.row][captureRight.col]) {
    moves.push(captureRight);
  }
  
  return moves;
}

function getKnightMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dr, dc] of knightOffsets) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    if (isValidPosition(newPos) && (!board[newPos.row][newPos.col] || board[newPos.row][newPos.col]?.color !== piece.color)) {
      moves.push(newPos);
    }
  }
  
  return moves;
}

function getBishopMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  
  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
      if (!isValidPosition(newPos)) break;
      
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece) {
        moves.push(newPos);
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getRookMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
      if (!isValidPosition(newPos)) break;
      
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece) {
        moves.push(newPos);
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getQueenMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  return [...getBishopMoves(board, pos, piece), ...getRookMoves(board, pos, piece)];
}

function getKingMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  
  for (const [dr, dc] of directions) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    if (isValidPosition(newPos) && (!board[newPos.row][newPos.col] || board[newPos.row][newPos.col]?.color !== piece.color)) {
      moves.push(newPos);
    }
  }
  
  return moves;
}

export function getPossibleMoves(board: (Piece | null)[][], pos: Position): Position[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, pos, piece);
    case 'knight':
      return getKnightMoves(board, pos, piece);
    case 'bishop':
      return getBishopMoves(board, pos, piece);
    case 'rook':
      return getRookMoves(board, pos, piece);
    case 'queen':
      return getQueenMoves(board, pos, piece);
    case 'king':
      return getKingMoves(board, pos, piece);
    default:
      return [];
  }
}

export function isSquareUnderAttack(board: (Piece | null)[][], pos: Position, byColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getPossibleMoves(board, { row, col });
        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function findKingPosition(board: (Piece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(board, kingPos, opponentColor);
}

export function getLegalMoves(gameState: GameState, from: Position): Position[] {
  const piece = gameState.board[from.row][from.col];
  if (!piece || piece.color !== gameState.currentPlayer) return [];
  
  const possibleMoves = getPossibleMoves(gameState.board, from);
  const legalMoves: Position[] = [];
  
  // Filter out moves that would leave the king in check
  for (const to of possibleMoves) {
    const boardCopy = gameState.board.map(row => [...row]);
    boardCopy[to.row][to.col] = boardCopy[from.row][from.col];
    boardCopy[from.row][from.col] = null;
    
    if (!isInCheck(boardCopy, piece.color)) {
      legalMoves.push(to);
    }
  }
  
  // Add castling moves
  if (piece.type === 'king' && !gameState.isCheck) {
    const castlingMoves = getCastlingMoves(gameState, from);
    legalMoves.push(...castlingMoves);
  }
  
  return legalMoves;
}

function getCastlingMoves(gameState: GameState, kingPos: Position): Position[] {
  const moves: Position[] = [];
  const piece = gameState.board[kingPos.row][kingPos.col];
  if (!piece || piece.type !== 'king') return moves;
  
  const color = piece.color;
  const row = color === 'white' ? 7 : 0;
  
  // Check if king is on starting position
  if (kingPos.row !== row || kingPos.col !== 4) return moves;
  
  // Kingside castling
  if (gameState.castlingRights[color].kingside) {
    const rook = gameState.board[row][7];
    if (rook && rook.type === 'rook' && rook.color === color) {
      // Check if squares between king and rook are empty
      let canCastle = true;
      for (let col = 5; col <= 6; col++) {
        if (gameState.board[row][col] !== null) {
          canCastle = false;
          break;
        }
        // Check if squares king passes through are not under attack
        if (isSquareUnderAttack(gameState.board, { row, col }, color === 'white' ? 'black' : 'white')) {
          canCastle = false;
          break;
        }
      }
      if (canCastle) {
        moves.push({ row, col: 6 });
      }
    }
  }
  
  // Queenside castling
  if (gameState.castlingRights[color].queenside) {
    const rook = gameState.board[row][0];
    if (rook && rook.type === 'rook' && rook.color === color) {
      // Check if squares between king and rook are empty
      let canCastle = true;
      for (let col = 1; col <= 3; col++) {
        if (gameState.board[row][col] !== null) {
          canCastle = false;
          break;
        }
        // Check if squares king passes through are not under attack (except b-file)
        if (col >= 2 && isSquareUnderAttack(gameState.board, { row, col }, color === 'white' ? 'black' : 'white')) {
          canCastle = false;
          break;
        }
      }
      if (canCastle) {
        moves.push({ row, col: 2 });
      }
    }
  }
  
  return moves;
}

export function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const piece = newState.board[from.row][from.col];
  if (!piece) return gameState;
  
  // Update castling rights
  if (piece.type === 'king') {
    newState.castlingRights[piece.color].kingside = false;
    newState.castlingRights[piece.color].queenside = false;
    
    // Handle castling move
    const colDiff = to.col - from.col;
    if (Math.abs(colDiff) === 2) {
      const row = piece.color === 'white' ? 7 : 0;
      if (colDiff > 0) {
        // Kingside
        newState.board[row][5] = newState.board[row][7];
        newState.board[row][7] = null;
      } else {
        // Queenside
        newState.board[row][3] = newState.board[row][0];
        newState.board[row][0] = null;
      }
    }
  }
  
  if (piece.type === 'rook') {
    const row = piece.color === 'white' ? 7 : 0;
    if (from.row === row) {
      if (from.col === 0) {
        newState.castlingRights[piece.color].queenside = false;
      } else if (from.col === 7) {
        newState.castlingRights[piece.color].kingside = false;
      }
    }
  }
  
  // Make the move
  newState.board[to.row][to.col] = piece;
  newState.board[from.row][from.col] = null;
  
  // Switch player
  newState.currentPlayer = newState.currentPlayer === 'white' ? 'black' : 'white';
  
  // Check for check/checkmate
  newState.isCheck = isInCheck(newState.board, newState.currentPlayer);
  
  return newState;
} 