import { Position, Piece } from './types';

interface SquareProps {
  position: Position;
  piece: Piece | null;
  isBlack: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isHovered: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function Square({
  position,
  piece,
  isBlack,
  isSelected,
  isLegalMove,
  isHovered,
  isDragging,
  onMouseDown
}: SquareProps) {
  const baseColor = isBlack ? 'bg-blue-700' : 'bg-blue-100';
  
  return (
    <div
      className={`w-20 h-20 ${baseColor} relative ${
        isHovered ? 'border-4 border-yellow-400' : ''
      } ${isSelected ? 'ring-4 ring-green-400' : ''}`}
      onMouseDown={onMouseDown}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Legal move indicator */}
      {isLegalMove && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center">
          {piece ? (
            // Capture indicator
            <div className="w-16 h-16 border-4 border-black/60 rounded-full"></div>
          ) : (
            // Move indicator
            <div className="w-4 h-4 bg-black/60 rounded-full"></div>
          )}
        </div>
      )}
      
      {/* Piece */}
      {piece && !isDragging && (
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-center cursor-grab active:cursor-grabbing"
          style={{ backgroundImage: `url(${piece.image})` }}
        ></div>
      )}
    </div>
  );
} 