import { PieceState, getShape, COLORS } from './piece'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export type CellState = 'empty' | string

export type BoardState = CellState[][]

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array<CellState>(BOARD_COLS).fill('empty')
  )
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
