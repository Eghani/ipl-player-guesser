const API = "http://localhost:3000";
const chat = document.getElementById("chat");

// add message to UI
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "message " + type;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// remove last message (used for "thinking...")
function removeLastMessage() {
  if (chat.lastChild) {
    chat.removeChild(chat.lastChild);
  }
}

// disable buttons while loading
function toggleButtons(state) {
  document.querySelectorAll("button").forEach((btn) => {
    if (!btn.classList.contains("start")) {
      btn.disabled = state;
    }
  });
}

// start game
async function startGame() {
  chat.innerHTML = "";

  try {
    const res = await fetch(`${API}/api/start`);
    const data = await res.json();

    addMessage("🤖 " + data.question, "ai");
  } catch (err) {
    addMessage("⚠️ Failed to start game", "ai");
  }
}

// send answer
async function sendAnswer(answer) {
  toggleButtons(true);

  // show user answer
  addMessage("You: " + answer.toUpperCase(), "user");

  // show thinking
  addMessage("🤖 Thinking...", "ai");

  try {
    const res = await fetch(`${API}/api/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    });

    const data = await res.json();

    // remove thinking message
    removeLastMessage();

    // IMPORTANT: always show latest response (no duplication)
    if (data.question) {
      addMessage("🤖 " + data.question, "ai");
    } else if (data.guess) {
      addMessage("🎯 I guess: " + data.guess, "ai");
      toggleButtons(true); // keep disabled
    } else if (data.message) {
      addMessage("⚠️ " + data.message, "ai");
      toggleButtons(true);
    }
  } catch (err) {
    removeLastMessage();
    addMessage("⚠️ Server error", "ai");
  }

  toggleButtons(false);
}
