import { Router, Request, Response } from 'express'

export interface ScoreEntry {
  name: string
  score: number
  date: string
}

// In-memory store — resets on server restart.
const scores: ScoreEntry[] = []

export function resetScores() {
  scores.length = 0
}

const router = Router()

router.post('/', (req: Request, res: Response) => {
  const { name, score } = req.body

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name must be a non-empty string' })
    return
  }
  if (name.trim().length > 20) {
    res.status(400).json({ error: 'name must be 20 characters or fewer' })
    return
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    res.status(400).json({ error: 'score must be a non-negative number' })
    return
  }

  const entry: ScoreEntry = {
    name: name.trim(),
    score: Math.floor(score),
    date: new Date().toISOString(),
  }
  scores.push(entry)
  res.status(201).json(entry)
})

router.get('/', (_req: Request, res: Response) => {
  const top10 = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  res.json(top10)
})

export default router
