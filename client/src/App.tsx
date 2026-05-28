import { useState, useEffect, useCallback } from 'react'
import Board from './components/Board'
import { createEmptyBoard, mergePieceOnBoard } from './engine/board'
import { spawnPiece, rotatePiece } from './engine/piece'

const emptyBoard = createEmptyBoard()

function App() {
  const [piece, setPiece] = useState(() => spawnPiece('T'))

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setPiece(p => rotatePiece(p, 'cw'))
    } else if (e.key === 'z' || e.key === 'Z') {
      setPiece(p => rotatePiece(p, 'ccw'))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const displayBoard = mergePieceOnBoard(emptyBoard, piece)

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
      <p style={{ margin: 0, color: '#555', fontSize: '0.875rem' }}>
        ↑ rotate CW · Z rotate CCW
      </p>
      <Board board={displayBoard} />
    </div>
  )
}

export default App
