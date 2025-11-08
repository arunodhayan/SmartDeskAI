// ============================================================
// 🧠 SmartDesk AI Browser Extension (Final Version)
// ============================================================
// Features:
// - Summarize current page
// - Stream chat replies from backend (/chat/stream)
// - Persistent memory per page (summary + chat)
// - Hidden API address in UI (configurable in Settings)
// ============================================================

// === Load saved API or default ===
let backend = localStorage.getItem("smartdesk_api") || "http://127.0.0.1:8000";
let lastSummary = "";
let currentUrl = "";

// === UI References ===
const summaryBox = document.getElementById("summary");
const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const summarizeBtn = document.getElementById("summarize");
const clearBtn = document.getElementById("clear");

// === Settings Modal ===
const settingsBtn = document.getElementById("settings-btn");
const modal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal");
const saveApiBtn = document.getElementById("save-api");
const apiInput = document.getElementById("api-input");

// ============================================================
// ⚙️ SETTINGS HANDLER
// ============================================================
settingsBtn.onclick = () => {
  apiInput.value = backend;
  modal.style.display = "flex";
};
closeModalBtn.onclick = () => (modal.style.display = "none");

saveApiBtn.onclick = () => {
  const newApi = apiInput.value.trim();
  if (!newApi) return alert("Please enter a valid API URL.");
  backend = newApi;
  localStorage.setItem("smartdesk_api", backend);
  modal.style.display = "none";
  alert("✅ API endpoint saved!");
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ============================================================
// 🌍 Get Current Tab URL and Restore Previous Data
// ============================================================
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  currentUrl = tabs[0].url;
  const stored = await chrome.storage.local.get(currentUrl);
  if (stored[currentUrl]) {
    const data = stored[currentUrl];
    summaryBox.innerText = data.summary || "No summary available.";
    chatBox.innerHTML = data.chat || "";
    lastSummary = data.summary || "";
  }
});

// ============================================================
// 💾 Save Current Page State
// ============================================================
async function savePageState() {
  const data = {
    summary: summaryBox.innerText,
    chat: chatBox.innerHTML,
  };
  await chrome.storage.local.set({ [currentUrl]: data });
}

// ============================================================
// 🧾 SUMMARIZE CURRENT PAGE
// ============================================================
summarizeBtn.onclick = async () => {
  summaryBox.innerText = "⏳ Summarizing current page...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result: pageText }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText.slice(0, 10000),
  });

  try {
    const res = await fetch(`${backend}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: pageText }),
    });

    const data = await res.json();
    lastSummary = data.summary || "";
    summaryBox.innerText = data.summary || "No summary generated.";
    chatBox.innerHTML = "<b>SmartDesk AI:</b> Ready for your questions.";

    savePageState();
  } catch (err) {
    console.error("Summarization error:", err);
    summaryBox.innerText = "❌ Error summarizing page.";
  }
};

// ============================================================
// 💬 STREAMING CHAT FUNCTION
// ============================================================
sendBtn.onclick = async () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  msgInput.value = "";

  chatBox.innerHTML += `<div><b>AI:</b> <span id="ai-reply"></span></div>`;
  const aiReply = document.getElementById("ai-reply");

  try {
    const res = await fetch(`${backend}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Context:\n${lastSummary || "No summary"}\n\nUser: ${msg}`,
      }),
    });

    if (!res.body) throw new Error("No stream body received.");
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiReply.textContent += decoder.decode(value, { stream: true });
      chatBox.scrollTop = chatBox.scrollHeight;
      await savePageState(); // save progress
    }
  } catch (err) {
    console.error("Streaming chat error:", err);
    aiReply.textContent = "❌ Error connecting to backend.";
  } finally {
    await savePageState(); // save final chat
  }
};

// ============================================================
// 🧹 CLEAR BUTTON
// ============================================================
clearBtn.onclick = async () => {
  summaryBox.innerText = "Summary cleared.";
  chatBox.innerHTML = "";
  lastSummary = "";
  await chrome.storage.local.remove(currentUrl);
};

// ============================================================
// ⌨️ ENTER TO SEND
// ============================================================
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});
