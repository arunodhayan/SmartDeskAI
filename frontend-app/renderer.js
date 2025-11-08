// ============================
// SmartDesk AI Renderer Logic
// ============================

// Default backend URL or saved one
let backend = localStorage.getItem("smartdesk_api") || "http://127.0.0.1:8000";
let currentFile = null;
let lastSummary = "";

// === UI References ===
const openBtn = document.getElementById("open");
const sumBtn = document.getElementById("summarize");
const chatBox = document.getElementById("chat");
const summaryBox = document.getElementById("summary");
const sendBtn = document.getElementById("send");
const msgInput = document.getElementById("msg");

// === Settings Modal ===
const settingsBtn = document.getElementById("settings-btn");
const modal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal");
const saveApiBtn = document.getElementById("save-api");
const apiInput = document.getElementById("api-input");

// === Window Controls ===
document.getElementById("minimize-btn").onclick = () =>
  window.smartdeskAPI.minimize();
document.getElementById("maximize-btn").onclick = () =>
  window.smartdeskAPI.maximize();
document.getElementById("close-btn").onclick = () =>
  window.smartdeskAPI.close();

// ============================================================
// ⚙️ SETTINGS MODAL
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
  alert("✅ API endpoint saved successfully!");
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ============================================================
// 📂 FILE CHOOSER (Manual)
// ============================================================
openBtn.onclick = async () => {
  currentFile = await window.smartdeskAPI.selectFile();
  summaryBox.innerText = currentFile
    ? `📄 Selected:\n${currentFile}`
    : "No file chosen.";
};

// ============================================================
// 📁 “Open With” Handler (system integration)
// ============================================================
window.smartdeskAPI.onFileOpened((filePath) => {
  currentFile = filePath;
  summaryBox.innerText = `📄 Opened via system:\n${filePath}`;
});

// ============================================================
// 🧠 SUMMARIZATION
// ============================================================
sumBtn.onclick = async () => {
  if (!currentFile)
    return (summaryBox.innerText = "Please choose a document first.");

  summaryBox.innerText = "⏳ Summarizing...";

  try {
    const form = new FormData();
    const buffer = window.smartdeskAPI.readFileAsBuffer(currentFile);
    const blob = new Blob([buffer]);
    form.append("file", blob, currentFile.split("/").pop());

    const res = await fetch(`${backend}/analyze`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    summaryBox.innerText = data.summary || "No summary generated.";
    lastSummary = data.summary || "";
    chatBox.innerHTML =
      "<b>SmartDesk AI:</b> You can now ask questions about this document.";
  } catch (err) {
    console.error("Summarization error:", err);
    summaryBox.innerText = `❌ Error summarizing document.\n${err.message}`;
  }
};

// ============================================================
// 💬 CHAT STREAMING (uses /chat/stream)
// ============================================================
sendBtn.onclick = async () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  msgInput.value = "";

  const requestBody = {
    message: `Context:\n${lastSummary}\n\nUser: ${msg}`,
  };

  try {
    const res = await fetch(`${backend}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok || !res.body)
      throw new Error(`Backend returned ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    chatBox.innerHTML += `<div id="streaming"><b>AI:</b> </div>`;
    const streamDiv = document.getElementById("streaming");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      streamDiv.innerHTML = `<b>AI:</b> ${fullText}`;
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Remove streaming id after completion
    streamDiv.removeAttribute("id");
  } catch (err) {
    console.error("Chat error:", err);
    chatBox.innerHTML += `<div><b>AI:</b> ❌ Error: ${err.message}</div>`;
  }
};

// ============================================================
// ⌨️ ENTER-TO-SEND SHORTCUT
// ============================================================
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});
