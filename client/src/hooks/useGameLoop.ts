import { useReducer, useEffect } from 'react'
import { gameReducer, createInitialState } from '../engine/gameLoop'

const BASE_TICK_MS = 800
const MIN_TICK_MS = 100
const SPEED_STEP_MS = 50

function tickInterval(level: number): number {
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - (level - 1) * SPEED_STEP_MS)
}

export function useGameLoop() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => dispatch({ type: 'TICK' }), tickInterval(state.level))
    return () => clearInterval(id)
  }, [state.status, state.level])

  return { state, dispatch }
}
