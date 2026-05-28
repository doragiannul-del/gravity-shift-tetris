import { describe, it, expect } from 'vitest'
import { rotatePiece, spawnPiece, getShape, PIECE_TYPES } from '../piece'

describe('rotatePiece', () => {
  it('advances rotation CW: 0 → 1', () => {
    expect(rotatePiece(spawnPiece('T'), 'cw').rotation).toBe(1)
  })

  it('wraps CW: 3 → 0', () => {
    expect(rotatePiece({ ...spawnPiece('T'), rotation: 3 }, 'cw').rotation).toBe(0)
  })

  it('decrements rotation CCW: 2 → 1', () => {
    expect(rotatePiece({ ...spawnPiece('T'), rotation: 2 }, 'ccw').rotation).toBe(1)
  })

  // JS modulo returns -1 for (-1 % 4) — the ((r+d)%4+4)%4 formula handles this.
  it('wraps CCW: 0 → 3', () => {
    expect(rotatePiece(spawnPiece('T'), 'ccw').rotation).toBe(3)
  })

  it('does not mutate the original piece', () => {
    const piece = spawnPiece('T')
    rotatePiece(piece, 'cw')
    expect(piece.rotation).toBe(0)
  })
})

describe('spawnPiece', () => {
  it('spawns all pieces at row 0', () => {
    PIECE_TYPES.forEach(type => expect(spawnPiece(type).row).toBe(0))
  })

  it('spawns all pieces at rotation 0', () => {
    PIECE_TYPES.forEach(type => expect(spawnPiece(type).rotation).toBe(0))
  })

  it('spawns O at col 4 (2-wide piece, centered on 10-wide board)', () => {
    expect(spawnPiece('O').col).toBe(4)
  })

  it('spawns all other pieces at col 3', () => {
    PIECE_TYPES.filter(t => t !== 'O').forEach(type => {
      expect(spawnPiece(type).col).toBe(3)
    })
  })
})

describe('getShape', () => {
  it('returns a different shape for each rotation of T', () => {
    const shapes = [0, 1, 2, 3].map(r => getShape('T', r))
    // All 4 T rotations are geometrically distinct
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        expect(shapes[i]).not.toEqual(shapes[j])
      }
    }
  })

  it('wraps rotation index via modulo', () => {
    expect(getShape('T', 4)).toEqual(getShape('T', 0))
    expect(getShape('T', 5)).toEqual(getShape('T', 1))
  })

  it('T R0 has bump at top-center (row 0, col 1)', () => {
    const shape = getShape('T', 0)
    expect(shape[0][0]).toBe(0)
    expect(shape[0][1]).toBe(1) // the bump
    expect(shape[0][2]).toBe(0)
  })
})
