import {Chess} from 'chess.js'


export function getInitialBoard() {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      if ((row === 0 && col === 0) || (row === 0 && col === 7))
        return "pieces/black_rook.png";
      if ((row === 7 && col === 0) || (row === 7 && col === 7))
        return "pieces/white_rook.png";
      if ((row === 0 && col === 1) || (row === 0 && col === 6))
        return "pieces/black_knight.png";
      if ((row === 7 && col === 1) || (row === 7 && col === 6))
        return "pieces/white_knight.png";
      if ((row === 0 && col === 2) || (row === 0 && col === 5))
        return "pieces/black_bishop.png";
      if ((row === 7 && col === 2) || (row === 7 && col === 5))
        return "pieces/white_bishop.png";
      if (row === 0 && col === 3) return "pieces/black_queen.png";
      if (row === 7 && col === 3) return "pieces/white_queen.png";
      if (row === 0 && col === 4) return "pieces/black_king.png";
      if (row === 7 && col === 4) return "pieces/white_king.png";
      if (row === 1) return "pieces/black_pawn.png";
      if (row === 6) return "pieces/white_pawn.png";
      return "";
    })
  );
}
