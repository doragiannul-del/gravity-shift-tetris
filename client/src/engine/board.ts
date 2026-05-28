export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export type CellState = 'empty' | string

export type BoardState = CellState[][]

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array<CellState>(BOARD_COLS).fill('empty')
  )
}
