import { BoardState, clearLines, createEmptyBoard, isValidPosition, mergePieceOnBoard } from './board'
import { GravityDirection, getGravityVector } from './gravity'
import { PIECE_TYPES, PieceState, rotatePiece, spawnPiece } from './piece'

export type GameStatus = 'idle' | 'playing' | 'over'

export interface GameState {
  board: BoardState
  activePiece: PieceState
  nextPiece: PieceState
  gravityDirection: GravityDirection
  status: GameStatus
  score: number
  level: number
  linesCleared: number
}

const LINE_POINTS: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 }

export function scoreForLines(lines: number, level: number): number {
  return (LINE_POINTS[lines] ?? 0) * level
}

export type GameAction =
  | { type: 'TICK' }
  | { type: 'MOVE'; direction: 'left' | 'right' }
  | { type: 'ROTATE'; direction: 'cw' | 'ccw' }
  | { type: 'SOFT_DROP' }
  | { type: 'SHIFT_GRAVITY' }
  | { type: 'RESTART' }

const GRAVITY_CYCLE: Record<GravityDirection, GravityDirection> = {
  down: 'left',
  left: 'up',
  up: 'right',
  right: 'down',
}

function randomPieceType() {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

// Lock the active piece, clear any full lines, then promote nextPiece to active.
// If the spawn position is already occupied, the game is over.
function lockAndSpawn(state: GameState): GameState {
  const lockedBoard = mergePieceOnBoard(state.board, state.activePiece)
  const { board: clearedBoard, linesCleared } = clearLines(lockedBoard, state.gravityDirection)

  if (!isValidPosition(clearedBoard, state.nextPiece)) {
    return { ...state, board: clearedBoard, status: 'over' }
  }

  const totalLines = state.linesCleared + linesCleared
  const level = Math.floor(totalLines / 10) + 1

  return {
    ...state,
    board: clearedBoard,
    activePiece: state.nextPiece,
    nextPiece: spawnPiece(randomPieceType()),
    score: state.score + scoreForLines(linesCleared, state.level),
    level,
    linesCleared: totalLines,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'RESTART') return createInitialState()
  if (state.status !== 'playing') return state

  const { activePiece, board } = state

  switch (action.type) {
    case 'TICK':
    case 'SOFT_DROP': {
      const vec = getGravityVector(state.gravityDirection)
      const moved = { ...activePiece, row: activePiece.row + vec.dr, col: activePiece.col + vec.dc }
      if (isValidPosition(board, moved)) {
        return { ...state, activePiece: moved }
      }
      return lockAndSpawn(state)
    }

    case 'MOVE': {
      const dc = action.direction === 'left' ? -1 : 1
      const moved = { ...activePiece, col: activePiece.col + dc }
      if (isValidPosition(board, moved)) {
        return { ...state, activePiece: moved }
      }
      return state
    }

    case 'ROTATE': {
      const rotated = rotatePiece(activePiece, action.direction)
      if (isValidPosition(board, rotated)) {
        return { ...state, activePiece: rotated }
      }
      return state
    }

    case 'SHIFT_GRAVITY': {
      return { ...state, gravityDirection: GRAVITY_CYCLE[state.gravityDirection] }
    }
  }
}

export function createInitialState(): GameState {
  const board = createEmptyBoard()
  const activePiece = spawnPiece(randomPieceType())
  const nextPiece = spawnPiece(randomPieceType())
  return { board, activePiece, nextPiece, gravityDirection: 'down', status: 'playing', score: 0, level: 1, linesCleared: 0 }
}
