import { PhysicalPosition } from '@tauri-apps/api/dpi'
import { getCurrentWindow, primaryMonitor } from '@tauri-apps/api/window'
import { assertTauriRuntime } from './tauriRuntime'

export type TrayRect = {
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export async function positionWindowNearTray(trayRect?: TrayRect): Promise<void> {
  assertTauriRuntime()
  const window = getCurrentWindow()
  const outerSize = await window.outerSize()

  if (trayRect !== undefined) {
    const x = Math.round(trayRect.position.x + trayRect.size.width / 2 - outerSize.width / 2)
    const y = Math.round(trayRect.position.y + trayRect.size.height + 4)
    await window.setPosition(new PhysicalPosition(x, y))
    return
  }

  const monitor = await primaryMonitor()
  if (monitor?.workArea) {
    const x = Math.round(
      monitor.workArea.position.x + monitor.workArea.size.width - outerSize.width - 12,
    )
    const y = Math.round(monitor.workArea.position.y + 28)
    await window.setPosition(new PhysicalPosition(x, y))
  }
}

export async function activateAppWindow(trayRect?: TrayRect): Promise<void> {
  await positionWindowNearTray(trayRect)
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

export async function toggleAppWindow(trayRect?: TrayRect): Promise<void> {
  assertTauriRuntime()
  const window = getCurrentWindow()
  const visible = await window.isVisible()

  if (visible) {
    await window.hide()
    return
  }

  await activateAppWindow(trayRect)
}
