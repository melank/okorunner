import type { Suggestion } from './suggest'

export type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'suggestion'; suggestion: Suggestion }
  | { kind: 'completed'; message: string; suggestion: Suggestion }

export function completionMessage(motivated: boolean): string {
  return motivated ? 'やる気が出た Doneを記録しました' : 'Doneを記録しました'
}
