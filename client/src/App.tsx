import Board from './components/Board'
import HUD from './components/HUD'
import { mergePieceOnBoard } from './engine/board'
import { useGameLoop } from './hooks/useGameLoop'
import { useInput } from './hooks/useInput'

function App() {
  const { state, dispatch } = useGameLoop()
  useInput(dispatch)

  const displayBoard = mergePieceOnBoard(state.board, state.activePiece)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        gap: '1rem',
      }}
    >
      {state.status === 'over' && (
        <p style={{ margin: 0, color: '#f44', fontWeight: 'bold', fontSize: '1.25rem' }}>
          Game Over
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
        <Board board={displayBoard} />
        <HUD state={state} />
      </div>
      <p style={{ margin: 0, color: '#555', fontSize: '0.75rem' }}>
        ← → move · ↑ rotate CW · Z rotate CCW · ↓ soft drop · G shift gravity
      </p>
    </div>
  )
}

export default App
