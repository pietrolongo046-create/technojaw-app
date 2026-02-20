# TechnoJaw — Desktop App

> **Online Self Shine** — Piattaforma e-commerce cosmetica naturale.

Desktop wrapper nativo (Tauri v2) per il sito web [TechnoJaw](../TechnoJaw/).

## Stack

| Layer     | Tecnologia                    |
|-----------|-------------------------------|
| Runtime   | Tauri 2 (Rust + WebView)      |
| Frontend  | Sito web TechnoJaw (React/Vite/TS) |
| Backend   | Supabase (auth, DB, storage)  |
| Build     | Vite 7 → dist/ statico        |

## Struttura

```
TechnoJaw App/
├── assets/
│   └── icon-master.png      ← Sorgente unica (1024×1024)
├── dist/                    ← Build del sito (da ../TechnoJaw/)
├── releases/                ← DMG per distribuzione
├── scripts/
│   └── generate-icons.py    ← Pipeline icone universale
├── src-tauri/
│   ├── icons/               ← Icone generate (non editare)
│   ├── src/lib.rs           ← Backend Rust (tray, window mgmt)
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Sviluppo

```bash
# Prerequisiti: il sito TechnoJaw deve essere buildato in dist/
npm run build-site           # Build sito → copia in dist/

# Avvia in dev mode
npm run dev

# Build app nativa (.app)
npm run build

# Deploy su Desktop
npm run deploy:desktop

# Build + deploy in un comando
npm run install

# Rigenerare icone
npm run icons
```

## Architettura

TechnoJaw App è un **wrapper leggero**:
- Carica il sito statico da `dist/` (build del progetto TechnoJaw)
- Gestisce **tray icon** (Apri / Esci) 
- **Background mode**: chiusura = hide, non quit
- Window controls: minimize, maximize, close (hide)
- `open_external`: apre link nel browser di sistema
- Titlebar style: Overlay (macOS native)

## Bundle

| Piattaforma | Identificatore       |
|-------------|---------------------|
| macOS       | `com.technojaw.desktop` |
| Categoria   | Lifestyle           |
| Min macOS   | 10.15 (Catalina)    |

---

*TechnoJaw © 2025 — v1.3.8*
