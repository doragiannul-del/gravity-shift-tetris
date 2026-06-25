import { describe, it, expect } from 'vitest'
import { createEmptyBoard, mergePieceOnBoard, isValidPosition, clearLines, getGhostPiece, withOpacity, BOARD_ROWS, BOARD_COLS } from '../board'
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
  // --- down gravity (original behaviour) ---

  it('returns the board unchanged when no rows are full (down)', () => {
    const board = createEmptyBoard()
    const { board: result, linesCleared } = clearLines(board, 'down')
    expect(linesCleared).toBe(0)
    expect(result).toEqual(board)
  })

  it('does not clear a partially filled row (down)', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1][0] = '#ff0000'
    const { linesCleared } = clearLines(board, 'down')
    expect(linesCleared).toBe(0)
  })

  it('clears a single full row and prepends one empty row at top (down)', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    const { board: result, linesCleared } = clearLines(board, 'down')
    expect(linesCleared).toBe(1)
    expect(result[0]).toEqual(Array(BOARD_COLS).fill('empty'))
    expect(result[BOARD_ROWS - 1].every(c => c === 'empty')).toBe(true)
  })

  it('clears four full rows at once — Tetris (down)', () => {
    const board = createEmptyBoard()
    for (let r = BOARD_ROWS - 4; r < BOARD_ROWS; r++) {
      board[r] = Array(BOARD_COLS).fill('#00f0f0')
    }
    const { board: result, linesCleared } = clearLines(board, 'down')
    expect(linesCleared).toBe(4)
    result.slice(0, 4).forEach(row =>
      expect(row).toEqual(Array(BOARD_COLS).fill('empty'))
    )
  })

  it('always returns a board with BOARD_ROWS rows (down)', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    board[BOARD_ROWS - 2] = Array(BOARD_COLS).fill('#ff0000')
    const { board: result } = clearLines(board, 'down')
    expect(result.length).toBe(BOARD_ROWS)
  })

  it('does not mutate the source board', () => {
    const board = createEmptyBoard()
    board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
    const originalRow = board[BOARD_ROWS - 1]
    clearLines(board, 'down')
    expect(board[BOARD_ROWS - 1]).toBe(originalRow)
  })

  // --- up gravity ---

  it('clears a full row and appends one empty row at bottom (up)', () => {
    const board = createEmptyBoard()
    board[0] = Array(BOARD_COLS).fill('#ff0000') // pieces land at top
    const { board: result, linesCleared } = clearLines(board, 'up')
    expect(linesCleared).toBe(1)
    // Empty row appears at the bottom (ceiling for up gravity)
    expect(result[BOARD_ROWS - 1]).toEqual(Array(BOARD_COLS).fill('empty'))
  })

  // --- left gravity ---

  it('clears a full column and appends an empty column on the right (left)', () => {
    const board = createEmptyBoard()
    // Fill column 0 (left wall — where pieces land under left gravity)
    for (let r = 0; r < BOARD_ROWS; r++) board[r][0] = '#ff0000'
    const { board: result, linesCleared } = clearLines(board, 'left')
    expect(linesCleared).toBe(1)
    // col 0 should now be empty (shifted left), col BOARD_COLS-1 is the new empty col
    result.forEach(row => expect(row[BOARD_COLS - 1]).toBe('empty'))
    result.forEach(row => expect(row[0]).toBe('empty'))
  })

  it('does not clear a partially filled column (left)', () => {
    const board = createEmptyBoard()
    board[0][0] = '#ff0000' // only one cell in col 0
    const { linesCleared } = clearLines(board, 'left')
    expect(linesCleared).toBe(0)
  })

  it('always returns BOARD_ROWS rows and BOARD_COLS cols after column clear (left)', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < BOARD_ROWS; r++) board[r][0] = '#ff0000'
    const { board: result } = clearLines(board, 'left')
    expect(result.length).toBe(BOARD_ROWS)
    result.forEach(row => expect(row.length).toBe(BOARD_COLS))
  })

  // --- right gravity ---

  it('clears a full column and prepends an empty column on the left (right)', () => {
    const board = createEmptyBoard()
    // Fill column BOARD_COLS-1 (right wall — where pieces land under right gravity)
    for (let r = 0; r < BOARD_ROWS; r++) board[r][BOARD_COLS - 1] = '#ff0000'
    const { board: result, linesCleared } = clearLines(board, 'right')
    expect(linesCleared).toBe(1)
    // col 0 is the new empty column prepended on the left
    result.forEach(row => expect(row[0]).toBe('empty'))
    result.forEach(row => expect(row[BOARD_COLS - 1]).toBe('empty'))
  })
})

describe('withOpacity', () => {
  it('appends correct hex byte for 0% opacity', () => {
    expect(withOpacity('#ff0000', 0)).toBe('#ff000000')
  })

  it('appends correct hex byte for 100% opacity', () => {
    expect(withOpacity('#ff0000', 1)).toBe('#ff0000ff')
  })

  it('appends correct hex byte for 30% opacity (ghost color)', () => {
    // 0.3 * 255 = 76.5 → rounds to 77 = 0x4d
    expect(withOpacity('#00f0f0', 0.3)).toBe('#00f0f04d')
  })
})

describe('getGhostPiece', () => {
  it('returns a piece at the floor when the board is empty (down gravity)', () => {
    const piece = spawnPiece('T') // row 0
    const ghost = getGhostPiece(createEmptyBoard(), piece, 'down')
    // T R0: last filled row is index 1 in the bounding box ([1,1,1]).
    // Ghost lands when row+1 = BOARD_ROWS-1, so ghost.row = BOARD_ROWS-2.
    expect(ghost.row).toBe(BOARD_ROWS - 2)
    expect(ghost.col).toBe(piece.col)
    expect(ghost.rotation).toBe(piece.rotation)
  })

  it('is blocked by a locked cell above the floor', () => {
    const board = createEmptyBoard()
    // Block row 10 — T's last filled row is row+1, so ghost stops at row 8.
    for (let c = 0; c < BOARD_COLS; c++) board[10][c] = '#ff0000'
    const piece = spawnPiece('T')
    const ghost = getGhostPiece(board, piece, 'down')
    expect(ghost.row).toBe(8)
  })

  it('returns the piece unchanged when it is already at the floor', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const ghost = getGhostPiece(createEmptyBoard(), piece, 'down')
    expect(ghost.row).toBe(piece.row)
  })

  it('respects left gravity direction', () => {
    const piece = { ...spawnPiece('T'), row: 5, col: 5 }
    const ghost = getGhostPiece(createEmptyBoard(), piece, 'left')
    // Piece falls left; ghost col should be less than starting col
    expect(ghost.col).toBeLessThan(piece.col)
  })
})
