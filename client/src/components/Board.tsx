import { BOARD_COLS, BOARD_ROWS, BoardState } from '../engine/board'

const CELL_SIZE = 30

interface Props {
  board: BoardState
}

function Board({ board }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_COLS}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_ROWS}, ${CELL_SIZE}px)`,
        border: '2px solid #444',
        backgroundColor: '#111',
      }}
    >
      {board.flat().map((cell, i) => (
        <div
          key={i}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            boxSizing: 'border-box',
            border: '1px solid #1e1e1e',
            backgroundColor: cell === 'empty' ? 'transparent' : cell,
          }}
        />
      ))}
    </div>
  )
}

export default Board
