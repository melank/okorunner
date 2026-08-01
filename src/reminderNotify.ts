import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import type { PendingSuggestion } from './reminder'
import { assertTauriRuntime } from './tauriRuntime'

export async function ensureNotificationPermission(): Promise<boolean> {
  assertTauriRuntime()

  if (await isPermissionGranted()) {
    return true
  }

  const permission = await requestPermission()
  return permission === 'granted'
}

export async function sendDoneReminder(suggestion: PendingSuggestion): Promise<void> {
  const granted = await ensureNotificationPermission()
  if (!granted) {
    return
  }

  sendNotification({
    title: 'やる気起こrunner',
    body: `「${suggestion.title}」はもう終わりましたか？Doneの記録を忘れていませんか？`,
  })
}
