export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface PieceState {
  type: PieceType
  rotation: number // 0–3, clockwise
  row: number      // top-left corner of bounding box on the board
  col: number
}

type Shape = ReadonlyArray<ReadonlyArray<number>>
type Rotations = readonly [Shape, Shape, Shape, Shape]

// Each piece has 4 rotation states (0=spawn, 1=CW, 2=180°, 3=CCW).
// I uses a 4×4 bounding box; all others use 3×3.
const SHAPES: Record<PieceType, Rotations> = {
  I: [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  O: [
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
  ],
  T: [
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]],
  ],
  S: [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,0,0],[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,0],[0,1,0]],
  ],
  Z: [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,0],[1,0,0]],
  ],
  J: [
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]],
    [[0,0,0],[1,1,1],[0,0,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
  ],
  L: [
    [[0,0,1],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
  ],
}

export const COLORS: Record<PieceType, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
}

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

export function getShape(type: PieceType, rotation: number): Shape {
  return SHAPES[type][rotation % 4]
}

export function rotatePiece(piece: PieceState, direction: 'cw' | 'ccw'): PieceState {
  const delta = direction === 'cw' ? 1 : -1
  return {
    ...piece,
    rotation: ((piece.rotation + delta) % 4 + 4) % 4,
  }
}

// Spawn centered at the top of a 10-wide board.
// O (2-wide) starts at col 4; all others (3- or 4-wide) at col 3.
export function spawnPiece(type: PieceType): PieceState {
  return {
    type,
    rotation: 0,
    row: 0,
    col: type === 'O' ? 4 : 3,
  }
}
