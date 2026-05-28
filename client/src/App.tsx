import Board from './components/Board'
import { createEmptyBoard } from './engine/board'

const staticBoard = createEmptyBoard()

function App() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
      }}
    >
      <Board board={staticBoard} />
    </div>
  )
}

export default App
