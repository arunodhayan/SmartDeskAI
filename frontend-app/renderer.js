// ============================================================
// ⚛️ SmartDesk AI Renderer Logic (Configurable Backend + Streaming Chat)
// ============================================================

let backend = localStorage.getItem("smartdesk_api") || "http://127.0.0.1:8000";
let currentFile = null;

// === UI References ===
const openBtn = document.getElementById("open");
const sumBtn = document.getElementById("summarize");
const summaryBox = document.getElementById("summary");
const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

// === Window Control Buttons ===
const closeBtn = document.getElementById("close-btn");
const minBtn   = document.getElementById("min-btn");
const maxBtn   = document.getElementById("max-btn");

// === Settings Modal ===
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const apiInput = document.getElementById("api-input");
const saveApiBtn = document.getElementById("save-api");
const cancelApiBtn = document.getElementById("cancel-api");

// ============================================================
// ⚙️ Settings Modal
// ============================================================
settingsBtn.onclick = () => {
  apiInput.value = backend;
  settingsModal.style.display = "flex";
};
cancelApiBtn.onclick = () => (settingsModal.style.display = "none");
saveApiBtn.onclick = () => {
  const newApi = apiInput.value.trim();
  if (!newApi) return alert("Please enter a valid API URL.");
  backend = newApi;
  localStorage.setItem("smartdesk_api", backend);
  alert("✅ API endpoint saved!");
  settingsModal.style.display = "none";
};
window.onclick = (e) => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

// ============================================================
// 📂 Select File
// ============================================================
openBtn.onclick = async () => {
  try {
    currentFile = await window.smartdeskAPI.selectFile();
    summaryBox.innerText = currentFile
      ? `📄 Selected:\n${currentFile}`
      : "No file chosen.";
  } catch (err) {
    console.error("File selection failed:", err);
    summaryBox.innerText = "❌ Error selecting file.";
  }
};

// ============================================================
// 🧠 Summarize Selected File
// ============================================================
sumBtn.onclick = async () => {
  if (!currentFile)
    return (summaryBox.innerText = "Please choose a document first.");

  summaryBox.innerText = "⏳ Summarizing...";
  try {
    const form = new FormData();
    const blob = await fetch(`file://${currentFile}`).then((r) => r.blob());
    form.append("file", blob, currentFile.split("/").pop());

    const res = await fetch(`${backend}/analyze`, { method: "POST", body: form });
    const data = await res.json();

    if (res.ok) {
      summaryBox.innerText = data.summary || "No summary generated.";
      chatBox.innerHTML = "<b>SmartDesk AI:</b> Ready for your questions.";
    } else {
      throw new Error(data.detail || "Unknown summarization error.");
    }
  } catch (err) {
    console.error("Summarization error:", err);
    summaryBox.innerText = "❌ Error summarizing document.";
  }
};

// ============================================================
// 💬 Streaming Chat
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
        message: `Context:\n${summaryBox.innerText}\n\nUser: ${msg}`,
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
    }
  } catch (err) {
    console.error("Streaming chat error:", err);
    aiReply.textContent = "❌ Error connecting to backend.";
  }
};

// ============================================================
// ⌨️ Enter to Send
// ============================================================
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// ============================================================
// 🪟 Window Controls
// ============================================================
closeBtn.onclick = () => window.smartdeskAPI.closeWindow();
minBtn.onclick   = () => window.smartdeskAPI.minimizeWindow();
maxBtn.onclick   = () => window.smartdeskAPI.maximizeWindow();

