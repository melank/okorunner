#[cfg(target_os = "macos")]
pub fn configure_popover_for_active_space(
    window: &tauri::WebviewWindow,
) -> Result<(), tauri::Error> {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

    let ns_window_ptr = window.ns_window()?;
    if ns_window_ptr.is_null() {
        return Ok(());
    }

    unsafe {
        let ns_window = &*(ns_window_ptr.cast::<NSWindow>());
        let mut behavior = ns_window.collectionBehavior();
        behavior.remove(NSWindowCollectionBehavior::CanJoinAllSpaces);
        behavior.insert(NSWindowCollectionBehavior::MoveToActiveSpace);
        ns_window.setCollectionBehavior(behavior);
    }

    Ok(())
}

#[cfg(target_os = "macos")]
pub fn raise_window(window: &tauri::WebviewWindow) -> Result<(), tauri::Error> {
    use objc2::MainThreadMarker;
    use objc2_app_kit::{NSApplication, NSWindow};

    if let Some(mtm) = MainThreadMarker::new() {
        let app = NSApplication::sharedApplication(mtm);
        app.activateIgnoringOtherApps(true);
    }

    let ns_window_ptr = window.ns_window()?;
    if ns_window_ptr.is_null() {
        return Ok(());
    }

    unsafe {
        let ns_window = &*(ns_window_ptr.cast::<NSWindow>());
        ns_window.makeKeyAndOrderFront(None);
    }

    Ok(())
}
