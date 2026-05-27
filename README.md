# Gravity Shift Tetris

A Tetris variant where gravity direction can shift mid-game. Built with React, TypeScript, and Express.

## About This Project

This project was built as part of an exploration into AI-assisted software engineering workflows using Claude Code.

The goal is not only to build a game, but also to practice:
- iterative architecture design
- human-in-the-loop AI collaboration
- incremental development
- clean TypeScript and React patterns
- testing and maintainability

All architectural decisions, reviews, and implementation guidance are intentionally directed and reviewed by a human developer.

## Goals

- Explore dynamic gravity mechanics in a classic game format
- Practice TypeScript, React, and Node.js
- Learn AI-assisted engineering workflows
- Keep architecture clean and extensible

## Tech Stack

| Layer | Technology |
| --- | --- |
| Client | React 18, TypeScript, Vite |
| Server | Node.js, Express, TypeScript |
| Dev runner | tsx |
| Package management | npm workspaces |

## Architecture

Monorepo with two workspaces:

- `client/` — React SPA. Owns all rendering, input handling, and game state. Talks to the server only for scores.
- `server/` — Express REST API. Handles leaderboard (scores). Stateless; no game logic.

The game engine (`client/src/engine/`) is pure TypeScript with no React imports, making it independently testable. Gravity direction is a first-class value in game state from the start — all movement and collision logic reads from it rather than assuming a direction.

## Setup

Requires Node 18+.

```bash
git clone <repo-url>
cd gravity-shift-tetris
npm install
```

## Development Commands

```bash
# Start the client (http://localhost:5173)
npm run dev:client

# Start the server (http://localhost:3001)
npm run dev:server

# Type-check client
npx tsc --noEmit --project client/tsconfig.json

# Type-check server
npx tsc --noEmit --project server/tsconfig.json
```

## Milestones

| \# | Milestone | Status |
| --- | --- | --- |
| 1 | Scaffold — Vite client + Express server | ✅ Done |
| 2 | Static board — grid renders in React | Pending |
| 3 | Pieces + rotation — tetromino shapes, spawn, rotate | Pending |
| 4 | Standard fall — game loop tick, pieces land and lock | Pending |
| 5 | Line clearing — detect and clear full rows | Pending |
| 6 | Gravity shift — direction state shifts mid-game | Pending |
| 7 | Scoring + HUD — points, level, speed scaling | Pending |
| 8 | Server + leaderboard — scores API, persist results | Pending |
| 9 | Polish — ghost piece, next-piece preview, game-over screen | Pending |
