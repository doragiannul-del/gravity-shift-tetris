import { describe, it, expect } from 'vitest'
import { createEmptyBoard, mergePieceOnBoard, isValidPosition, clearLines, BOARD_ROWS, BOARD_COLS } from '../board'
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

describe('clearLines', () => {
  it('returns the board unchanged when no rows are full', () => {
    const board = createEmptyBoard()
    const { board: result, linesCleared } = clearLines(board)
    expect(linesCleared).toBe(0)
    expect(result).toEqual(board)
  })

  it('does not clear a partially filled row', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1][0] = '#ff0000' // only one cell filled
    const { linesCleared } = clearLines(board)
    expect(linesCleared).toBe(0)
  })

  it('clears a single full row and prepends one empty row', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    const { board: result, linesCleared } = clearLines(board)
    expect(linesCleared).toBe(1)
    expect(result[0]).toEqual(Array(BOARD_COLS).fill('empty'))
    expect(result[BOARD_ROWS - 1].every(c => c === 'empty')).toBe(true)
  })

  it('clears four full rows at once (Tetris)', () => {
    const board = createEmptyBoard()
    for (let r = BOARD_ROWS - 4; r < BOARD_ROWS; r++) {
      board[r] = Array(BOARD_COLS).fill('#00f0f0')
    }
    const { board: result, linesCleared } = clearLines(board)
    expect(linesCleared).toBe(4)
    result.slice(0, 4).forEach(row =>
      expect(row).toEqual(Array(BOARD_COLS).fill('empty'))
    )
  })

  it('always returns a board with BOARD_ROWS rows', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    board[BOARD_ROWS - 2] = Array(BOARD_COLS).fill('#ff0000')
    const { board: result } = clearLines(board)
    expect(result.length).toBe(BOARD_ROWS)
  })

  it('does not mutate the source board', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    const originalRow = board[BOARD_ROWS - 1]
    clearLines(board)
    expect(board[BOARD_ROWS - 1]).toBe(originalRow)
  })
})
