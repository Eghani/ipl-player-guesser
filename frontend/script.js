const API = "http://localhost:3000";
const chat = document.getElementById("chat");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const startButton = document.getElementById("startButton");
let isGameActive = false;

function addMessage(text, type, icon) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type}`;

  const iconBox = document.createElement("div");
  iconBox.className = "message-icon";
  iconBox.innerHTML = `<i class="bi ${icon}"></i>`;

  const content = document.createElement("p");
  content.textContent = text;

  wrapper.append(iconBox, content);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

function showThinking() {
  addMessage("Thinking...", "ai thinking", "bi-hourglass-split");
}

function removeThinking() {
  const last = chat.lastElementChild;
  if (last && last.classList.contains("thinking")) {
    chat.removeChild(last);
  }
}

function toggleButtons(shouldDisable) {
  yesButton.disabled = shouldDisable;
  noButton.disabled = shouldDisable;
}

function updateStartButton(label) {
  startButton.textContent = label;
}

function setPlaceholder() {
  chat.innerHTML =
    "<div class='chat-placeholder'>Press <strong>Start Game</strong> to begin the IPL challenge.</div>";
}

function initialize() {
  setPlaceholder();
  toggleButtons(true);
  updateStartButton("Start Game");
}

async function startGame() {
  chat.innerHTML = "";
  toggleButtons(true);
  updateStartButton("Loading...");

  try {
    const res = await fetch(`${API}/api/start`);
    const data = await res.json();

    addMessage("Hello! Let's begin.", "ai", "bi-robot-fill");
    addMessage(data.question, "ai", "bi-chat-left-dots");
    isGameActive = true;
    toggleButtons(false);
    updateStartButton("Restart Game");
  } catch (err) {
    addMessage(
      "Unable to connect. Try again.",
      "ai",
      "bi-exclamation-triangle-fill",
    );
    updateStartButton("Start Game");
    toggleButtons(true);
    isGameActive = false;
  }
}

async function sendAnswer(answer) {
  if (!isGameActive) {
    return;
  }

  toggleButtons(true);
  addMessage(answer.toUpperCase(), "user", "bi-person-fill");
  showThinking();

  try {
    const res = await fetch(`${API}/api/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    const data = await res.json();
    removeThinking();

    if (data.question) {
      addMessage(data.question, "ai", "bi-chat-left-dots");
      toggleButtons(false);
    } else if (data.guess) {
      addMessage(`I guess: ${data.guess}`, "ai", "bi-trophy-fill");
      addMessage(
        data.message || "Let's see if I got it right.",
        "ai",
        "bi-robot-fill",
      );
      isGameActive = false;
      toggleButtons(true);
    } else if (data.message) {
      addMessage(data.message, "ai", "bi-exclamation-circle-fill");
      isGameActive = false;
      toggleButtons(true);
    }
  } catch (err) {
    removeThinking();
    addMessage("Server error. Please retry.", "ai", "bi-server");
    isGameActive = false;
  }
}

startButton.addEventListener("click", startGame);
yesButton.addEventListener("click", () => sendAnswer("yes"));
noButton.addEventListener("click", () => sendAnswer("no"));

document.addEventListener("DOMContentLoaded", initialize);
