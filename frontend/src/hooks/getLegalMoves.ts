
type legalMoves = {
    piece: string;
    hasMoved: boolean;
    capture: boolean;
    position?:{row:number, col:number};
    lastMove?:{from:{row:number, col:number}, to:{row:number, col:number}, piece:string};
}

export function getLegalMoves({piece, hasMoved, capture, position, lastMove}:legalMoves) {
    const isWhite = piece.includes("white");
  const basePiece = piece.split("/").pop();
  const currPiece = basePiece?.split(".")[0];

  if (currPiece === "white_pawn" || currPiece === "black_pawn") {
    const direction = isWhite ? -1 : 1;
    const enPassantRow = isWhite ? 3 : 4;

    const legal: {
      row: number[];
      col: number[];
      enPassantTarget?: { row: number; col: number };
    } = {
      row: capture ? [direction] : hasMoved ? [direction] : [direction * 2, direction],
      col: capture ? [-1, 1] : [0],
    };

    // En Passant Logic
    if (
      position &&
      lastMove &&
      lastMove.piece.includes("pawn") &&
      Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
      position.row === lastMove.to.row &&
      Math.abs(position.col - lastMove.to.col) === 1
    ) {
      const enPassantTarget = {
        row: lastMove.to.row + direction,
        col: lastMove.to.col,
      };
      if(capture) {
        legal.enPassantTarget = enPassantTarget
      }
    }

    return legal;
  }
 
    return null;
  
}