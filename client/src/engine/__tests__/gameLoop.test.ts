import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState, scoreForLines, GameState } from '../gameLoop'
import { createEmptyBoard, BOARD_COLS, BOARD_ROWS } from '../board'
import { spawnPiece } from '../piece'

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: createEmptyBoard(),
    activePiece: spawnPiece('T'),
    gravityDirection: 'down',
    status: 'playing',
    score: 0,
    level: 1,
    linesCleared: 0,
    ...overrides,
  }
}

describe('gameReducer — TICK', () => {
  it('moves the active piece down by one row', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.activePiece.row).toBe(state.activePiece.row + 1)
  })

  it('does not change the locked board while piece is falling', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.board).toEqual(state.board)
  })

  it('locks the piece and spawns the next when it hits the floor', () => {
    // T at bottom row — a tick cannot move it further down
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ activePiece: piece })
    const next = gameReducer(state, { type: 'TICK' })
    // Piece is locked: board is no longer empty
    const hasLockedCells = next.board.some(row => row.some(c => c !== 'empty'))
    expect(hasLockedCells).toBe(true)
    // A new piece was spawned (different position)
    expect(next.activePiece.row).not.toBe(piece.row)
  })

  it('transitions to "over" when spawn is blocked', () => {
    // (1,4) is in the spawn footprint of all 7 piece types at their default
    // columns (col 3 for most, col 4 for O). One blocked cell is enough to
    // prevent any piece from spawning. It must NOT form a full row so that
    // clearLines doesn't remove it before the spawn check.
    const board = createEmptyBoard()
    board[1][4] = '#ff0000'
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ board, activePiece: piece })
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.status).toBe('over')
  })

  it('is a no-op when status is "over"', () => {
    const state = playingState({ status: 'over' })
    expect(gameReducer(state, { type: 'TICK' })).toBe(state)
  })
})

describe('gameReducer — MOVE', () => {
  it('moves the piece left', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'MOVE', direction: 'left' })
    expect(next.activePiece.col).toBe(state.activePiece.col - 1)
  })

  it('moves the piece right', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'MOVE', direction: 'right' })
    expect(next.activePiece.col).toBe(state.activePiece.col + 1)
  })

  it('does not move left into the wall', () => {
    const piece = { ...spawnPiece('T'), col: 0 }
    const state = playingState({ activePiece: piece })
    const next = gameReducer(state, { type: 'MOVE', direction: 'left' })
    expect(next.activePiece.col).toBe(0)
  })

  it('does not move right into the wall', () => {
    const piece = { ...spawnPiece('T'), col: BOARD_COLS - 3 }
    const state = playingState({ activePiece: piece })
    const next = gameReducer(state, { type: 'MOVE', direction: 'right' })
    expect(next.activePiece.col).toBe(piece.col)
  })

  it('does not move left into a locked cell', () => {
    // T R0 at (row=5, col=3) fills: (5,4),(6,3),(6,4),(6,5)
    // Moving left would put the stem at col 2 — block col (6,2) to prevent it.
    const board = createEmptyBoard()
    board[6][2] = '#ff0000'
    const piece = { ...spawnPiece('T'), row: 5 }
    const state = playingState({ board, activePiece: piece })
    const next = gameReducer(state, { type: 'MOVE', direction: 'left' })
    expect(next.activePiece.col).toBe(piece.col)
  })

  it('does not move right into a locked cell', () => {
    // T R0 at (row=5, col=3) fills: (5,4),(6,3),(6,4),(6,5)
    // Moving right would put the rightmost cell at col 6 — block it.
    const board = createEmptyBoard()
    board[6][6] = '#ff0000'
    const piece = { ...spawnPiece('T'), row: 5 }
    const state = playingState({ board, activePiece: piece })
    const next = gameReducer(state, { type: 'MOVE', direction: 'right' })
    expect(next.activePiece.col).toBe(piece.col)
  })
})

describe('gameReducer — SOFT_DROP', () => {
  it('moves the piece down by one row, same as TICK', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'SOFT_DROP' })
    expect(next.activePiece.row).toBe(state.activePiece.row + 1)
  })

  it('locks and spawns when the piece hits the floor', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ activePiece: piece })
    const next = gameReducer(state, { type: 'SOFT_DROP' })
    const hasLockedCells = next.board.some(row => row.some(c => c !== 'empty'))
    expect(hasLockedCells).toBe(true)
  })
})

describe('gameReducer — ROTATE', () => {
  it('rotates CW', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'ROTATE', direction: 'cw' })
    expect(next.activePiece.rotation).toBe(1)
  })

  it('rotates CCW', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'ROTATE', direction: 'ccw' })
    expect(next.activePiece.rotation).toBe(3)
  })

  it('does not rotate when blocked by a locked cell', () => {
    // T R0 at (row=5, col=3) fills: (5,4),(6,3),(6,4),(6,5)
    // T R1 at (row=5, col=3) would fill: (5,4),(6,4),(6,5),(7,4)
    // Blocking (7,4) prevents the CW rotation.
    const board = createEmptyBoard()
    board[7][4] = '#ff0000'
    const piece = { ...spawnPiece('T'), row: 5 }
    const state = playingState({ board, activePiece: piece })
    const next = gameReducer(state, { type: 'ROTATE', direction: 'cw' })
    expect(next.activePiece.rotation).toBe(piece.rotation)
  })
})

describe('createInitialState', () => {
  it('starts in playing status', () => {
    expect(createInitialState().status).toBe('playing')
  })

  it('starts with gravity direction down', () => {
    expect(createInitialState().gravityDirection).toBe('down')
  })

  it('starts with an empty board', () => {
    const { board } = createInitialState()
    board.forEach(row => row.forEach(cell => expect(cell).toBe('empty')))
  })

  it('starts with linesCleared of 0', () => {
    expect(createInitialState().linesCleared).toBe(0)
  })
})

describe('gameReducer — SHIFT_GRAVITY', () => {
  it('cycles down → left → up → right → down', () => {
    const dirs: Array<GameState['gravityDirection']> = ['down', 'left', 'up', 'right', 'down']
    let state = playingState({ gravityDirection: 'down' })
    for (let i = 1; i < dirs.length; i++) {
      state = gameReducer(state, { type: 'SHIFT_GRAVITY' })
      expect(state.gravityDirection).toBe(dirs[i])
    }
  })

  it('does not change board or piece on shift', () => {
    const state = playingState()
    const next = gameReducer(state, { type: 'SHIFT_GRAVITY' })
    expect(next.board).toEqual(state.board)
    expect(next.activePiece).toEqual(state.activePiece)
  })

  it('is a no-op when status is "over"', () => {
    const state = playingState({ status: 'over' })
    expect(gameReducer(state, { type: 'SHIFT_GRAVITY' })).toBe(state)
  })
})

describe('scoreForLines', () => {
  it('returns 0 for 0 lines', () => {
    expect(scoreForLines(0, 1)).toBe(0)
  })

  it('returns 100 for 1 line at level 1', () => {
    expect(scoreForLines(1, 1)).toBe(100)
  })

  it('returns 300 for 2 lines at level 1', () => {
    expect(scoreForLines(2, 1)).toBe(300)
  })

  it('returns 500 for 3 lines at level 1', () => {
    expect(scoreForLines(3, 1)).toBe(500)
  })

  it('returns 800 for 4 lines (Tetris) at level 1', () => {
    expect(scoreForLines(4, 1)).toBe(800)
  })

  it('scales with level — 1 line at level 3 = 300', () => {
    expect(scoreForLines(1, 3)).toBe(300)
  })

  it('scales with level — 4 lines at level 2 = 1600', () => {
    expect(scoreForLines(4, 2)).toBe(1600)
  })
})

describe('gameReducer — line clearing integration', () => {
  // Shared board setup: pre-fill the bottom row except the 3 cols T will lock into.
  // T R0 at (row=BOARD_ROWS-2, col=3) locks into row BOARD_ROWS-1 at cols 3, 4, 5.
  function boardWithAlmostFullBottom() {
    const board = createEmptyBoard()
    for (let c = 0; c < BOARD_COLS; c++) {
      if (c < 3 || c > 5) board[BOARD_ROWS - 1][c] = '#ff0000'
    }
    return board
  }

  it('increments linesCleared when a full row is cleared on lock', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ board: boardWithAlmostFullBottom(), activePiece: piece })
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.linesCleared).toBe(1)
  })

  it('awards score at the current level on lock', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ board: boardWithAlmostFullBottom(), activePiece: piece, level: 1, score: 0 })
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.score).toBe(100) // 1 line × level 1
  })

  it('scores at level 2 correctly', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    const state = playingState({ board: boardWithAlmostFullBottom(), activePiece: piece, level: 2, score: 0 })
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.score).toBe(200) // 1 line × level 2
  })

  it('advances level after 10 total lines cleared', () => {
    const piece = { ...spawnPiece('T'), row: BOARD_ROWS - 2 }
    // Already at 9 lines — one more clears pushes to 10 → level 2
    const state = playingState({ board: boardWithAlmostFullBottom(), activePiece: piece, linesCleared: 9, level: 1 })
    const next = gameReducer(state, { type: 'TICK' })
    expect(next.linesCleared).toBe(10)
    expect(next.level).toBe(2)
  })
})

