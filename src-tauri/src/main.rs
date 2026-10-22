#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(target_os = "linux")]
            linux::allow_camera(_app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// WebView2 asks the user for camera access itself; WebKitGTK emits
// `permission-request` and denies it when nobody answers, and wry leaves it
// unanswered. The system camera portal still gates the device itself.
#[cfg(target_os = "linux")]
mod linux {
    use tauri::Manager;
    use webkit2gtk::glib::Cast;
    use webkit2gtk::{
        DeviceInfoPermissionRequest, PermissionRequestExt, UserMediaPermissionRequest,
        UserMediaPermissionRequestExt, WebViewExt,
    };

    pub fn allow_camera(app: &tauri::App) -> tauri::Result<()> {
        let window = app.get_webview_window("main").expect("main window");
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
