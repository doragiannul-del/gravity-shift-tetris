const API_BASE = 'http://localhost:3001'

export interface ScoreEntry {
  name: string
  score: number
  date: string
}

export async function postScore(name: string, score: number): Promise<ScoreEntry> {
  const res = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to post score')
  }
  return res.json()
}

export async function getScores(): Promise<ScoreEntry[]> {
  const res = await fetch(`${API_BASE}/scores`)
  if (!res.ok) throw new Error('Failed to fetch scores')
  return res.json()
}
