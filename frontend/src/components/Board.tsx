// components/Board.tsx
import { useRef, useState } from "react";
import Square from "./Square";
import { getLegalMoves } from "@/hooks/getLegalMoves";
import { getInitialBoard } from "@/utils/initialBoard";
type BoardProps = {
  board: string[][];
  hoveredSquare: { row: number; col: number } | null;
  dragging: boolean;
  draggedFrom: { row: number; col: number } | null;
  lastMove:any;
  validMoves:{row:number, col:number}[];
  setMouseDown: (val: boolean) => void;
  setDraggedPiece: (piece: string) => void;
  setDraggedFrom: (pos: { row: number; col: number }) => void;
};

export default function Board({
  board,
  hoveredSquare,
  dragging,
  draggedFrom,
  validMoves,
  setMouseDown,
  setDraggedPiece,
  setDraggedFrom,
}: BoardProps) {
  const initialBoardRef = useRef<string[][]>(getInitialBoard());
  const draggedPiece = draggedFrom && board[draggedFrom.row]?.[draggedFrom.col]||null;
  const hasMoved = draggedFrom && initialBoardRef.current[draggedFrom.row][draggedFrom.col] !== draggedPiece;
  const legalMove = draggedPiece ? getLegalMoves({piece:draggedPiece, hasMoved:hasMoved||false, capture:false}) : null;
  return ( 
    <div className="relative top-8 left-8 overflow-x-hidden">
      {board.map((rowArr, row) => (
        <div key={row} className="flex flex-row">
          {rowArr.map((piece, col) => {
            const isAValidMove = validMoves.some(move => move.row === row && move.col === col);
            
            return (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                piece={piece}
                hovered={hoveredSquare?.row === row && hoveredSquare?.col === col}
                dragging={dragging}
                draggedFrom={draggedFrom}
                dotExists={isAValidMove}
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
