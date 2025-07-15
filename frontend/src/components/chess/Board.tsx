"use client";
import { useEffect, useState, useRef } from "react";
import { GameState, Piece, Position } from './types';
import { createInitialGameState, getLegalMoves, makeMove } from './game-logic';

interface BoardProps {
  onMove?: (from: Position, to: Position) => void;
  externalGameState?: GameState | null;
  playerColor?: 'white' | 'black';
  isMyTurn?: boolean;
}

export default function Board({ onMove, externalGameState, playerColor = 'white', isMyTurn = true }: BoardProps) {
  const dimensions = 8;
  const [gameState, setGameState] = useState<GameState>(
    externalGameState || createInitialGameState()
  );
  
  useEffect(() => {
    if (externalGameState) {
      setGameState(externalGameState);
    }
  }, [externalGameState]);

  const [dragging, setDragging] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<Position | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [squareSize, setSquareSize] = useState(80); // Default for SSR / initial render
  const boardRef = useRef<HTMLDivElement>(null);

  // Dynamically calculate square size for responsive drag calculations
  useEffect(() => {
    const updateSquareSize = () => {
        if (boardRef.current) {
            setSquareSize(boardRef.current.offsetWidth / 8);
        }
    };
    updateSquareSize();
    window.addEventListener('resize', updateSquareSize);
    return () => window.removeEventListener('resize', updateSquareSize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, pos: Position) => {
    e.preventDefault();
    if (!isMyTurn) return; // Can't move if it's not your turn

    const piece = gameState.board[pos.row][pos.col];
    if (piece && piece.color === gameState.currentPlayer) {
      setDraggedPiece(piece);
      setDraggedFrom(pos);
      setLegalMoves(getLegalMoves(gameState, pos));
      setDragging(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dragging && draggedFrom && boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        // Use dynamic squareSize for calculations
        const col = Math.floor((e.clientX - boardRect.left) / squareSize);
        const row = Math.floor((e.clientY - boardRect.top) / squareSize);

        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
          const to = { row, col };
          if (playerColor === 'black') { // Adjust coordinates if board is flipped
              to.row = 7 - to.row;
              to.col = 7 - to.col;
          }
          const isLegal = legalMoves.some(move => move.row === to.row && move.col === to.col);
          if (isLegal) {
            if (onMove) onMove(draggedFrom, to);
            else setGameState(makeMove(gameState, draggedFrom, to));
          }
        }
      }
      setDragging(false);
      setDraggedPiece(null);
      setDraggedFrom(null);
      setLegalMoves([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, draggedFrom, gameState, legalMoves, onMove, playerColor, squareSize]);
  
  const boardRows = [];
  const orientation = playerColor === 'white' ? 'white' : 'black';

  for (let i = 0; i < 8; i++) {
    const rowSquares = [];
    for (let j = 0; j < 8; j++) {
      const row = orientation === 'white' ? i : 7 - i;
      const col = orientation === 'white' ? j : 7 - j;

      const piece = gameState.board[row][col];
      const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
      const isPieceHidden = dragging && draggedFrom?.row === row && draggedFrom?.col === col;
      
      rowSquares.push(
        <div
          key={`${row}-${col}`}
          // Responsive square sizes
          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 ${(row + col) % 2 === 0 ? "bg-blue-700" : "bg-blue-100"} relative ${!isMyTurn ? 'cursor-not-allowed' : ''}`}
          onMouseDown={(e) => handleMouseDown(e, { row, col })}
        >
          {isLegalMove && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {piece && piece.color !== gameState.currentPlayer ? (
                // Responsive capture indicator
                <div className="w-3/4 h-3/4 border-2 md:border-4 border-black/50 rounded-full"></div>
              ) : (
                // Responsive move indicator
                <div className="w-1/4 h-1/4 bg-black/50 rounded-full"></div>
              )}
            </div>
          )}
          
          {piece && !isPieceHidden && (
            <div
              className={`absolute inset-0 bg-contain bg-no-repeat bg-center ${isMyTurn ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{ backgroundImage: `url(/${piece.image})` }}
            ></div>
          )}
        </div>
      );
    }
    boardRows.push(<div key={i} className="flex flex-row">{rowSquares}</div>);
  }

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4">
      <div className={`text-2xl font-bold font-montserrat ${isMyTurn ? 'text-green-600' : 'text-stone-900'}`}>
        {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        {gameState.isCheck && <span className="text-red-500 ml-2">CHECK!</span>}
      </div>
      
      <div ref={boardRef} className={`relative border-2 md:border-4 ${isMyTurn ? 'border-green-600' : 'border-stone-800'} transition-colors`}>
        {boardRows}
      </div>
      
      {dragging && draggedPiece && (
        <div
          // Responsive dragged piece size
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 pointer-events-none fixed z-50 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(/${draggedPiece.image})`,
            left: mousePosition.x - (squareSize / 2),
            top: mousePosition.y - (squareSize / 2),
          }}
        ></div>
      )}
    </div>
  );
} 