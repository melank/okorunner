import { getCurrentWindow } from '@tauri-apps/api/window'
import { assertTauriRuntime } from './tauriRuntime'

export async function activateAppWindow(): Promise<void> {
  const window = getCurrentWindow()

  await window.show()
  await window.unminimize()
  await window.setFocus()
}

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
