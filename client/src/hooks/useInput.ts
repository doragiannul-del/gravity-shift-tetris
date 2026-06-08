import { useEffect } from 'react'
import { GameAction } from '../engine/gameLoop'

type Dispatch = (action: GameAction) => void

export function useInput(dispatch: Dispatch) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
          dispatch({ type: 'MOVE', direction: 'left' })
          break
        case 'ArrowRight':
          dispatch({ type: 'MOVE', direction: 'right' })
          break
        case 'ArrowUp':
          dispatch({ type: 'ROTATE', direction: 'cw' })
          break
        case 'z':
        case 'Z':
          dispatch({ type: 'ROTATE', direction: 'ccw' })
          break
        case 'ArrowDown':
          dispatch({ type: 'SOFT_DROP' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])
}
