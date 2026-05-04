import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { generateQuestion } from "./utils/gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = 3000;

// Load the dataset of IPL players with their attributes
const players = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "players.json"), "utf-8"),
);

// Game state variables (stored per request lifecycle)
// NOTE: These are global and not thread-safe. For production, use session-based storage
let candidates = []; // Players that still match user's answers
let askedQuestions = []; // History of questions asked and their mappings
let questionsAsked = 0; // Counter for question limit
const MAX_QUESTIONS = 8; // Maximum questions before making a guess

// Middleware
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse JSON request bodies

// 🟢 START GAME ENDPOINT
// GET /api/start
// Resets the game and returns the first question
// Flow: Frontend calls this when user clicks "Start New Game"
app.get("/api/start", (req, res) => {
  // Reset all game state for a fresh start
  candidates = [...players]; // Start with all players as possibilities
  askedQuestions = []; // Clear question history
  questionsAsked = 0; // Reset counter

  // First question is fixed for stability (not AI-generated)
  // This ensures consistent game start and doesn't waste an AI call
  const firstQuestion = {
    text: "Is your player Indian?",
    key: "indian",
    value: true,
  };

  askedQuestions.push(firstQuestion);

  // Return the first question to the frontend
  res.json({
    question: firstQuestion.text,
  });
});

// 🟢 GET ALL PLAYERS ENDPOINT
// GET /api/players
// Returns the list of all available IPL players in the database
// Useful for: debugging, showing user what players are available, verification
app.get("/api/players", (req, res) => {
  const playerList = players.map((p) => ({
    name: p.name,
    role: p.role,
    team: p.team,
  }));

  res.json({
    total: players.length,
    players: playerList,
    message: "Complete list of available IPL players in our game database",
  });
});

// 🟢 SIMPLE MAPPING FUNCTION (IMPORTANT)

// 🟢 ANSWER ROUTE
// Handles user's yes/no answer, filters candidates, and generates next question
app.post("/api/answer", async (req, res) => {
  const userAnswer = req.body.answer;
  if (!userAnswer || typeof userAnswer !== "string") {
    return res.status(400).json({
      error: "Invalid input. Please provide answer as 'yes' or 'no'",
    });
  }

  // Normalize answer and validate it's one of the two valid responses
  const normalizedAnswer = userAnswer.trim().toLowerCase();
  if (!["yes", "no"].includes(normalizedAnswer)) {
    return res.status(400).json({
      error: "Answer must be 'yes' or 'no'. You answered: " + userAnswer,
    });
  }

  const isYes = normalizedAnswer === "yes";

  const currentQuestion = askedQuestions[askedQuestions.length - 1];

  // Apply binary filtering based on user's answer
  // If user says YES: keep only players where player[key] === value
  // If user says NO: keep only players where player[key] !== value
  // This narrows down the candidate list with each answer
  if (currentQuestion.key) {
    candidates = candidates.filter((player) =>
      isYes
        ? player[currentQuestion.key] === currentQuestion.value
        : player[currentQuestion.key] !== currentQuestion.value,
    );
  }

  // Log remaining candidates for debugging
  console.log(
    "Remaining candidates:",
    candidates.map((p) => p.name),
  );

  questionsAsked++;

  // ==========================================
  // STOP CONDITION 1: Found the player!
  // ==========================================
  if (candidates.length === 1) {
    return res.json({
      guess: candidates[0].name,
      message: "I got it!",
    });
  }

  // ==========================================
  // STOP CONDITION 2: Reached max question limit
  // ==========================================
  if (questionsAsked >= MAX_QUESTIONS) {
    return res.json({
      guess: candidates[0]?.name || "Not sure",
      message: "Reached max questions. My best guess is above.",
    });
  }

  // ==========================================
  // STOP CONDITION 3: No players match the answers
  // ==========================================
  // This happens when:
  // - User thinks of a player NOT in our database
  // - User contradicted themselves with answers
  //
  // We should provide helpful feedback instead of just "try again"
  if (candidates.length === 0) {
    console.warn(
      "No candidates found. User may be thinking of a player not in the dataset.",
    );

    return res.json({
      message: "Hmm, no players matched your answers.",
      explanation: "This usually means:",
      reasons: [
        `1. The player you thought of is not in our database (we have ${players.length} IPL stars)`,
        "2. You may have answered inconsistently",
        "3. The player might be a recent signing not yet added",
      ],
      suggestions: [
        "Check if your player has played in IPL",
        "Try a new game with a different player",
        "View all players in our database",
      ],
      availablePlayers: players.length,
      tryAgain: true,
    });
  }

  // Generate the next question using AI
  let nextQuestion;
  try {
    const aiResponse = await generateQuestion(candidates, askedQuestions);
    nextQuestion = {
      text: aiResponse.question,
      key: aiResponse.key,
      value: aiResponse.value,
    };
  } catch (error) {
    console.error("AI generation failed:", error.message);
    return res.status(500).json({
      error: "Failed to generate question",
      message: error.message,
    });
  }

  askedQuestions.push(nextQuestion);

  // Send the new question to the user
  res.json({
    question: nextQuestion.text,
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📊 Loaded ${players.length} IPL players from database`);
  console.log(`🎯 Max questions per game: ${MAX_QUESTIONS}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   GET  /api/start    → Start a new game`);
  console.log(`   GET  /api/players  → View all available players`);
  console.log(`   POST /api/answer   → Submit user's yes/no answer\n`);
});
