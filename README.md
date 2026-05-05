# IPL Player Guesser

IPL Player Guesser is a small game that asks yes/no questions and tries to identify an IPL cricketer from a dataset of 40 players.

The repository is split into two parts:

- `backend/` — Node.js API server with AI question generation
- `frontend/` — Static browser interface for the game

## Quick start

1. Start the backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. Open the frontend:
   - Open `frontend/index.html` directly, or
   - Run a static server inside `frontend/`:
     ```bash
     cd frontend
     python -m http.server 8000
     ```
3. Visit the frontend in your browser and click **Start Game**.

## Project structure

- `backend/` — API server, player dataset, AI integration
- `frontend/` — UI files, client logic
- `backend/data/players.json` — IPL player dataset (40 players)

## Documentation

- See `backend/README.md` for backend installation and API details
- See `frontend/README.md` for frontend usage and configuration

## Notes

- The backend uses a simple game state model and is intended for local/demo use.
- The frontend communicates with the backend at `http://localhost:3000` by default.
