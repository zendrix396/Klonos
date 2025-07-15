"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Position, GameState, Piece } from './types';
import { createInitialGameState, getLegalMoves, makeMove } from './game-logic';

export default function Board() {
  const dimensions = 8;
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [dragging, setDragging] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  
  // State for visual dragging effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  const handlePieceDrop = useCallback((from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col];
    if (piece && piece.color === gameState.currentPlayer) {
      const isLegal = legalMoves.some(move => move.row === to.row && move.col === to.col);
      if (isLegal) {
        const newGameState = makeMove(gameState, from, to);
        setGameState(newGameState);
      }
    }
    
    // Reset dragging state
    setDragging(false);
    setDraggedPiece(null);
    setDraggedFrom(null);
    setLegalMoves([]);
    setHoveredSquare(null);
  }, [gameState, legalMoves]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !boardRef.current) return;
      
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const boardRect = boardRef.current.getBoundingClientRect();
      const col = Math.floor((e.clientX - boardRect.left) / 80);
      const row = Math.floor((e.clientY - boardRect.top) / 80);

      if (row >= 0 && row < dimensions && col >= 0 && col < dimensions) {
        setHoveredSquare({ row, col });
      } else {
        setHoveredSquare(null);
      }
    };
    
    const handleMouseUp = () => {
      if (dragging && draggedFrom && hoveredSquare) {
        handlePieceDrop(draggedFrom, hoveredSquare);
      } else if (dragging) {
        // If dropped outside the board, just reset
        setDragging(false);
        setDraggedPiece(null);
        setDraggedFrom(null);
        setLegalMoves([]);
        setHoveredSquare(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, draggedFrom, hoveredSquare, handlePieceDrop]);

  const handleSquareMouseDown = (pos: Position) => {
    const piece = gameState.board[pos.row][pos.col];
    if (piece && piece.color === gameState.currentPlayer) {
      setDragging(true);
      setDraggedPiece(piece);
      setDraggedFrom(pos);
      setLegalMoves(getLegalMoves(gameState, pos));
    }
  };

  const boardSquares = [];
  for (let row = 0; row < dimensions; row++) {
    const rows = [];
    for (let col = 0; col < dimensions; col++) {
      const isBlack = (row + col) % 2 === 0;
      const color = isBlack ? "bg-blue-700" : "bg-blue-100";
      const piece = gameState.board[row][col];
      const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
      
      // The piece should be invisible on its original square while being dragged
      const isPieceHidden = dragging && draggedFrom?.row === row && draggedFrom?.col === col;

      rows.push(
        <div
          key={`${row}-${col}`}
          className={`w-20 h-20 ${color} relative ${
            hoveredSquare?.row === row && hoveredSquare?.col === col
              ? "border-4 border-yellow-400"
              : ""
          }`}
          onMouseDown={() => handleSquareMouseDown({ row, col })}
        >
          {/* Legal move indicator */}
          {isLegalMove && !isPieceHidden && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {piece ? (
                <div className="w-16 h-16 border-4 border-black/50 rounded-full"></div>
              ) : (
                <div className="w-4 h-4 bg-black/50 rounded-full"></div>
              )}
            </div>
          )}
          
          {/* Piece */}
          {piece && !isPieceHidden && (
            <div
              className="absolute inset-0 bg-contain bg-no-repeat bg-center cursor-grab active:cursor-grabbing"
              style={{ backgroundImage: `url(/${piece.image})` }}
            ></div>
          )}
        </div>
      );
    }
    boardSquares.push(<div key={row} className="flex flex-row">{rows}</div>);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold">
        Current Player: {gameState.currentPlayer === 'white' ? 'White' : 'Black'}
        {gameState.isCheck && <span className="text-red-500 ml-2">CHECK!</span>}
      </div>
      
      <div ref={boardRef} className="relative overflow-hidden">{boardSquares}</div>
      
      {dragging && draggedPiece && (
        <div
          className="w-20 h-20 pointer-events-none fixed z-50 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(/${draggedPiece.image})`,
            left: mousePosition.x - 40,
            top: mousePosition.y - 40,
          }}
        ></div>
      )}
    </div>
  );
} 