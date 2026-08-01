export const REMINDER_INTERVAL_MS = 30 * 60 * 1000

export type PendingSuggestion = {
  id: number
  title: string
  suggestedAt: string
}

export function parseSuggestedAt(suggestedAt: string): Date {
  return new Date(suggestedAt)
}

export function shouldRemind(
  suggestion: PendingSuggestion,
  now: Date,
  intervalMs: number = REMINDER_INTERVAL_MS,
): boolean {
  const elapsedMs = now.getTime() - parseSuggestedAt(suggestion.suggestedAt).getTime()
  return elapsedMs >= intervalMs
}

export function msUntilReminder(
  suggestion: PendingSuggestion,
  now: Date,
  intervalMs: number = REMINDER_INTERVAL_MS,
): number {
  const elapsedMs = now.getTime() - parseSuggestedAt(suggestion.suggestedAt).getTime()
  return Math.max(0, intervalMs - elapsedMs)
}
