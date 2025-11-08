const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("smartdeskAPI", {
  // File chooser
  selectFile: () => ipcRenderer.invoke("select-file"),

  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
});
