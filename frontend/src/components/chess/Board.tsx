"use client";
import { useEffect, useState, useRef } from "react";
import Square from './Square';
import { Position, GameState } from './types';
import { createInitialGameState, getLegalMoves, makeMove } from './game-logic';

export default function Board() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggedFrom, setDraggedFrom] = useState<Position | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);
  const hoveredSquareRef = useRef<Position | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging && draggedFrom && hoveredSquareRef.current) {
        const to = hoveredSquareRef.current;
        
        // Check if the move is legal
        const piece = gameState.board[draggedFrom.row][draggedFrom.col];
        if (piece && piece.color === gameState.currentPlayer) {
          const moves = getLegalMoves(gameState, draggedFrom);
          const isLegalMove = moves.some(move => move.row === to.row && move.col === to.col);
          
          if (isLegalMove) {
            const newGameState = makeMove(gameState, draggedFrom, to);
            setGameState(newGameState);
          }
        }
      }
      
      setDragging(false);
      setDraggedFrom(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        
        // Calculate which square the mouse is over
        const boardRect = document.querySelector('.chess-board')?.getBoundingClientRect();
        if (boardRect) {
          const col = Math.floor((e.clientX - boardRect.left) / 80);
          const row = Math.floor((e.clientY - boardRect.top) / 80);
          
          if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            setHoveredSquare({ row, col });
            hoveredSquareRef.current = { row, col };
          } else {
            setHoveredSquare(null);
            hoveredSquareRef.current = null;
          }
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, draggedFrom, gameState]);

  const handleSquareMouseDown = (position: Position, e: React.MouseEvent) => {
    e.preventDefault();
    const piece = gameState.board[position.row][position.col];
    
    if (piece && piece.color === gameState.currentPlayer) {
      setSelectedSquare(position);
      setDraggedFrom(position);
      setDragging(true);
      
      // Calculate legal moves
      const moves = getLegalMoves(gameState, position);
      setLegalMoves(moves);
    } else if (selectedSquare) {
      // Try to move to this square
      const moves = getLegalMoves(gameState, selectedSquare);
      const isLegalMove = moves.some(move => move.row === position.row && move.col === position.col);
      
      if (isLegalMove) {
        const newGameState = makeMove(gameState, selectedSquare, position);
        setGameState(newGameState);
      }
      
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const draggedPiece = draggedFrom && gameState.board[draggedFrom.row][draggedFrom.col];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Current player indicator */}
      <div className="text-2xl font-bold">
        Current Player: {gameState.currentPlayer === 'white' ? 'White' : 'Black'}
        {gameState.isCheck && <span className="text-red-500 ml-2">CHECK!</span>}
      </div>
      
      {/* Chess board */}
      <div className="chess-board relative">
        {Array.from({ length: 8 }, (_, row) => (
          <div key={row} className="flex">
            {Array.from({ length: 8 }, (_, col) => {
              const piece = gameState.board[row][col];
              const isBlack = (row + col) % 2 === 0;
              const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
              const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
              const isHovered = hoveredSquare?.row === row && hoveredSquare?.col === col;
              const isDragging = dragging && draggedFrom?.row === row && draggedFrom?.col === col;
              
              return (
                <Square
                  key={`${row}-${col}`}
                  position={{ row, col }}
                  piece={piece}
                  isBlack={isBlack}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isHovered={isHovered}
                  isDragging={isDragging}
                  onMouseDown={(e) => handleSquareMouseDown({ row, col }, e)}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Dragged piece */}
      {dragging && draggedPiece && (
        <div
          className="w-20 h-20 pointer-events-none fixed z-50 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${draggedPiece.image})`,
            left: mousePosition.x - 40,
            top: mousePosition.y - 40,
          }}
        />
      )}
    </div>
  );
} 