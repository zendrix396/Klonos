"use client";
import { useEffect, useState } from "react";
import "./globals.css";

export default function Home() {
  const dimensions = 8;
  const board = [];
  const [dragging, isDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mousedown, setMouseDown] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseDown = () => setMouseDown(true);
    const handleMouseUp = () => {
      setMouseDown(false);
      isDragging(false);
      setDraggedPiece(null);
      setDraggedFrom(null);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (mousedown) {
        isDragging(true);
        setPosition({ x: e.clientX, y: e.clientY });
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
  }, [mousedown]);


  for (let row = 0; row < dimensions; row++) {
    const row_boxes = [];
    for (let col = 0; col < dimensions; col++) {
      const isBlack = (row + col) % 2 === 0;
      const squareColor = isBlack ? "bg-blue-600" : "bg-blue-100";
      let piece = "";
      if (
        (row == 0 && col == 0) ||
        (row == 0 && col == 7) ||
        (row == 7 && col == 0) ||
        (row == 7 && col == 7)
      ) {
        piece = row == 0 ? "pieces/black_rook.png" : "pieces/white_rook.png";
      }
      if (
        (row == 0 && col == 1) ||
        (row == 0 && col == 6) ||
        (row == 7 && col == 1) ||
        (row == 7 && col == 6)
      ) {
        piece =
          row == 0 ? "pieces/black_knight.png" : "pieces/white_knight.png";
      }
      if (
        (row == 0 && col == 2) ||
        (row == 0 && col == 5) ||
        (row == 7 && col == 2) ||
        (row == 7 && col == 5)
      ) {
        piece =
          row == 0 ? "pieces/black_bishop.png" : "pieces/white_bishop.png";
      }
      if ((row == 0 && col == 3) || (row == 7 && col == 3)) {
        piece = row == 0 ? "pieces/black_queen.png" : "pieces/white_queen.png";
      }
      if ((row == 0 && col == 4) || (row == 7 && col == 4)) {
        piece = row == 0 ? "pieces/black_king.png" : "pieces/white_king.png";
      }
      if (row == 1 || row == 6) {
        piece = row == 1 ? "pieces/black_pawn.png" : "pieces/white_pawn.png";
      }

      row_boxes.push(
        <div key={`${row}-${col}`} className={`w-20 h-20 ${squareColor} p-1`}>
          {piece != "" &&
            !(dragging && draggedFrom?.row === row && draggedFrom?.col === col) && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setMouseDown(true);
                  setDraggedPiece(piece);
                  setDraggedFrom({ row, col });
                }}
                onDragStart={(e)=>e.preventDefault()}
                className="w-full h-full bg-contain bg-no-repeat bg-center cursor-grab active:cursor-grabbing"
                style={{ backgroundImage: `url(${piece})` }}
              ></div>
            )}
        </div>
      );
    }
    board.push(
      <div key={row} className="flex">
        {row_boxes}
      </div>
    );
  }

  return (
    <>
      <div className="inline-block border-1 border-blue-200 relative left-8 top-8">
        {board}
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
      </div>
    </>
  );
}
