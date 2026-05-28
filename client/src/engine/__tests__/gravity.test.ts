import { describe, it, expect } from 'vitest'
import { getGravityVector } from '../gravity'

describe('getGravityVector', () => {
  it('returns correct vector for down', () => {
    expect(getGravityVector('down')).toEqual({ dr: 1, dc: 0 })
  })

  it('returns correct vector for up', () => {
    expect(getGravityVector('up')).toEqual({ dr: -1, dc: 0 })
  })

  it('returns correct vector for left', () => {
    expect(getGravityVector('left')).toEqual({ dr: 0, dc: -1 })
  })

  it('returns correct vector for right', () => {
    expect(getGravityVector('right')).toEqual({ dr: 0, dc: 1 })
  })
})
