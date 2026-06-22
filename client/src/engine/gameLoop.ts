import { BoardState, clearLines, createEmptyBoard, isValidPosition, mergePieceOnBoard } from './board'
import { GravityDirection, getGravityVector } from './gravity'
import { PIECE_TYPES, PieceState, rotatePiece, spawnPiece } from './piece'

export type GameStatus = 'idle' | 'playing' | 'over'

export interface GameState {
  board: BoardState
  activePiece: PieceState
  gravityDirection: GravityDirection
  status: GameStatus
  linesCleared: number
}

export type GameAction =
  | { type: 'TICK' }
  | { type: 'MOVE'; direction: 'left' | 'right' }
  | { type: 'ROTATE'; direction: 'cw' | 'ccw' }
  | { type: 'SOFT_DROP' }

function randomPieceType() {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

// Lock the active piece, clear any full lines, then spawn the next piece.
// If the spawn position is already occupied, the game is over.
function lockAndSpawn(state: GameState): GameState {
  const lockedBoard = mergePieceOnBoard(state.board, state.activePiece)
  const { board: clearedBoard, linesCleared } = clearLines(lockedBoard)
  const next = spawnPiece(randomPieceType())

  if (!isValidPosition(clearedBoard, next)) {
    return { ...state, board: clearedBoard, status: 'over' }
  }

  return {
    ...state,
    board: clearedBoard,
    activePiece: next,
    linesCleared: state.linesCleared + linesCleared,
  }
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
  return { board, activePiece, gravityDirection: 'down', status: 'playing', linesCleared: 0 }
}
