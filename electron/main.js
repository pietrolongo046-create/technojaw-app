const { app, BrowserWindow, Menu, shell, ipcMain, protocol, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { autoUpdater } = require('electron-updater');

const isDev = !app.isPackaged;
const LIVE_URL = 'https://technojaw.com';
const FALLBACK_URL = 'https://technojaw.lovable.app';

// Path alla cartella dist locale
const DIST_PATH = isDev
  ? path.join(__dirname, '..', 'dist')
  : path.join(process.resourcesPath, 'dist');

const LOCAL_INDEX = path.join(DIST_PATH, 'index.html');
const LOCAL_URL = 'app://technojaw/index.html';

// Registra lo schema custom PRIMA di app.whenReady
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: true,
  }
}]);

// ===== Traduzioni menu automatiche =====
const translations = {
  it: { about: 'Informazioni su TechnoJaw', hide: 'Nascondi TechnoJaw', hideOthers: 'Nascondi altri', showAll: 'Mostra tutti', quit: 'Esci da TechnoJaw', edit: 'Modifica', undo: 'Annulla', redo: 'Ripeti', cut: 'Taglia', copy: 'Copia', paste: 'Incolla', selectAll: 'Seleziona tutto', view: 'Vista', reload: 'Ricarica', forceReload: 'Ricarica forzata', zoomIn: 'Zoom avanti', zoomOut: 'Zoom indietro', resetZoom: 'Zoom predefinito', fullscreen: 'Schermo intero', window: 'Finestra', minimize: 'Riduci', close: 'Chiudi' },
  en: { about: 'About TechnoJaw', hide: 'Hide TechnoJaw', hideOthers: 'Hide Others', showAll: 'Show All', quit: 'Quit TechnoJaw', edit: 'Edit', undo: 'Undo', redo: 'Redo', cut: 'Cut', copy: 'Copy', paste: 'Paste', selectAll: 'Select All', view: 'View', reload: 'Reload', forceReload: 'Force Reload', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', resetZoom: 'Actual Size', fullscreen: 'Toggle Full Screen', window: 'Window', minimize: 'Minimize', close: 'Close' },
  de: { about: 'Über TechnoJaw', hide: 'TechnoJaw ausblenden', hideOthers: 'Andere ausblenden', showAll: 'Alle einblenden', quit: 'TechnoJaw beenden', edit: 'Bearbeiten', undo: 'Widerrufen', redo: 'Wiederholen', cut: 'Ausschneiden', copy: 'Kopieren', paste: 'Einsetzen', selectAll: 'Alles auswählen', view: 'Darstellung', reload: 'Neu laden', forceReload: 'Neu laden erzwingen', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', resetZoom: 'Originalgröße', fullscreen: 'Vollbild', window: 'Fenster', minimize: 'Minimieren', close: 'Schließen' },
  fr: { about: 'À propos de TechnoJaw', hide: 'Masquer TechnoJaw', hideOthers: 'Masquer les autres', showAll: 'Tout afficher', quit: 'Quitter TechnoJaw', edit: 'Édition', undo: 'Annuler', redo: 'Rétablir', cut: 'Couper', copy: 'Copier', paste: 'Coller', selectAll: 'Tout sélectionner', view: 'Présentation', reload: 'Recharger', forceReload: 'Forcer le rechargement', zoomIn: 'Zoom avant', zoomOut: 'Zoom arrière', resetZoom: 'Taille réelle', fullscreen: 'Plein écran', window: 'Fenêtre', minimize: 'Réduire', close: 'Fermer' },
  es: { about: 'Acerca de TechnoJaw', hide: 'Ocultar TechnoJaw', hideOthers: 'Ocultar otros', showAll: 'Mostrar todo', quit: 'Salir de TechnoJaw', edit: 'Edición', undo: 'Deshacer', redo: 'Rehacer', cut: 'Cortar', copy: 'Copiar', paste: 'Pegar', selectAll: 'Seleccionar todo', view: 'Visualización', reload: 'Recargar', forceReload: 'Forzar recarga', zoomIn: 'Ampliar', zoomOut: 'Reducir', resetZoom: 'Tamaño real', fullscreen: 'Pantalla completa', window: 'Ventana', minimize: 'Minimizar', close: 'Cerrar' },
};

function getT() {
  const locale = (app.getLocale() || 'en').substring(0, 2);
  return translations[locale] || translations.en;
}

let mainWindow;

// ===== Auto-Updater =====
function setupAutoUpdater() {
  if (isDev) return; // Non controllare aggiornamenti in dev

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Traduzioni per le notifiche di aggiornamento
  const locale = (app.getLocale() || 'en').substring(0, 2);
  const updateMessages = {
    it: {
      checking: 'Controllo aggiornamenti...',
      available: 'Aggiornamento disponibile! Download in corso...',
      downloaded: 'Aggiornamento scaricato. Vuoi riavviare ora per installarlo?',
      downloadedTitle: 'Aggiornamento pronto',
      restart: 'Riavvia ora',
      later: 'Più tardi',
      error: 'Errore aggiornamento',
    },
    en: {
      checking: 'Checking for updates...',
      available: 'Update available! Downloading...',
      downloaded: 'Update downloaded. Would you like to restart now to install it?',
      downloadedTitle: 'Update Ready',
      restart: 'Restart Now',
      later: 'Later',
      error: 'Update error',
    },
    de: {
      checking: 'Suche nach Updates...',
      available: 'Update verfügbar! Wird heruntergeladen...',
      downloaded: 'Update heruntergeladen. Möchten Sie jetzt neu starten?',
      downloadedTitle: 'Update bereit',
      restart: 'Jetzt neu starten',
      later: 'Später',
      error: 'Update-Fehler',
    },
    fr: {
      checking: 'Vérification des mises à jour...',
      available: 'Mise à jour disponible ! Téléchargement...',
      downloaded: 'Mise à jour téléchargée. Voulez-vous redémarrer maintenant ?',
      downloadedTitle: 'Mise à jour prête',
      restart: 'Redémarrer',
      later: 'Plus tard',
      error: 'Erreur de mise à jour',
    },
    es: {
      checking: 'Buscando actualizaciones...',
      available: '¡Actualización disponible! Descargando...',
      downloaded: 'Actualización descargada. ¿Desea reiniciar ahora?',
      downloadedTitle: 'Actualización lista',
      restart: 'Reiniciar ahora',
      later: 'Más tarde',
      error: 'Error de actualización',
    },
  };
  const msg = updateMessages[locale] || updateMessages.en;

  autoUpdater.on('update-available', () => {
    console.log('[AutoUpdater] Update available, downloading...');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] App is up to date.');
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[AutoUpdater] Download: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('[AutoUpdater] Update downloaded.');
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: msg.downloadedTitle,
        message: msg.downloaded,
        buttons: [msg.restart, msg.later],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.log('[AutoUpdater] Error:', err.message);
  });

  // Controlla aggiornamenti all'avvio e poi ogni 30 minuti
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 30 * 60 * 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '..', 'assets', 'technojaw-icon.png'),
    show: true,
  });

  // Domains considerati "interni" per l'app
  const isInternalURL = (checkUrl) => {
    try {
      if (checkUrl.startsWith('file://') || checkUrl.startsWith('app://')) return true;
      const u = new URL(checkUrl);
      return u.hostname.endsWith('lovable.app') ||
             u.hostname.endsWith('technojaw.com') ||
             u.hostname.includes('localhost') ||
             u.hostname.endsWith('supabase.co') ||
             u.hostname.endsWith('supabase.com');
    } catch (_) { return false; }
  };

  // Domini OAuth che devono restare nell'app (non aprire nel browser)
  const isOAuthURL = (url) => {
    try {
      const u = new URL(url);
      return u.hostname.endsWith('google.com') ||
             u.hostname.endsWith('googleapis.com') ||
             u.hostname.endsWith('gstatic.com') ||
             u.hostname.endsWith('apple.com') ||
             u.hostname.endsWith('appleid.apple.com') ||
             u.hostname.endsWith('icloud.com') ||
             u.hostname.endsWith('facebook.com') ||
             u.hostname.endsWith('github.com');
    } catch (_) { return false; }
  };

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Carica il sito buildato localmente via custom protocol
    if (fs.existsSync(LOCAL_INDEX)) {
      mainWindow.loadURL(LOCAL_URL);
    } else {
      // Fallback al sito live se dist/ non esiste
      mainWindow.loadURL(LIVE_URL);
    }
  }

  // Inietta bottone indietro quando si naviga su pagine OAuth/esterne
  const injectBackButton = () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        if (document.getElementById('tj-back-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'tj-back-btn';
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
        btn.title = 'Torna indietro';
        Object.assign(btn.style, {
          position:'fixed', top:'14px', left:'80px', zIndex:'999999',
          width:'32px', height:'32px', borderRadius:'50%',
          background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'opacity 200ms, transform 200ms',
          boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
        });
        btn.onmouseenter = () => { btn.style.background = 'rgba(0,0,0,0.7)'; btn.style.transform = 'scale(1.1)'; };
        btn.onmouseleave = () => { btn.style.background = 'rgba(0,0,0,0.5)'; btn.style.transform = 'scale(1)'; };
        btn.onclick = () => window.electronAPI.goBack();
        document.body.appendChild(btn);
      })();
    `).catch(() => {});
  };

  // Rimuovi bottone indietro quando si torna sul sito TechnoJaw
  const removeBackButton = () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        const btn = document.getElementById('tj-back-btn');
        if (btn) btn.remove();
      })();
    `).catch(() => {});
  };

  // Gestione navigazione: OAuth resta in-app, link esterni → browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalURL(url) || isOAuthURL(url)) {
      mainWindow.loadURL(url);
      return { action: 'deny' };
    }
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Navigazione in-page: OAuth in-app, altri esterni → browser
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isInternalURL(url) && !isOAuthURL(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Inietta o rimuovi bottone indietro a seconda della pagina
  mainWindow.webContents.on('did-navigate', (event, url) => {
    if (!isInternalURL(url)) {
      injectBackButton();
    } else {
      removeBackButton();
    }
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    if (!isInternalURL(url)) {
      injectBackButton();
    }
  });

  // Fallback: technojaw.com → technojaw.lovable.app → pagina offline
  let triedFallback = false;
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -6 || errorCode === -105 || errorCode === -106 || errorCode === -118) {
      if (!triedFallback && validatedURL.includes('technojaw.com')) {
        triedFallback = true;
        mainWindow.loadURL(FALLBACK_URL);
      } else {
        mainWindow.loadURL(`data:text/html;charset=utf-8,
          <html><head><style>
            body{margin:0;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#ffffff;color:#111;text-align:center}
            h1{font-size:28px;margin-bottom:12px}p{color:#888;font-size:16px;margin-bottom:24px}
            button{background:#111;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:15px;cursor:pointer}
            button:hover{background:#333}
          </style></head><body><div>
            <h1>Nessuna connessione</h1>
            <p>Impossibile raggiungere TechnoJaw. Controlla la connessione Internet.</p>
            <button onclick="location.href='${LIVE_URL}'">Riprova</button>
          </div></body></html>`);
      }
    }
  });

  // Reset fallback flag quando il caricamento riesce
  mainWindow.webContents.on('did-finish-load', () => {
    triedFallback = false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ===== IPC Handlers =====
ipcMain.on('go-back', () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
  } else if (mainWindow) {
    if (!isDev && fs.existsSync(LOCAL_INDEX)) {
      mainWindow.loadURL(LOCAL_URL);
    } else {
      mainWindow.loadURL(LIVE_URL);
    }
  }
});

ipcMain.on('check-for-updates', () => {
  if (!isDev) autoUpdater.checkForUpdates().catch(() => {});
});

// ===== App Menu (multilingua automatico) =====
function createMenu() {
  if (process.platform !== 'darwin') return;
  const locale = (app.getLocale() || 'en').substring(0, 2);
  const t = getT();
  const template = [
    {
      label: 'TechnoJaw',
      submenu: [
        { role: 'about', label: t.about },
        { type: 'separator' },
        { role: 'hide', label: t.hide },
        { role: 'hideOthers', label: t.hideOthers },
        { role: 'unhide', label: t.showAll },
        { type: 'separator' },
        { role: 'quit', label: t.quit },
      ],
    },
    {
      label: t.edit,
      submenu: [
        { role: 'undo', label: t.undo },
        { role: 'redo', label: t.redo },
        { type: 'separator' },
        { role: 'cut', label: t.cut },
        { role: 'copy', label: t.copy },
        { role: 'paste', label: t.paste },
        { role: 'selectAll', label: t.selectAll },
      ],
    },
    {
      label: t.view,
      submenu: [
        { label: locale === 'it' ? 'Indietro' : locale === 'de' ? 'Zurück' : locale === 'fr' ? 'Précédent' : locale === 'es' ? 'Atrás' : 'Back', accelerator: 'CmdOrCtrl+[', click: () => { if (mainWindow && mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack(); else if (mainWindow) { if (!isDev && fs.existsSync(LOCAL_INDEX)) mainWindow.loadURL(LOCAL_URL); else mainWindow.loadURL(LIVE_URL); } } },
        { label: locale === 'it' ? 'Avanti' : locale === 'de' ? 'Vorwärts' : locale === 'fr' ? 'Suivant' : locale === 'es' ? 'Adelante' : 'Forward', accelerator: 'CmdOrCtrl+]', click: () => { if (mainWindow && mainWindow.webContents.canGoForward()) mainWindow.webContents.goForward(); } },
        { type: 'separator' },
        { role: 'reload', label: t.reload },
        { role: 'forceReload', label: t.forceReload },
        { type: 'separator' },
        { role: 'zoomIn', label: t.zoomIn },
        { role: 'zoomOut', label: t.zoomOut },
        { role: 'resetZoom', label: t.resetZoom },
        { type: 'separator' },
        { role: 'togglefullscreen', label: t.fullscreen },
      ],
    },
    {
      label: t.window,
      submenu: [
        { role: 'minimize', label: t.minimize },
        { role: 'close', label: t.close },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  // Registra protocollo custom app:// per servire i file locali della dist
  if (!isDev) {
    protocol.handle('app', (request) => {
      // app://technojaw/assets/index.js → dist/assets/index.js
      const reqUrl = new URL(request.url);
      let filePath = decodeURIComponent(reqUrl.pathname);
      
      // Rimuovi il leading slash
      if (filePath.startsWith('/')) filePath = filePath.substring(1);
      
      const fullPath = path.join(DIST_PATH, filePath);
      
      // Se il file esiste, servilo
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return net.fetch(pathToFileURL(fullPath).href);
      }
      
      // SPA fallback: per qualsiasi route non-file, servi index.html
      return net.fetch(pathToFileURL(LOCAL_INDEX).href);
    });
  }

  createMenu();
  createWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
