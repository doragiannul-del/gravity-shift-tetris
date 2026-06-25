import Board from './components/Board'
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
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        gap: '1rem',
      }}
    >
      {state.status === 'over' && (
        <p style={{ margin: 0, color: '#f00', fontWeight: 'bold' }}>Game Over</p>
      )}
      <Board board={displayBoard} />
      <p style={{ margin: 0, color: '#555', fontSize: '0.875rem' }}>
        ← → move · ↑ rotate CW · Z rotate CCW · ↓ soft drop · G shift gravity
      </p>
    </div>
  )
}

export default App
