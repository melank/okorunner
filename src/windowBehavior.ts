import { getCurrentWindow } from '@tauri-apps/api/window'
import { activateAppWindow } from './globalShortcut'
import { assertTauriRuntime } from './tauriRuntime'

export async function hideMainWindowOnClose(): Promise<() => void> {
  assertTauriRuntime()
  const window = getCurrentWindow()

  return await window.onCloseRequested(async (event) => {
    event.preventDefault()
    await window.hide()
  })
}

export async function toggleAppWindow(): Promise<void> {
  assertTauriRuntime()
  const window = getCurrentWindow()
  const visible = await window.isVisible()

  if (visible) {
    await window.hide()
    return
  }

  await activateAppWindow()
}
