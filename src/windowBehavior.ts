import { invoke } from '@tauri-apps/api/core'
import { PhysicalPosition } from '@tauri-apps/api/dpi'
import { getCurrentWindow, primaryMonitor } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { MANAGE_WINDOW_LABEL, MAIN_WINDOW_LABEL } from './appTabs'
import { assertTauriRuntime } from './tauriRuntime'
import { decideTrayWindowAction, type TrayWindowState } from './trayWindowLogic'

export type TrayRect = {
  position: { x: number; y: number }
  size: { width: number; height: number }
}

function isMainWindow(): boolean {
  return getCurrentWindow().label === MAIN_WINDOW_LABEL
}

async function getManageWindow(): Promise<WebviewWindow | null> {
  return WebviewWindow.getByLabel(MANAGE_WINDOW_LABEL)
}

async function requireManageWindow(): Promise<WebviewWindow> {
  const manage = await getManageWindow()
  if (manage === null) {
    throw new Error('管理画面ウィンドウが見つかりません')
  }

  return manage
}

async function getPopoverWindow(): Promise<WebviewWindow> {
  const popover = await WebviewWindow.getByLabel(MAIN_WINDOW_LABEL)
  if (popover === null) {
    throw new Error('提案画面ウィンドウが見つかりません')
  }

  return popover
}

async function raiseAppWindow(label: string): Promise<void> {
  await invoke('raise_app_window', { label })
}

async function readTrayWindowState(): Promise<TrayWindowState> {
  const popover = await getPopoverWindow()
  const manage = await getManageWindow()

  const popoverVisible = await popover.isVisible()
  const manageVisible = manage !== null && await manage.isVisible()

  return {
    popoverVisible,
    manageVisible,
    popoverFocused: popoverVisible && await popover.isFocused(),
    manageFocused: manageVisible && manage !== null && await manage.isFocused(),
  }
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

async function hidePopoverWindow(): Promise<void> {
  const popover = await getPopoverWindow()
  await popover.hide()
}

async function hideManageWindow(): Promise<void> {
  const manage = await getManageWindow()
  if (manage !== null) {
    await manage.hide()
  }
}

async function hideAllAppWindows(): Promise<void> {
  await Promise.all([
    hidePopoverWindow().catch(() => undefined),
    hideManageWindow().catch(() => undefined),
  ])
}

export async function activatePopoverWindow(trayRect?: TrayRect): Promise<void> {
  if (!isMainWindow()) {
    return
  }

  await hideManageWindow()

  const window = getCurrentWindow()

  await window.show()
  await window.unminimize()
  await raiseAppWindow(MAIN_WINDOW_LABEL)
  await positionWindowNearTray(trayRect)
  await window.setFocus()
}

async function raiseManageWindow(): Promise<void> {
  await hidePopoverWindow()

  const manage = await requireManageWindow()

  await manage.show()
  await manage.unminimize()
  await raiseAppWindow(MANAGE_WINDOW_LABEL)
  await manage.setFocus()
}

export async function hideWindowOnClose(): Promise<() => void> {
  assertTauriRuntime()
  const window = getCurrentWindow()

  return await window.onCloseRequested(async (event) => {
    event.preventDefault()
    await window.hide()
  })
}

export async function toggleTrayWindows(trayRect?: TrayRect): Promise<void> {
  assertTauriRuntime()
  if (!isMainWindow()) {
    return
  }

  const action = decideTrayWindowAction(await readTrayWindowState())

  switch (action) {
    case 'show-popover':
    case 'raise-popover':
      await activatePopoverWindow(trayRect)
      return
    case 'hide-all':
      await hideAllAppWindows()
      return
    case 'raise-manage':
      await raiseManageWindow()
  }
}

/** @deprecated Use toggleTrayWindows instead. */
export async function togglePopoverWindow(trayRect?: TrayRect): Promise<void> {
  await toggleTrayWindows(trayRect)
}

export async function openManageWindow(): Promise<void> {
  assertTauriRuntime()
  await hidePopoverWindow()

  const manage = await requireManageWindow()

  await manage.show()
  await manage.unminimize()
  await raiseAppWindow(MANAGE_WINDOW_LABEL)
  await manage.center()
  await manage.setFocus()
}
