import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../index'
import { resetScores } from '../routes/scores'

beforeEach(() => resetScores())

describe('POST /scores', () => {
  it('returns 201 and the saved entry', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'Alice', score: 1200 })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Alice')
    expect(res.body.score).toBe(1200)
    expect(typeof res.body.date).toBe('string')
  })

  it('trims whitespace from name', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: '  Bob  ', score: 500 })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Bob')
  })

  it('floors fractional scores', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'Eve', score: 99.9 })
    expect(res.status).toBe(201)
    expect(res.body.score).toBe(99)
  })

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ score: 100 })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/name/)
  })

  it('returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: '   ', score: 100 })
    expect(res.status).toBe(400)
  })

  it('returns 400 for name longer than 20 characters', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'a'.repeat(21), score: 100 })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/20/)
  })

  it('returns 400 for missing score', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'Alice' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/score/)
  })

  it('returns 400 for negative score', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'Alice', score: -1 })
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-numeric score', async () => {
    const res = await request(app)
      .post('/scores')
      .send({ name: 'Alice', score: 'lots' })
    expect(res.status).toBe(400)
  })
})

describe('GET /scores', () => {
  it('returns an empty array when no scores exist', async () => {
    const res = await request(app).get('/scores')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns scores sorted by score descending', async () => {
    await request(app).post('/scores').send({ name: 'Low', score: 100 })
    await request(app).post('/scores').send({ name: 'High', score: 900 })
    await request(app).post('/scores').send({ name: 'Mid', score: 500 })

    const res = await request(app).get('/scores')
    expect(res.body[0].name).toBe('High')
    expect(res.body[1].name).toBe('Mid')
    expect(res.body[2].name).toBe('Low')
  })

  it('returns at most 10 scores', async () => {
    for (let i = 0; i < 15; i++) {
      await request(app).post('/scores').send({ name: `Player${i}`, score: i * 100 })
    }
    const res = await request(app).get('/scores')
    expect(res.body.length).toBe(10)
  })

  it('returns the top 10 when more than 10 exist', async () => {
    for (let i = 0; i < 15; i++) {
      await request(app).post('/scores').send({ name: `Player${i}`, score: i * 100 })
    }
    const res = await request(app).get('/scores')
    // Highest score is Player14 with 1400
    expect(res.body[0].score).toBe(1400)
    // Lowest in top 10 is Player5 with 500
    expect(res.body[9].score).toBe(500)
  })
})
