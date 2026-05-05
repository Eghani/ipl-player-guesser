# IPL Player Guesser — Frontend

This frontend provides the user interface for the IPL player guessing game. It sends yes/no answers to the backend and displays the AI's questions and final guess.

## Files

- `index.html` — main UI markup
- `style.css` — visual styles
- `script.js` — frontend logic and API calls

## Requirements

- A modern browser
- Backend server running on `http://localhost:3000`

## Run locally

The simplest option is to open `frontend/index.html` directly in your browser.

For a local HTTP server (recommended):

```bash
cd frontend
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## How it works

1. Click **Start Game**.
2. Answer the AI's yes/no questions using the buttons.
3. The frontend sends your answer to the backend via `POST /api/answer`.
4. The backend returns the next question or a guess.

## Configuration

If your backend is not running on `http://localhost:3000`, update the `API` constant in `frontend/script.js`.

## Notes

- The UI is intentionally simple and mobile-friendly.
- The app uses Bootstrap and icons via CDN.
