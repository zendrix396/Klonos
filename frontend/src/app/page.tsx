"use client";
import Board from "@/components/Board";
import DraggedPiece from "@/components/DraggedPiece";
import { useChessBoard } from "@/hooks/useChessBoard";

export default function Home() {
  const {
    board,
    position,
    dragging,
    draggedPiece,
    draggedFrom,
    hoveredSquare,
    validMoves,
    lastMove,
    setMouseDown,
    setDraggedPiece,
    setDraggedFrom,
  } = useChessBoard();
  


  return (
    <>
      <Board
        board={board}
        hoveredSquare={hoveredSquare}
        dragging={dragging}
        draggedFrom={draggedFrom}
        validMoves={validMoves}
        lastMove={lastMove}
        setMouseDown={setMouseDown}
        setDraggedPiece={setDraggedPiece}
        setDraggedFrom={setDraggedFrom}
      />
      {dragging && draggedPiece && <DraggedPiece piece={draggedPiece} position={position} />}
    </>
  );
}
