const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

// Disable sandbox (for Linux)
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-setuid-sandbox");

let win;
let pendingFile = null;

// ============================================================
// 🪟 Create Main Window
// ============================================================
function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 540,
    minWidth: 380,
    minHeight: 480,
    frame: false,
    transparent: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile("index.html");

  // Load file if passed before window ready
  win.webContents.on("did-finish-load", () => {
    if (pendingFile) {
      win.webContents.send("file-opened", pendingFile);
      pendingFile = null;
    }
  });
}

// ============================================================
// 📂 Handle “Open With” (macOS + Linux + Windows)
// ============================================================
app.on("open-file", (event, filePath) => {
  event.preventDefault();
  if (win) win.webContents.send("file-opened", filePath);
  else pendingFile = filePath;
});

app.on("ready", () => {
  const args = process.argv.slice(1);
  const candidate = args.find((a) =>
    [".pdf", ".txt", ".docx", ".pptx"].some((ext) => a.endsWith(ext))
  );
  if (candidate) pendingFile = path.resolve(candidate);
  createWindow();
});

app.on("second-instance", (event, argv) => {
  const filePath = argv.find((a) =>
    [".pdf", ".txt", ".docx", ".pptx"].some((ext) => a.endsWith(ext))
  );
  if (filePath && win) win.webContents.send("file-opened", path.resolve(filePath));
});

// ============================================================
// 📁 Manual File Chooser
// ============================================================
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select a document",
    buttonLabel: "Open",
    properties: ["openFile"],
    filters: [{ name: "Documents", extensions: ["pdf", "docx", "pptx", "txt"] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ============================================================
// 🪟 Window Controls
// ============================================================
ipcMain.on("window-minimize", () => win && win.minimize());
ipcMain.on("window-maximize", () => {
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on("window-close", () => win && win.close());

// ============================================================
// 🚪 Quit Behavior
// ============================================================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
