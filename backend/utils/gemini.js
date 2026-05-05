import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

// =====================================================
// GEMINI AI INTEGRATION
// =====================================================
// This module handles communication with Google's Gemini AI
// to generate intelligent yes/no questions that distinguish IPL players
// =====================================================

console.log(
  "API Key loaded:",
  process.env.GEMINI_API_KEY ? "✓ Exists" : "✗ Missing",
);

// Initialize Gemini AI client with API key
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateQuestion(candidates, askedQuestions) {
  const playerNames = candidates.map((p) => p.name).join(", ");
  const asked = askedQuestions.map((q) => q.text).join(", ");
  const prompt = `You are an intelligent IPL guessing system.

Remaining players: ${playerNames}

Questions already asked: ${asked}

Generate the best next yes/no question to distinguish these players.

Valid attributes:
- indian: true/false
- role: batsman, bowler, wicketkeeper, allrounder
- team: CSK, MI, RCB, etc.
- isCaptain: true/false
- battingPosition: top, middle, finisher
- battingStyle: left, right
- playsDeathOvers: true/false
- isAggressive: true/false

IMPORTANT: Return ONLY a JSON object with this exact format. No text before or after:

{"question": "Is your player a bowler?", "key": "role", "value": "bowler"}

Example: {"question": "Is your player Indian?", "key": "indian", "value": true}`;

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = ai.getGenerativeModel({ model: modelName });

  const response = await model.generateContent(prompt);

  const rawText = response.response.text().trim();
  console.log("AI Raw Response:", rawText);
  let jsonText = rawText;

  // Remove markdown code blocks if AI wrapped the JSON
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Try to find JSON object if there's extra text around it
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  try {
    // Parse and validate the JSON structure
    const result = JSON.parse(jsonText);
    if (result.question && result.key && result.value !== undefined) {
      console.log("Parsed successfully:", result);
      return result;
    } else {
      throw new Error(
        "Invalid JSON structure - missing question, key, or value",
      );
    }
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", jsonText);
    console.error("Error:", error.message);
    // Fallback: return a safe default question that always works
    // This should rarely happen with current prompt engineering
    return {
      question: "Is your player Indian?",
      key: "indian",
      value: true,
    };
  }
}
