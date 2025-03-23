const { app, BrowserWindow } = require("electron/main");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Disable node integration for security
      contextIsolation: true,  // Helps to keep the app secure
      enableWebSQL: true,      // Enable webSQL if needed for storage
      experimentalFeatures: false, // Enable experimental web features if necessary
    },
  });

  win.loadFile("index.html");
  
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
