// components/DraggedPiece.tsx
type Props = {
  piece: string;
  position: { x: number; y: number };
};

export default function DraggedPiece({ piece, position }: Props) {
  return (
    <div
      className="w-20 h-20 pointer-events-none fixed z-50 bg-contain bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${piece})`,
        left: position.x - 40,
        top: position.y - 40,
      }}
    ></div>
  );
}
