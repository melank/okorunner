import type { Suggestion } from './suggest'

export type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'suggestion'; suggestion: Suggestion }
  | { kind: 'completed'; message: string; suggestion: Suggestion }

export function completionMessage(motivated: boolean): string {
  if (motivated) {
    return 'Doneを記録しました（やる気が出た）'
  }

  return 'Doneを記録しました（やる気は出なかった）'
}
