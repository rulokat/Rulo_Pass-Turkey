const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');

let mainWindow;
let dpiProcess = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 520,
    show: false, // İçerik hazır olana kadar gizle
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // Arka planda yavaşlamasın
    },
    transparent: true,
    frame: false,
    resizable: false,
    hasShadow: true,
    backgroundColor: '#00000000', // Şeffaf arka plan flicker'ını engelle
  });

  // İçerik tamamen hazır olunca fade-in ile göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.setOpacity(0);
    mainWindow.show();
    // 150ms'de smooth fade-in
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.1;
      if (opacity >= 1) {
        mainWindow.setOpacity(1);
        clearInterval(fadeIn);
      } else {
        mainWindow.setOpacity(opacity);
      }
    }, 15);
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (dpiProcess) {
    dpiProcess.kill();
  }
});

ipcMain.handle('start-dpi', async (event, profile) => {
  if (dpiProcess) return { success: false, message: 'Already running' };

  const args = profile ? profile.split(' ') : ['-e', '1', '-q', '--reverse-frag'];
  const exePath = app.isPackaged 
    ? path.join(process.resourcesPath, 'bin', 'x86_64', 'goodbyedpi.exe')
    : path.join(app.getAppPath(), 'resources', 'bin', 'x86_64', 'goodbyedpi.exe');

  try {
    dpiProcess = spawn(exePath, args, {
      windowsHide: true
    });

    let isConnected = false;

    // Buffer sorunu nedeniyle 1.5 saniye içinde kapanmazsa bağlandı say
    const connectTimeout = setTimeout(() => {
      if (dpiProcess) {
        isConnected = true;
        mainWindow.webContents.send('dpi-status', 'connected');
      }
    }, 1500);

    dpiProcess.on('error', (err) => {
      clearTimeout(connectTimeout);
      dpiProcess = null;
      mainWindow.webContents.send('dpi-status', 'error_admin');
      mainWindow.webContents.send('dpi-log', `Spawn Error: ${err.message}. Lütfen uygulamayı yönetici olarak çalıştırın.`);
    });

    const handleOutput = (data) => {
      const msg = data.toString();
      mainWindow.webContents.send('dpi-log', msg);
      
      if (!isConnected && (msg.includes('Filter activated') || msg.includes('GoodbyeDPI is now running'))) {
        clearTimeout(connectTimeout);
        isConnected = true;
        mainWindow.webContents.send('dpi-status', 'connected');
      }
      
      if (msg.includes('WinDivert open failed') || msg.includes('Access is denied') || msg.includes('Error opening filter')) {
        clearTimeout(connectTimeout);
        mainWindow.webContents.send('dpi-status', 'error_admin');
      }
    };

    dpiProcess.stdout.on('data', handleOutput);
    dpiProcess.stderr.on('data', handleOutput);

    dpiProcess.on('close', (code) => {
      clearTimeout(connectTimeout);
      dpiProcess = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('dpi-status', 'disconnected');
        mainWindow.webContents.send('dpi-log', `Process exited with code ${code}`);
      }
    });

    // Başlarken DNS cache temizle
    exec('ipconfig /flushdns');

    return { success: true };
  } catch (err) {
    dpiProcess = null;
    return { success: false, message: err.message };
  }
});

ipcMain.handle('stop-dpi', async () => {
  if (dpiProcess) {
    try {
      dpiProcess.kill();
    } catch(e) {}
    dpiProcess = null;
  }
  
  // Arka planda takılı kalma ihtimaline karşı zorla kapat (taskkill) ve DNS temizle
  exec('taskkill /F /IM goodbyedpi.exe /T', () => {
    exec('ipconfig /flushdns', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('dpi-log', 'GoodbyeDPI zorla kapatıldı ve DNS önbelleği temizlendi.');
        mainWindow.webContents.send('dpi-status', 'disconnected');
      }
    });
  });

  return { success: true };
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});
