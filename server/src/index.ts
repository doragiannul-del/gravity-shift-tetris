import express from 'express'
import scoresRouter from './routes/scores'

const app = express()
const PORT = 3001
const CLIENT_ORIGIN = 'http://localhost:5173'

app.use(express.json())

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.options('*', (_req, res) => res.sendStatus(204))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/scores', scoresRouter)

// Only bind the port when run directly (not when imported by tests).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export { app }
