// utils/notation.ts

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function notationToCoords(square: string): { row: number; col: number } {
  const file = square[0];
  const rank = parseInt(square[1]);

  const col = files.indexOf(file);
  const row = 8 - rank;

  return { row, col };
}

export function coordsToNotation(row: number, col: number): string {
  const file = files[col];
  const rank = 8 - row;
  return `${file}${rank}`;
}
