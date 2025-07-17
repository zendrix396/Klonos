// components/Square.tsx
type SquareProps = {
  row: number;
  col: number;
  piece: string;
  hovered: boolean;
  dragging: boolean;
  dotExists: boolean;
  draggedFrom: { row: number; col: number } | null;
  onMouseDown: () => void;
};

export default function Square({
  row,
  col,
  piece,
  hovered,
  dragging,
  dotExists,
  draggedFrom,
  onMouseDown,
}: SquareProps) {
  const isBlack = (row + col) % 2 == 0;
  const color = isBlack ? "bg-blue-500" : "bg-blue-200";
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
      className={`w-20 h-20 ${color}  relative ${
        hovered ? "" : ""}` }
    >
      {shouldShowPiece && (
        <div
          className={`absolute inset-0 bg-contain bg-no-repeat bg-center cursor-grab`}
          style={{ backgroundImage: `url(${piece})` }}
        />
      )}
      {dotExists && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-700/30`}></div>
      )}
    </div>
  );
}
