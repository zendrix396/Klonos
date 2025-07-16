// components/Square.tsx
type SquareProps = {
  row: number;
  col: number;
  piece: string;
  hovered: boolean;
  dragging: boolean;
  draggedFrom: { row: number; col: number } | null;
  onMouseDown: () => void;
};

export default function Square({
  row,
  col,
  piece,
  hovered,
  dragging,
  draggedFrom,
  onMouseDown,
}: SquareProps) {
  const isBlack = (row + col) % 2 == 0;
  const color = isBlack ? "bg-blue-700" : "bg-blue-100";

  const shouldShowPiece =
    (!dragging || draggedFrom?.row !== row || draggedFrom?.col !== col) &&
    piece !== "";

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      onDragStart={(e) => e.preventDefault()}
      className={`w-20 h-20 ${color} relative ${
        hovered ? "border-4 border-yellow-400" : ""
      }`}
    >
      {shouldShowPiece && (
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-center cursor-grab active:cursor-grabbing"
          style={{ backgroundImage: `url(${piece})` }}
        />
      )}
    </div>
  );
}
