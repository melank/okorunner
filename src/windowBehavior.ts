import { PhysicalPosition } from '@tauri-apps/api/dpi'
import { getCurrentWindow, primaryMonitor } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { MANAGE_WINDOW_LABEL, MAIN_WINDOW_LABEL } from './appTabs'
import { assertTauriRuntime } from './tauriRuntime'

export type TrayRect = {
  position: { x: number; y: number }
  size: { width: number; height: number }
}

function isMainWindow(): boolean {
  return getCurrentWindow().label === MAIN_WINDOW_LABEL
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

export async function activatePopoverWindow(trayRect?: TrayRect): Promise<void> {
  if (!isMainWindow()) {
    return
  }

  await positionWindowNearTray(trayRect)
  const window = getCurrentWindow()

  await window.show()
  await window.unminimize()
  await window.setFocus()
}

export async function hideWindowOnClose(): Promise<() => void> {
  assertTauriRuntime()
  const window = getCurrentWindow()

  return await window.onCloseRequested(async (event) => {
    event.preventDefault()
    await window.hide()
  })
}

export async function togglePopoverWindow(trayRect?: TrayRect): Promise<void> {
  assertTauriRuntime()
  const window = getCurrentWindow()
  if (!isMainWindow()) {
    return
  }

  const visible = await window.isVisible()

  if (visible) {
    await window.hide()
    return
  }

  await activatePopoverWindow(trayRect)
}

export async function openManageWindow(): Promise<void> {
  assertTauriRuntime()
  const manage = await WebviewWindow.getByLabel(MANAGE_WINDOW_LABEL)

  if (manage === null) {
    throw new Error('管理画面ウィンドウが見つかりません')
  }

  await manage.show()
  await manage.unminimize()
  await manage.center()
  await manage.setFocus()
}
