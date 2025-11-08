chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "smartdeskSummarize",
    title: "Summarize selection with SmartDesk AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "smartdeskSummarize" && info.selectionText) {
    const backend = localStorage.getItem("smartdesk_api") || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${backend}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: info.selectionText })
      });
      const data = await res.json();
      const summary = data.summary || "No summary generated.";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => alert("🧠 SmartDesk AI Summary:\n\n" + text),
        args: [summary]
      });
    } catch {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("❌ Error summarizing selection.")
      });
    }
  }
});
