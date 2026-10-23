#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    linux::prefer_x11();

    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(target_os = "linux")]
            linux::setup(_app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(target_os = "linux")]
mod linux {
    use gtk::prelude::*;
    use tauri::Manager;
    use webkit2gtk::{
        DeviceInfoPermissionRequest, PermissionRequestExt, UserMediaPermissionRequest,
        UserMediaPermissionRequestExt, WebViewExt,
    };

    // Wayland gives clients no way to keep a window above others, so GTK
    // silently ignores always-on-top there; under XWayland the window manager
    // honours it. An explicit GDK_BACKEND from the user still wins.
    pub fn prefer_x11() {
        if std::env::var_os("GDK_BACKEND").is_none() {
            std::env::set_var("GDK_BACKEND", "x11");
        }
    }

    pub fn setup(app: &tauri::App) -> tauri::Result<()> {
        let window = app.get_webview_window("main").expect("main window");
        unblock_titlebar_buttons(&window)?;
        allow_camera(&window)
    }

    // On Wayland tao (< 0.36) wraps the header bar in an EventBox that sits
    // above its children, so minimize/maximize/close never receive clicks.
    // Upstream removed that title bar in tao 0.36 (tauri-apps/tao#1218).
    fn unblock_titlebar_buttons(window: &tauri::WebviewWindow) -> tauri::Result<()> {
        if let Some(event_box) = window
            .gtk_window()?
            .titlebar()
            .and_then(|bar| bar.downcast::<gtk::EventBox>().ok())
        {
            event_box.set_above_child(false);
        }
        Ok(())
    }

    // WebView2 asks the user for camera access itself; WebKitGTK emits
    // `permission-request` and denies it when nobody answers, and wry leaves it
    // unanswered. The system camera portal still gates the device itself.
    fn allow_camera(window: &tauri::WebviewWindow) -> tauri::Result<()> {
        window.with_webview(|webview| {
            webview.inner().connect_permission_request(|_, request| {
                let camera = request
                    .downcast_ref::<UserMediaPermissionRequest>()
                    .is_some_and(|r| r.is_for_video_device() && !r.is_for_audio_device());
                let device_labels = request
                    .downcast_ref::<DeviceInfoPermissionRequest>()
                    .is_some();
                if camera || device_labels {
                    request.allow();
                    return true;
                }
                false
            });
        })
    }
}
