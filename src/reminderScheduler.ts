import {
  msUntilReminder,
  REMINDER_INTERVAL_MS,
  shouldRemind,
  type PendingSuggestion,
} from './reminder'
import { sendDoneReminder } from './reminderNotify'

const REMINDER_POLL_INTERVAL_MS = 60 * 1000

export type ReminderSchedulerOptions = {
  getPendingSuggestion: () => Promise<PendingSuggestion | null>
  intervalMs?: number
  now?: () => Date
}

export function startReminderScheduler({
  getPendingSuggestion,
  intervalMs = REMINDER_INTERVAL_MS,
  now = () => new Date(),
}: ReminderSchedulerOptions): () => void {
  const remindedSuggestionIds = new Set<number>()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let pollIntervalId: ReturnType<typeof setInterval> | undefined

  const checkReminder = async () => {
    const pending = await getPendingSuggestion()
    if (pending === null || remindedSuggestionIds.has(pending.id)) {
      return
    }

    if (!shouldRemind(pending, now(), intervalMs)) {
      return
    }

    remindedSuggestionIds.add(pending.id)
    await sendDoneReminder(pending)
  }

  const scheduleNextCheck = async () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    const pending = await getPendingSuggestion()
    if (pending === null || remindedSuggestionIds.has(pending.id)) {
      return
    }

    const delayMs = msUntilReminder(pending, now(), intervalMs)
    timeoutId = setTimeout(() => {
      void checkReminder().finally(() => {
        void scheduleNextCheck()
      })
    }, delayMs)
  }

  void scheduleNextCheck()
  pollIntervalId = setInterval(() => {
    void checkReminder()
  }, REMINDER_POLL_INTERVAL_MS)

  return () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    if (pollIntervalId !== undefined) {
      clearInterval(pollIntervalId)
    }
  }
}
