// components/Board.tsx
import Square from "./Square";
import { getLegalMoves } from "@/hooks/getLegalMoves";

type BoardProps = {
  board: string[][];
  hoveredSquare: { row: number; col: number } | null;
  dragging: boolean;
  draggedFrom: { row: number; col: number } | null;
  setMouseDown: (val: boolean) => void;
  setDraggedPiece: (piece: string) => void;
  setDraggedFrom: (pos: { row: number; col: number }) => void;
};

export default function Board({
  board,
  hoveredSquare,
  dragging,
  draggedFrom,
  setMouseDown,
  setDraggedPiece,
  setDraggedFrom,
}: BoardProps) {
  const draggedPiece = draggedFrom && board[draggedFrom.row]?.[draggedFrom.col]||null;
  const legalMove = draggedPiece ? getLegalMoves({piece:draggedPiece}) : null;

  return ( 
    <div className="relative top-8 left-8 overflow-x-hidden">
      {board.map((rowArr, row) => (
        <div key={row} className="flex flex-row">
          {rowArr.map((piece, col) => {
            const dotExists = legalMove && draggedFrom && row === draggedFrom.row + legalMove.row && col === draggedFrom.col + legalMove.col;
            return (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                piece={piece}
                hovered={hoveredSquare?.row === row && hoveredSquare?.col === col}
                dragging={dragging}
                draggedFrom={draggedFrom}
                dotExists={dotExists||false}
                onMouseDown={() => {
                  if (piece !== "") {
                    setMouseDown(true);
                    setDraggedPiece(piece);
                    setDraggedFrom({ row, col });
                  }
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
