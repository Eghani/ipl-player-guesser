import fs from "fs";

const players = JSON.parse(fs.readFileSync("./data/players.json", "utf-8"));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

let currentQuestionIndex = 0;
let candidates = [];

const questions = [
  "Is your player Indian?",
  "Is your player a batsman?",
  "Does your player play for CSK?",
  "Is your player a bowler?",
];

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/api/test", (req, res) => {
  res.send("Backend working");
});

// START GAME
app.get("/api/start", (req, res) => {
  currentQuestionIndex = 0;
  candidates = [...players];

  console.log("Questions:", questions);
  console.log("Index:", currentQuestionIndex);

  res.json({
    question: questions[currentQuestionIndex],
  });
});
// HANDLE ANSWER
app.post("/api/answer", (req, res) => {
  const userAnswer = req.body.answer;

  // basic validation (just in case)
  if (!userAnswer) {
    return res.json({
      message: "answer is required",
    });
  }

  console.log("User Answer:", userAnswer);

  // small helper so code doesn't repeat again and again
  const isYes = userAnswer.toLowerCase() === "yes";

  // based on current question, filter players
  switch (currentQuestionIndex) {
    case 0:
      // Indian check
      candidates = candidates.filter((player) =>
        isYes ? player.indian === true : player.indian === false,
      );
      break;

    case 1:
      // batsman check
      candidates = candidates.filter((player) =>
        isYes ? player.role === "batsman" : player.role !== "batsman",
      );
      break;

    case 2:
      // CSK check
      candidates = candidates.filter((player) =>
        isYes ? player.team === "CSK" : player.team !== "CSK",
      );
      break;

    case 3:
      // bowler check
      candidates = candidates.filter((player) =>
        isYes ? player.role === "bowler" : player.role !== "bowler",
      );
      break;

    default:
      break;
  }

  console.log("Remaining candidates:", candidates);

  // move to next question
  currentQuestionIndex++;

  // if only one player left → perfect guess
  if (candidates.length === 1) {
    return res.json({
      guess: candidates[0].name,
    });
  }

  // if few players left → still try to guess
  if (candidates.length <= 2 && candidates.length > 0) {
    return res.json({
      guess: candidates[0].name,
      message: "not 100% sure but this is my best guess",
    });
  }

  // no players left
  if (candidates.length === 0) {
    return res.json({
      message: "no matching player found",
    });
  }

  // no more questions left
  if (currentQuestionIndex >= questions.length) {
    return res.json({
      guess: candidates[0]?.name || "not sure",
    });
  }

  // continue asking
  res.json({
    question: questions[currentQuestionIndex],
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
