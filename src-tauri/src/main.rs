#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::json;
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager, Window};

#[tauri::command]
fn get_app_version() -> String { "1.3.8".into() }

#[tauri::command]
fn get_is_mac() -> bool { cfg!(target_os = "macos") }

#[tauri::command]
fn window_minimize(window: Window) { let _ = window.minimize(); }

#[tauri::command]
fn window_maximize(window: Window) { let _ = window.maximize(); }

#[tauri::command]
fn window_close(window: Window) { let _ = window.hide(); }

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) {
    if let Some(w) = app.get_window("main") {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn spawn_notification_scheduler(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(60));
            // Emit a generic scheduled event; frontend will handle displaying
            let _ = app.emit_all("show-notification", json!({ "title": "Reminder", "body": "TechnoJaw scheduled check" }));
        }
    });
}

fn main() {
    let open = CustomMenuItem::new("open".to_string(), "Apri TechnoJaw");
    let exit = CustomMenuItem::new("exit".to_string(), "Esci");
    let tray_menu = SystemTrayMenu::new().add_item(open).add_item(exit);
    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "open" => {
                        if let Some(w) = app.get_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "exit" => app.exit(0),
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_is_mac,
            window_minimize,
            window_maximize,
            window_close,
            show_main_window,
        ])
        .setup(|app| {
            spawn_notification_scheduler(app.handle());
            // Show main window at startup (if desired)
            if let Some(w) = app.get_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

