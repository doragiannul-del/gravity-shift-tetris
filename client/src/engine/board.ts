import { PieceState, getShape, COLORS } from './piece'
import { GravityDirection } from './gravity'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export type CellState = 'empty' | string

export type BoardState = CellState[][]

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array<CellState>(BOARD_COLS).fill('empty')
  )
}

// Returns true if all filled cells of the piece are in-bounds and over empty cells.
export function isValidPosition(board: BoardState, piece: PieceState): boolean {
  const shape = getShape(piece.type, piece.rotation)
  return shape.every((shapeRow, dr) =>
    shapeRow.every((cell, dc) => {
      if (cell === 0) return true
      const r = piece.row + dr
      const c = piece.col + dc
      return r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS && board[r][c] === 'empty'
    })
  )
}

// Removes full lines in the gravity direction and adds empty lines at the opposite end.
// down/up: clears full rows. left/right: clears full columns.
// Empty space always appears at the "ceiling" — the side opposite to where pieces land.
export function clearLines(
  board: BoardState,
  direction: GravityDirection,
): { board: BoardState; linesCleared: number } {
  if (direction === 'down' || direction === 'up') {
    const remaining = board.filter(row => row.some(cell => cell === 'empty'))
    const linesCleared = BOARD_ROWS - remaining.length
    if (linesCleared === 0) return { board, linesCleared: 0 }
    const emptyRow = () => Array<CellState>(BOARD_COLS).fill('empty')
    const padding = Array.from({ length: linesCleared }, emptyRow)
    // down: pieces land at bottom, empty rows appear at top
    // up:   pieces land at top,    empty rows appear at bottom
    const next = direction === 'down'
      ? [...padding, ...remaining]
      : [...remaining, ...padding]
    return { board: next, linesCleared }
  }

  // left/right gravity: detect and clear full columns
  const fullCols = new Set<number>()
  for (let c = 0; c < BOARD_COLS; c++) {
    if (board.every(row => row[c] !== 'empty')) fullCols.add(c)
  }
  const linesCleared = fullCols.size
  if (linesCleared === 0) return { board, linesCleared: 0 }

  const emptyCell: CellState = 'empty'
  const padding = Array<CellState>(linesCleared).fill(emptyCell)
  const next = board.map(row => {
    const remaining = row.filter((_, c) => !fullCols.has(c))
    // left:  pieces land on left wall,  empty columns appear on right
    // right: pieces land on right wall, empty columns appear on left
    return direction === 'left'
      ? [...remaining, ...padding]
      : [...padding, ...remaining]
  }) as BoardState
  return { board: next, linesCleared }
}

// Returns a new board with the piece's filled cells overlaid.
// Does not mutate the source board; safe to call every render.
export function mergePieceOnBoard(board: BoardState, piece: PieceState): BoardState {
  const shape = getShape(piece.type, piece.rotation)
  const color = COLORS[piece.type]
  const next = board.map(row => [...row]) as BoardState

  shape.forEach((shapeRow, dr) => {
    shapeRow.forEach((cell, dc) => {
      if (cell === 0) return
      const r = piece.row + dr
      const c = piece.col + dc
      if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
        next[r][c] = color
      }
    })
  })

  return next
}
