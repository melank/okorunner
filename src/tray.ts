import { defaultWindowIcon } from '@tauri-apps/api/app'
import { TrayIcon, type TrayIconEvent } from '@tauri-apps/api/tray'
import { toggleAppWindow, type TrayRect } from './windowBehavior'
import { assertTauriRuntime } from './tauriRuntime'

export const TRAY_ID = 'okorunner-main-tray'

let trayInstance: TrayIcon | null = null
let cachedTrayRect: TrayRect | undefined

function rememberTrayRect(event: TrayIconEvent): void {
  if ('rect' in event) {
    cachedTrayRect = event.rect
  }
}

async function removeExistingTray(): Promise<void> {
  try {
    const existing = await TrayIcon.getById(TRAY_ID)
    if (existing !== null) {
      await existing.close()
    }
    await TrayIcon.removeById(TRAY_ID)
  } catch {
    // 既存トレイがない場合は無視する
  }

  trayInstance = null
}

export async function registerTrayIcon(): Promise<() => Promise<void>> {
  assertTauriRuntime()

  if (trayInstance !== null) {
    return async () => {}
  }

  await removeExistingTray()

  trayInstance = await TrayIcon.new({
    id: TRAY_ID,
    icon: await defaultWindowIcon() ?? undefined,
    tooltip: 'やる気起こrunner',
    showMenuOnLeftClick: false,
    action: (event) => {
      rememberTrayRect(event)

      if (
        event.type === 'Click' &&
        event.button === 'Left' &&
        event.buttonState === 'Up'
      ) {
        void toggleAppWindow(cachedTrayRect)
      }
    },
  })

  return async () => {
    await trayInstance?.close()
    trayInstance = null
    cachedTrayRect = undefined

    try {
      await TrayIcon.removeById(TRAY_ID)
    } catch {
      // 既に削除済みの場合は無視する
    }
  }
}
