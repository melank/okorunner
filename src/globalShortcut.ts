import { getCurrentWindow } from '@tauri-apps/api/window'
import { register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { assertTauriRuntime } from './tauriRuntime'

export const GLOBAL_SHORTCUT = 'CommandOrControl+Shift+O'

export async function activateAppWindow(): Promise<void> {
  const window = getCurrentWindow()

  await window.show()
  await window.unminimize()
  await window.setFocus()
}

export async function registerGlobalShortcut(onPressed: () => void): Promise<void> {
  assertTauriRuntime()
  await register(GLOBAL_SHORTCUT, (event) => {
    if (event.state === 'Pressed') {
      onPressed()
    }
  })
}

export async function unregisterGlobalShortcut(): Promise<void> {
  await unregister(GLOBAL_SHORTCUT)
}
