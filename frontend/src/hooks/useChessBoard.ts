import { useEffect, useState, useRef } from "react";
import { getInitialBoard } from "@/utils/initialBoard";
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  SQUARE_SIZE,
  DIMENSIONS,
} from "@/utils/constants";
import { getLegalMoves } from "@/hooks/getLegalMoves";

export function useChessBoard() {
  const [board, setBoard] = useState(() => getInitialBoard());
  const [whiteTurn, setWhiteTurn] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{ row: number; col: number } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]); // ✅ NEW
  const [lastMove, setLastMove] = useState<{ from: { row: number; col: number }, to: { row: number; col: number }, piece: string } | null>(null);

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
          const isWhite = piece.includes("white");
          if ((whiteTurn && isWhite) || (!whiteTurn && !isWhite)) {
            setDraggedFrom(from);
            draggedFromRef.current = from;
            setDraggedPiece(piece);
            setDragging(true);
            setMouseDown(true);
            setPosition({ x, y });
            document.body.style.cursor = "grabbing";

            // ✅ Compute legal move destinations (both move + capture)
            const initialPiece = getInitialBoard()[row][col];
            const hasMoved = piece !== initialPiece;

            const legalMovesInput = { piece, hasMoved, capture: true, position: from, lastMove: lastMove || undefined };
            const captureMoves = getLegalMoves(legalMovesInput) || { row: [], col: [] };
            const normalMoves = getLegalMoves({ ...legalMovesInput, capture: false }) || { row: [], col: [] };
            const moves: { row: number; col: number }[] = [];
            if (captureMoves.enPassantTarget) {
              moves.push(captureMoves.enPassantTarget);
            }

            for (const r of normalMoves.row) {
              for (const c of normalMoves.col) {
                const targetRow = row + r;
                const targetCol = col + c;
                if (
                  targetRow >= 0 &&
                  targetRow < DIMENSIONS &&
                  targetCol >= 0 &&
                  targetCol < DIMENSIONS &&
                  board[targetRow][targetCol] === ""
                ) {
                  moves.push({ row: targetRow, col: targetCol });
                }
              }
            }

            for (const r of captureMoves.row) {
              for (const c of captureMoves.col) {
                const targetRow = row + r;
                const targetCol = col + c;
                if (
                  targetRow >= 0 &&
                  targetRow < DIMENSIONS &&
                  targetCol >= 0 &&
                  targetCol < DIMENSIONS
                ) {
                  const target = board[targetRow][targetCol];
                  const isEnemy =
                    target !== "" &&
                    ((isWhite && target.includes("black")) ||
                      (!isWhite && target.includes("white")));
                  if (isEnemy) {
                    moves.push({ row: targetRow, col: targetCol });
                  }
                }
              }
            }

            setValidMoves(moves); // ✅ Set valid moves here
          }
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
        const isValid = validMoves.some(
          (move) => move.row === to.row && move.col === to.col
        );

        if (isValid) {
          const isEnPassant = draggedPiece?.includes("pawn") &&
            to.col !== from.col &&
            !board[to.row][to.col];

          setBoard((prev) => {
            const newBoard = prev.map((row) => row.slice());
            newBoard[to.row][to.col] = prev[from.row][from.col];
            newBoard[from.row][from.col] = "";
            if (isEnPassant) {
              const capturedPawnRow = whiteTurn ? to.row + 1 : to.row -1;
              newBoard[capturedPawnRow][to.col] = "";
            }
            return newBoard;
          });
          setLastMove({ from, to, piece: board[from.row][from.col] });
          setWhiteTurn((prev) => !prev);
        }
      }

      // Reset everything
      setDragging(false);
      setDraggedPiece(null);
      setDraggedFrom(null);
      setHoveredSquare(null);
      setValidMoves([]); // ✅ Clear valid moves
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
  }, [board, dragging, whiteTurn]);

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
    validMoves, // ✅ expose valid moves to use in <Board />
    lastMove,
  };
}
