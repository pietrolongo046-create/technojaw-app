use tauri::{Manager, AppHandle};

// ═══════════════════════════════════════════════════════════
//  TechnoJaw App — Tauri wrapper for TechnoJaw website
//  Simple, minimal backend: just window management + tray
// ═══════════════════════════════════════════════════════════

#[tauri::command]
fn is_mac() -> Result<bool, String> {
    Ok(cfg!(target_os = "macos"))
}

#[tauri::command]
fn window_minimize(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn window_maximize(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        if w.is_maximized().unwrap_or(false) {
            w.unmaximize().map_err(|e| e.to_string())?;
        } else {
            w.maximize().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn window_close(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // Tray icon
            let _tray = {
                use tauri::menu::{MenuBuilder, MenuItemBuilder};
                use tauri::tray::TrayIconBuilder;

                let show = MenuItemBuilder::with_id("show", "Apri TechnoJaw").build(app)?;
                let quit = MenuItemBuilder::with_id("quit", "Esci").build(app)?;
                let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

                let png_data = include_bytes!("../icons/tray-icon.png");
                let img = image::load_from_memory(png_data).expect("decode tray icon").to_rgba8();
                let (w, h) = img.dimensions();
                let icon = tauri::image::Image::new_owned(img.into_raw(), w, h);

                TrayIconBuilder::new()
                    .icon(icon)
                    .menu(&menu)
                    .tooltip("TechnoJaw")
                    .on_menu_event(move |app, event| {
                        match event.id().as_ref() {
                            "show" => {
                                if let Some(w) = app.get_webview_window("main") {
                                    let _ = w.show();
                                    let _ = w.set_focus();
                                }
                            },
                            "quit" => { app.exit(0); },
                            _ => {}
                        }
                    })
                    .build(app)?
            };

            // Show window
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            is_mac, window_minimize, window_maximize, window_close, open_external,
        ])
        .run(tauri::generate_context!())
        .expect("Error running TechnoJaw");
}
