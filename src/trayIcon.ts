import { Image } from '@tauri-apps/api/image'
import trayIconUrl from './assets/tray.png'

let trayIconPromise: Promise<Image> | null = null

export function loadTrayIcon(): Promise<Image> {
  trayIconPromise ??= (async () => {
    const response = await fetch(trayIconUrl)
    if (!response.ok) {
      throw new Error('トレイアイコンを読み込めませんでした')
    }

    return Image.fromBytes(new Uint8Array(await response.arrayBuffer()))
  })()

  return trayIconPromise
}
