export type GravityDirection = 'down' | 'up' | 'left' | 'right'

export interface GravityVector {
  dr: number
  dc: number
}

export function getGravityVector(dir: GravityDirection): GravityVector {
  switch (dir) {
    case 'down':  return { dr:  1, dc:  0 }
    case 'up':    return { dr: -1, dc:  0 }
    case 'left':  return { dr:  0, dc: -1 }
    case 'right': return { dr:  0, dc:  1 }
  }
}
