import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState, GameState } from '../gameLoop'
import { createEmptyBoard, BOARD_COLS, BOARD_ROWS } from '../board'
import { spawnPiece } from '../piece'

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: createEmptyBoard(),
    activePiece: spawnPiece('T'),
    gravityDirection: 'down',
    status: 'playing',
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
    // Fill the top rows so no new piece can spawn
    const board = createEmptyBoard()
    board[0] = Array(10).fill('#ff0000')
    board[1] = Array(10).fill('#ff0000')
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
})

