import { PieceState, getShape, COLORS } from '../engine/piece'

const CELL_SIZE = 20
const GRID = 4

interface Props {
  piece: PieceState
}

function NextPiece({ piece }: Props) {
  const shape = getShape(piece.type, piece.rotation)
  const color = COLORS[piece.type]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID}, ${CELL_SIZE}px)`,
        backgroundColor: '#111',
        border: '1px solid #222',
      }}
    >
      {Array.from({ length: GRID }, (_, r) =>
        Array.from({ length: GRID }, (_, c) => {
          const filled = shape[r]?.[c] === 1
          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: filled ? color : 'transparent',
                boxSizing: 'border-box',
                border: filled ? '1px solid #1e1e1e' : 'none',
              }}
            />
          )
        })
      )}
    </div>
  )
}

export default NextPiece
