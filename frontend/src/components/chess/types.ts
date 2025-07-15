export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  image: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isSpecial?: 'castle-kingside' | 'castle-queenside' | 'en-passant' | 'promotion';
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  castlingRights: {
    white: { kingside: boolean; queenside: boolean };
    black: { kingside: boolean; queenside: boolean };
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  moveHistory: Move[];
} 