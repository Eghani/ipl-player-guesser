# IPL Player Guesser — Backend

This backend powers the IPL player guessing game. It exposes a simple API for starting a game, answering yes/no questions, and returning the next AI-generated question or final guess.

## What it does

- Loads the IPL player dataset from `backend/data/players.json`
- Starts a fresh game via `GET /api/start`
- Filters candidate players based on yes/no answers
- Uses Gemini AI to generate the next distinguishing yes/no question
- Returns a final guess once the player is narrowed down or max questions are reached

## Requirements

- Node.js 18+ recommended
- npm

## Install

```bash
cd backend
npm install
```

## Environment

The backend uses `dotenv` and loads optional values from a `.env` file in the `backend` folder.

Supported variables:

- `GEMINI_API_KEY` — API key for Gemini AI
- `GEMINI_MODEL` — optional model name (defaults to `gemini-2.5-flash`)

Example `.env`:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> If `GEMINI_API_KEY` is missing, the backend will still start but AI question generation may not work properly.

## Run

```bash
cd backend
npm start
```

For live reload during development:

```bash
cd backend
npm run dev
```

## API Endpoints

### `GET /api/start`

Starts a new game and returns the first question.

Response:

```json
{ "question": "Is your player Indian?" }
```

### `GET /api/players`

Returns the current list of available IPL players.

Response includes:

- `total`
- `players`
- `message`

### `POST /api/answer`

Sends the user answer to the current question.

Request payload:

```json
{ "answer": "yes" }
```

Response can include:

- `question` — next question to ask
- `guess` — the AI's guessed player
- `message` — informational status

## Data

- Player data is stored in `backend/data/players.json`
- The dataset currently contains **40 players**

## Notes

- Game state is stored in in-memory globals and is not session-safe.
- The backend is designed for local development and demo use.
