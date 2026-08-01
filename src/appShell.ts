import { getCurrentWindow } from '@tauri-apps/api/window'
import { MAIN_WINDOW_LABEL } from './appTabs'
import { hideWindowOnClose } from './windowBehavior'
import { registerTrayIcon } from './tray'

let trayRegistered = false
let unregisterTray: (() => Promise<void>) | undefined

export function initializeAppShell(): void {
  void (async () => {
    try {
      await hideWindowOnClose()

      if (getCurrentWindow().label !== MAIN_WINDOW_LABEL || trayRegistered) {
        return
      }

      trayRegistered = true
      unregisterTray = await registerTrayIcon()
    } catch (error: unknown) {
      if (getCurrentWindow().label === MAIN_WINDOW_LABEL) {
        trayRegistered = false
      }
      console.error('アプリシェルの初期化に失敗しました', error)
    }
  })()
}

export async function teardownAppShell(): Promise<void> {
  await unregisterTray?.()
  unregisterTray = undefined
  trayRegistered = false
}
