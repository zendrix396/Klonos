// components/Board.tsx
import Square from "./Square";

type BoardProps = {
  board: string[][];
  hoveredSquare: { row: number; col: number } | null;
  dragging: boolean;
  draggedFrom: { row: number; col: number } | null;
  setMouseDown: (val: boolean) => void;
  setDraggedPiece: (piece: string) => void;
  setDraggedFrom: (pos: { row: number; col: number }) => void;
};

export default function Board({
  board,
  hoveredSquare,
  dragging,
  draggedFrom,
  setMouseDown,
  setDraggedPiece,
  setDraggedFrom,
}: BoardProps) {

  return ( 
    <div className="relative top-8 left-8 overflow-x-hidden">
      {board.map((rowArr, row) => (
        <div key={row} className="flex flex-row">
          {rowArr.map((piece, col) => (
            <Square
              key={`${row}-${col}`}
              row={row}
              col={col}
              piece={piece}
              hovered={hoveredSquare?.row === row && hoveredSquare?.col === col}
              dragging={dragging}
              draggedFrom={draggedFrom}
              dotExists={( row>= draggedFrom?.row-2 && row<=draggedFrom?.row-1  && col===draggedFrom?.col && dragging)?true:false}
              onMouseDown={() => {
                if (piece !== "") {
                  setMouseDown(true);
                  setDraggedPiece(piece);
                  setDraggedFrom({ row, col });
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
