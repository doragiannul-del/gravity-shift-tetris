import { describe, it, expect } from 'vitest'
import { createEmptyBoard, mergePieceOnBoard, isValidPosition, BOARD_ROWS, BOARD_COLS } from '../board'
import { spawnPiece, COLORS } from '../piece'

describe('createEmptyBoard', () => {
  it('produces correct dimensions', () => {
    const board = createEmptyBoard()
    expect(board.length).toBe(BOARD_ROWS)
    board.forEach(row => expect(row.length).toBe(BOARD_COLS))
  })

  it('initialises all cells to empty', () => {
    const board = createEmptyBoard()
    board.forEach(row => row.forEach(cell => expect(cell).toBe('empty')))
  })
})

describe('mergePieceOnBoard', () => {
  it('does not mutate the source board', () => {
    const board = createEmptyBoard()
    mergePieceOnBoard(board, spawnPiece('T'))
    // Source must remain untouched — App.tsx reuses the same emptyBoard every render
    board.forEach(row => row.forEach(cell => expect(cell).toBe('empty')))
  })

  it('places piece color at the correct cells', () => {
    // T R0 = [[0,1,0],[1,1,1],[0,0,0]], spawned at row 0, col 3
    // Filled cells: (0,4), (1,3), (1,4), (1,5)
    const result = mergePieceOnBoard(createEmptyBoard(), spawnPiece('T'))
    expect(result[0][4]).toBe(COLORS['T'])
    expect(result[1][3]).toBe(COLORS['T'])
    expect(result[1][4]).toBe(COLORS['T'])
    expect(result[1][5]).toBe(COLORS['T'])
  })

  it('leaves all other cells empty', () => {
    const result = mergePieceOnBoard(createEmptyBoard(), spawnPiece('T'))
    const filled = [[0,4],[1,3],[1,4],[1,5]]
    result.forEach((row, r) => {
      row.forEach((cell, c) => {
        const isFilled = filled.some(([fr, fc]) => fr === r && fc === c)
        if (!isFilled) expect(cell).toBe('empty')
      })
    })
  })

  it('silently skips cells outside board bounds', () => {
    // I piece at row -1: some cells fall above the board
    const piece = { ...spawnPiece('I'), row: -1 }
    expect(() => mergePieceOnBoard(createEmptyBoard(), piece)).not.toThrow()
  })
})

describe('isValidPosition', () => {
  it('returns true for a freshly spawned piece on an empty board', () => {
    expect(isValidPosition(createEmptyBoard(), spawnPiece('T'))).toBe(true)
  })

  it('returns false when piece is out of bounds to the left', () => {
    const piece = { ...spawnPiece('T'), col: -1 }
    expect(isValidPosition(createEmptyBoard(), piece)).toBe(false)
  })

  it('returns false when piece is out of bounds to the right', () => {
    const piece = { ...spawnPiece('T'), col: BOARD_COLS }
    expect(isValidPosition(createEmptyBoard(), piece)).toBe(false)
  })

  it('returns false when piece is below the floor', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS }
    expect(isValidPosition(createEmptyBoard(), piece)).toBe(false)
  })

  it('returns false when piece overlaps a locked cell', () => {
    const board = createEmptyBoard()
    // Place a locked cell directly where T would occupy
    board[1][4] = '#ff0000'
    const piece = spawnPiece('T') // T fills (1,4) among others
    expect(isValidPosition(board, piece)).toBe(false)
  })

  it('returns true when piece is above the board (partial spawn)', () => {
    // Cells above row 0 are allowed — they just aren't rendered
    const piece = { ...spawnPiece('I'), row: -1 }
    expect(isValidPosition(createEmptyBoard(), piece)).toBe(true)
  })
})
