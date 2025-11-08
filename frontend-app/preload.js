const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("smartdeskAPI", {
  // File chooser
  selectFile: () => ipcRenderer.invoke("select-file"),

  // File reading for upload
  readFileAsBuffer: (filePath) => fs.readFileSync(filePath),

  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // Listen for files opened via “Open With” / Finder
  onFileOpened: (callback) =>
    ipcRenderer.on("file-opened", (_, filePath) => callback(filePath)),
});
