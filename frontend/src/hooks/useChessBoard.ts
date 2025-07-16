import { useEffect, useState, useRef } from "react";
import { getInitialBoard } from "@/utils/initialBoard";
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, SQUARE_SIZE, DIMENSIONS } from "@/utils/constants";

export function useChessBoard() {
  const [board, setBoard] = useState(() => getInitialBoard());
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{ row: number; col: number } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(null);
  const hoveredSquareRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = () => setMouseDown(true);
    const handleMouseUp = () => {
      setMouseDown(false);
      setDragging(false);
      const square = hoveredSquareRef.current;
      if (
        draggedFrom &&
        square &&
        (draggedFrom.row !== square.row || draggedFrom.col !== square.col)
      ) {
        setBoard((prev) => {
          const newBoard = prev.map((row) => row.slice());
          newBoard[square.row][square.col] = prev[draggedFrom.row][draggedFrom.col];
          newBoard[draggedFrom.row][draggedFrom.col] = "";
          return newBoard;
        });
      }
      setDraggedFrom(null);
      setDraggedPiece(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown) {
        const x = e.clientX;
        const y = e.clientY;
        setPosition({ x, y });
        setDragging(true);

        const col = Math.floor((x - BOARD_OFFSET_X) / SQUARE_SIZE);
        const row = Math.floor((y - BOARD_OFFSET_Y) / SQUARE_SIZE);

        if (row >= 0 && row < DIMENSIONS && col >= 0 && col < DIMENSIONS) {
          setHoveredSquare({ row, col });
          hoveredSquareRef.current = { row, col };
        } else {
          setHoveredSquare(null);
          hoveredSquareRef.current = null;
        }
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseDown, draggedFrom]);

  return {
    board,
    position,
    dragging,
    draggedPiece,
    draggedFrom,
    hoveredSquare,
    setMouseDown,
    setDraggedPiece,
    setDraggedFrom,
  };
}
