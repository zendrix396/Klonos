import { useEffect, useState, useRef } from "react";
import { getInitialBoard } from "@/utils/initialBoard";
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  SQUARE_SIZE,
  DIMENSIONS,
} from "@/utils/constants";

export function useChessBoard() {
  const [board, setBoard] = useState(() => getInitialBoard());
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{ row: number; col: number } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(null);

  const draggedFromRef = useRef<{ row: number; col: number } | null>(null);
  const hoveredSquareRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const col = Math.floor((x - BOARD_OFFSET_X) / SQUARE_SIZE);
      const row = Math.floor((y - BOARD_OFFSET_Y) / SQUARE_SIZE);

      if (row >= 0 && row < DIMENSIONS && col >= 0 && col < DIMENSIONS) {
        const piece = board[row][col];
        if (piece !== "") {
          const from = { row, col };
          setDraggedFrom(from);
          draggedFromRef.current = from;
          setDraggedPiece(piece);
          setDragging(true);
          setMouseDown(true);
          setPosition({ x, y });
          document.body.style.cursor = "grabbing";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const x = e.clientX;
        const y = e.clientY;
        setPosition({ x, y });

        const col = Math.floor((x - BOARD_OFFSET_X) / SQUARE_SIZE);
        const row = Math.floor((y - BOARD_OFFSET_Y) / SQUARE_SIZE);

        if (row >= 0 && row < DIMENSIONS && col >= 0 && col < DIMENSIONS) {
          const newHovered = { row, col };
          setHoveredSquare(newHovered);
          hoveredSquareRef.current = newHovered;
        } else {
          setHoveredSquare(null);
          hoveredSquareRef.current = null;
        }
      }
    };

    const handleMouseUp = () => {
      setMouseDown(false);
      document.body.style.cursor = "";

      const from = draggedFromRef.current;
      const to = hoveredSquareRef.current;

      if (
        dragging &&
        from &&
        to &&
        (from.row !== to.row || from.col !== to.col)
      ) {
        setBoard((prev) => {
          const newBoard = prev.map((row) => row.slice());
          newBoard[to.row][to.col] = prev[from.row][from.col];
          newBoard[from.row][from.col] = "";
          return newBoard;
        });
      }

      // Reset everything
      setDragging(false);
      setDraggedPiece(null);
      setDraggedFrom(null);
      setHoveredSquare(null);
      draggedFromRef.current = null;
      hoveredSquareRef.current = null;
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [board, dragging]);

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
  