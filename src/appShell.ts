import { hideMainWindowOnClose } from './windowBehavior'
import { registerTrayIcon } from './tray'

let initialized = false
let unlistenClose: (() => void) | undefined
let unregisterTray: (() => Promise<void>) | undefined

export function initializeAppShell(): void {
  if (initialized) {
    return
  }

  initialized = true

  void (async () => {
    try {
      unlistenClose = await hideMainWindowOnClose()
      unregisterTray = await registerTrayIcon()
    } catch (error: unknown) {
      initialized = false
      console.error('アプリシェルの初期化に失敗しました', error)
    }
  })()
}

export async function teardownAppShell(): Promise<void> {
  unlistenClose?.()
  unlistenClose = undefined
  await unregisterTray?.()
  unregisterTray = undefined
  initialized = false
}
