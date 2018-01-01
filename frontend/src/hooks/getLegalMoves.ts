
type legalMoves = {
    piece: string;
}

export function getLegalMoves({piece}:legalMoves) {
    if(piece === "pieces/black_pawn.png") {
        return {row: 1, col: 0}
    }
    if(piece === "pieces/white_pawn.png") {
        return {row: -1, col: 0}
    }
    else{
        return null
    }
}