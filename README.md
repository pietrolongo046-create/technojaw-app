# TechnoJaw App

Desktop application per **TechnoJaw - Online Self Shine**, basata su Electron.

Wrappa il sito web TechnoJaw (React/Vite/Supabase) come app nativa desktop per macOS e Windows.

## Sviluppo

```bash
# Installa dipendenze
npm install

# Avvia in modalità development (apre Vite + Electron)
npm run dev

# Build per produzione
npm run dist:mac    # macOS
npm run dist:win    # Windows
```

## Struttura

```
TechnoJaw App/
├── electron/          # Codice Electron (main process)
│   ├── main.js        # Entry point Electron
│   └── preload.js     # Preload script
├── assets/            # Icone app
├── dist/              # Build del sito (generato)
├── release/           # DMG/EXE (generato)
└── package.json
```

Il sito web sorgente si trova in `../TechnoJaw/`.
