const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

// Disable sandbox for Linux if needed
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-setuid-sandbox");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 540,
    minWidth: 380,
    minHeight: 480,
    frame: false,             // custom header
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
}

// ===== Select File =====
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select a document",
    buttonLabel: "Open",
    properties: ["openFile"],
    filters: [
      { name: "Documents", extensions: ["pdf", "docx", "pptx", "txt"] },
    ],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ===== Window Controls =====
ipcMain.on("window-minimize", () => {
  if (win) win.minimize();
});

ipcMain.on("window-maximize", () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});

ipcMain.on("window-close", () => {
  if (win) win.close();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
