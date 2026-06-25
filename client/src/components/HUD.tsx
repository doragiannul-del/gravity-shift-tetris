import { GameState } from '../engine/gameLoop'
import { GravityDirection } from '../engine/gravity'

const GRAVITY_ARROW: Record<GravityDirection, string> = {
  down: '↓',
  up: '↑',
  left: '←',
  right: '→',
}

interface Props {
  state: GameState
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
        {value}
      </div>
    </div>
  )
}

function HUD({ state }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '0.25rem', minWidth: '7rem' }}>
      <Stat label="Score" value={state.score} />
      <Stat label="Level" value={state.level} />
      <Stat label="Lines" value={state.linesCleared} />
      <Stat label="Gravity" value={GRAVITY_ARROW[state.gravityDirection]} />
    </div>
  )
}

export default HUD
