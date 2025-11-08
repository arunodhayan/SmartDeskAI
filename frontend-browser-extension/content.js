// Add floating summarize button
if (!document.getElementById("smartdesk-float-btn")) {
  const btn = document.createElement("button");
  btn.id = "smartdesk-float-btn";
  btn.textContent = "⚛ Summarize Page";
  document.body.appendChild(btn);

  btn.addEventListener("click", async () => {
    btn.textContent = "⏳ Summarizing…";
    const text = document.body.innerText.slice(0, 10000);
    const backend = localStorage.getItem("smartdesk_api") || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${backend}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      alert("🧠 SmartDesk AI Summary:\n\n" + (data.summary || "No summary."));
    } catch {
      alert("❌ Error summarizing this page.");
    }
    btn.textContent = "⚛ Summarize Page";
  });
}
