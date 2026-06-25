import { useState } from 'react'
import Board from './components/Board'
import HUD from './components/HUD'
import { mergePieceOnBoard } from './engine/board'
import { useGameLoop } from './hooks/useGameLoop'
import { useInput } from './hooks/useInput'
import { postScore, getScores, ScoreEntry } from './api/scores'

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error'

function App() {
  const { state, dispatch } = useGameLoop()
  useInput(dispatch)

  const [playerName, setPlayerName] = useState('')
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([])
  const [submitError, setSubmitError] = useState('')

  const displayBoard = mergePieceOnBoard(state.board, state.activePiece)

  async function handleSubmitScore(e: React.FormEvent) {
    e.preventDefault()
    if (!playerName.trim()) return
    setSubmitStatus('submitting')
    try {
      await postScore(playerName.trim(), state.score)
      const top = await getScores()
      setLeaderboard(top)
      setSubmitStatus('done')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error')
      setSubmitStatus('error')
    }
  }

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
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
        <Board board={displayBoard} />
        <HUD state={state} />
      </div>

      {state.status === 'over' && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <p style={{ color: '#f44', fontWeight: 'bold', fontSize: '1.25rem', margin: '0 0 1rem' }}>
            Game Over — {state.score} pts
          </p>

          {submitStatus === 'idle' || submitStatus === 'error' ? (
            <form onSubmit={handleSubmitScore} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                Submit
              </button>
            </form>
          ) : null}

          {submitStatus === 'error' && (
            <p style={{ color: '#f44', fontSize: '0.8rem', marginTop: '0.5rem' }}>{submitError}</p>
          )}

          {submitStatus === 'done' && leaderboard.length > 0 && (
            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TOP 10</p>
              {leaderboard.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    fontSize: '0.875rem',
                    color: entry.name === playerName.trim() ? '#ff0' : '#ccc',
                    marginBottom: '0.2rem',
                  }}
                >
                  <span>{i + 1}. {entry.name}</span>
                  <span>{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {state.status !== 'over' && (
        <p style={{ margin: 0, color: '#555', fontSize: '0.75rem' }}>
          ← → move · ↑ rotate CW · Z rotate CCW · ↓ soft drop · G shift gravity
        </p>
      )}
    </div>
  )
}

export default App
