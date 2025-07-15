"use client";
import { useEffect, useState, useRef } from "react";
import "./globals.css";


export default function Home() {
  const dimensions = 8;
  const Board = [];
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const hoveredSquareRef = useRef<{row:number, col:number}| null>(null);
  const [validMoves, setValidMoves] = useState<{ row: number, col: number }[]>([]);

  const [draggedFrom, setDraggedFrom] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const initialBoard = Array.from({ length: 8 }, (_, row) =>
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

  const [board, setBoard] = useState(initialBoard);
  useEffect(() => {
    const handleMouseDown = () => {
      setMouseDown(true);
    };
    const handleMouseUp = () => {
      setMouseDown(false);
      setDragging(false);
      const square=hoveredSquareRef.current;
      if (draggedFrom&&square&&(draggedFrom.row!==square.row||draggedFrom.col!=square.col)){
        setBoard((prev)=>{
          const newBoard = prev.map((row)=>row.slice())
          newBoard[square.row][square.col]= prev[draggedFrom.row][draggedFrom.col];
          newBoard[draggedFrom.row][draggedFrom.col] = ""
          return newBoard;
        })
      }
      setDraggedFrom(null);
      setDraggedPiece(null);
    };
    const boardOffsetX = 32; // 8*4
    const boardOffsetY = 32; // board top offset (top-8 = 2 rem or 2*16=32 px)
    const squareSize = 80; // w-20=80px
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown) {
        const x = e.clientX;
        const y = e.clientY;
        setPosition({ x, y });
        setDragging(true);
        const col = Math.floor((x - boardOffsetX) / squareSize);
        const row = Math.floor((y - boardOffsetY) / squareSize);
        if (row >= 0 && row < dimensions && col >= 0 && col < dimensions) {
          setHoveredSquare({ row, col });
          hoveredSquareRef.current = {row, col};
        } else {
          setHoveredSquare(null);
          hoveredSquareRef.current = null;
        }
        // if (!dragging){
        //   setHoveredSquare(null);
        // }
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
  }, [mouseDown]);

  for (let row = 0; row < dimensions; row++) {
    const rows = [];
    for (let col = 0; col < dimensions; col++) {
      const isBlack = (row + col) % 2 == 0;
      const color = isBlack ? "bg-blue-700" : "bg-blue-100";
      const piece = board[row][col];

      rows.push(
        <div
          key={`${row}-${col}`}
          className={`w-20 h-20 ${color} relative ${
            hoveredSquare?.row === row && hoveredSquare?.col === col
              ? "border-4 border-yellow-400"
              : ""
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            if (piece !== "") {
              setMouseDown(true);
              setDraggedPiece(piece);
              setDraggedFrom({ row, col });
            }
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {(!dragging ||
            draggedFrom?.row !== row ||
            draggedFrom?.col !== col) &&
            piece !== "" && (
              <div
                className="absolute inset-0 bg-contain bg-no-repeat bg-center cursor-grab active:cursor-grabbing"
                style={{ backgroundImage: `url(${piece})` }}
              ></div>
            )}
        </div>
      );
    }
    Board.push(
      <div key={`${row}`} className="flex flex-row">
        {rows}
      </div>
    );
  }
  return (
    <>
      <div className="relative top-8 left-8 overflow-x-hidden">{Board}</div>
      {dragging && draggedPiece && (
        <div
          className="w-20 h-20 pointer-events-none fixed z-50 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${draggedPiece})`,
            left: position.x - 40,
            top: position.y - 40,
          }}
        ></div>
      )}
    </>
  );
}
