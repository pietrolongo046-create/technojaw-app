# Changelog — TechnoJaw App

Tutte le modifiche significative a TechnoJaw App.

## [1.3.8] — 2025-02-18

### Changed
- **Riorganizzazione completa** struttura cartelle (BUILD_MASTER standard)
- Icon pipeline unificata via `scripts/generate-icons.py`
- Bundle ID: `com.technojaw.app` → `com.technojaw.desktop`
- Package.json: script standardizzati (dev, build, deploy:desktop, deploy:releases, icons)
- `.gitignore` aggiornato per Tauri v2
- README.md professionale con architettura e comandi

### Removed
- Vecchi file icone legacy da `assets/` (gen_icon.py, .svg, .icns, tray@2x)
- Riferimenti Electron dal README

## [1.3.7] — 2025-02-15

### Fixed
- Background mode: `window_close` → `hide()` (non quit)
- Tray icon 44×44 rounded con menu (Apri / Esci)
- CSP aggiornata per Supabase + Google Fonts

## [1.3.0] — 2025-02-12

### Changed
- Migrazione completa Electron → Tauri v2
- Nuovo backend Rust (lib.rs) con window management + tray
- Titlebar overlay macOS nativo

## [1.0.0] — 2025-01

### Added
- Prima release — wrapper Electron per sito TechnoJaw
