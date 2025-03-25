import { app, BrowserWindow } from 'electron';
import * as path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  const indexPath: string = path.join(__dirname, "..", "res", "angular", "browser", "index.html");
  mainWindow.loadFile(indexPath).catch(err => console.error("Fehler beim Laden der HTML-Datei:", err));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
