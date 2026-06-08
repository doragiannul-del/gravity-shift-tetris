import { BoardState, createEmptyBoard, isValidPosition, mergePieceOnBoard } from './board'
import { GravityDirection, getGravityVector } from './gravity'
import { PIECE_TYPES, PieceState, rotatePiece, spawnPiece } from './piece'

export type GameStatus = 'idle' | 'playing' | 'over'

export interface GameState {
  board: BoardState
  activePiece: PieceState
  gravityDirection: GravityDirection
  status: GameStatus
}

export type GameAction =
  | { type: 'TICK' }
  | { type: 'MOVE'; direction: 'left' | 'right' }
  | { type: 'ROTATE'; direction: 'cw' | 'ccw' }
  | { type: 'SOFT_DROP' }

function randomPieceType() {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

// Lock the active piece into the board and spawn the next one.
// Returns null if the spawn position is already occupied (game over).
function lockAndSpawn(state: GameState): GameState {
  const lockedBoard = mergePieceOnBoard(state.board, state.activePiece)
  const next = spawnPiece(randomPieceType())

  if (!isValidPosition(lockedBoard, next)) {
    return { ...state, board: lockedBoard, status: 'over' }
  }

  return { ...state, board: lockedBoard, activePiece: next }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
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
  }
}

export function createInitialState(): GameState {
  const board = createEmptyBoard()
  const activePiece = spawnPiece(randomPieceType())
  return { board, activePiece, gravityDirection: 'down', status: 'playing' }
}
