import { useReducer, useEffect } from 'react'
import { gameReducer, createInitialState } from '../engine/gameLoop'

const TICK_MS = 800

export function useGameLoop() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => dispatch({ type: 'TICK' }), TICK_MS)
    return () => clearInterval(id)
  }, [state.status])

  return { state, dispatch }
}
