import { useCallback, useEffect, useState } from 'react'
import {
  completeSuggestion,
  getCurrentSuggestion,
  suggestNextTask,
  TIME_BAND_LABELS,
  undoSuggestionCompletion,
} from '../suggest'
import { formatTauriError } from '../tauriRuntime'
import { completionMessage, type ViewState } from '../viewState'

export function SuggestionView() {
  const [view, setView] = useState<ViewState>({ kind: 'loading' })
  const [isCompleting, setIsCompleting] = useState(false)

  const loadSuggestion = useCallback(async (options?: {
    forceNew?: boolean
    excludeTaskId?: number
    replaceSuggestionId?: number
  }) => {
    setView({ kind: 'loading' })

    try {
      if (!options?.forceNew) {
        const current = await getCurrentSuggestion()
        if (current !== null) {
          setView({ kind: 'suggestion', suggestion: current })
          return
        }
      }

      const nextSuggestion = await suggestNextTask(new Date(), Math.random, {
        excludeTaskIds: options?.excludeTaskId !== undefined ? [options.excludeTaskId] : undefined,
        replaceSuggestionId: options?.replaceSuggestionId,
      })
      setView({ kind: 'suggestion', suggestion: nextSuggestion })
    } catch (loadError: unknown) {
      console.error('提案の取得に失敗しました', loadError)
      setView({ kind: 'error', message: formatTauriError(loadError) })
    }
  }, [])

  const completeCurrentSuggestion = useCallback(async (motivated: boolean) => {
    if (view.kind !== 'suggestion' || isCompleting) {
      return
    }

    setIsCompleting(true)

    try {
      await completeSuggestion(view.suggestion.id, motivated)
      setView({
        kind: 'completed',
        message: completionMessage(motivated),
        suggestion: view.suggestion,
      })
    } catch (completeError: unknown) {
      console.error('Doneの記録に失敗しました', completeError)
      setView({ kind: 'error', message: formatTauriError(completeError) })
    } finally {
      setIsCompleting(false)
    }
  }, [isCompleting, view])

  const undoCurrentCompletion = useCallback(async () => {
    if (view.kind !== 'completed' || isCompleting) {
      return
    }

    setIsCompleting(true)

    try {
      await undoSuggestionCompletion(view.suggestion.id)
      setView({ kind: 'suggestion', suggestion: view.suggestion })
    } catch (undoError: unknown) {
      console.error('Doneの取り消しに失敗しました', undoError)
      setView({ kind: 'error', message: formatTauriError(undoError) })
    } finally {
      setIsCompleting(false)
    }
  }, [isCompleting, view])

  useEffect(() => {
    void loadSuggestion()
  }, [loadSuggestion])

  if (view.kind === 'loading') {
    return (
      <section className="card card--loading" aria-busy="true" aria-label="提案を読み込み中">
        <span className="spinner" aria-hidden="true" />
        <p className="card__message">提案を選んでいます…</p>
      </section>
    )
  }

  if (view.kind === 'error') {
    return (
      <section className="card card--error" aria-label="エラー">
        <p className="card__message card__message--error">{view.message}</p>
        <div className="card__actions">
          <button className="btn btn--primary" type="button" onClick={() => void loadSuggestion({ forceNew: true })}>
            もう一度試す
          </button>
        </div>
      </section>
    )
  }

  if (view.kind === 'completed') {
    return (
      <section className="card card--success" aria-label="記録完了">
        <p className="card__message card__message--success">{view.message}</p>
        <p className="card__hint">間違えた場合は取り消せます。</p>
        <div className="card__actions">
          <button
            className="btn btn--secondary"
            type="button"
            disabled={isCompleting}
            onClick={() => void undoCurrentCompletion()}
          >
            取り消す
          </button>
          <button
            className="btn btn--primary"
            type="button"
            disabled={isCompleting}
            onClick={() => void loadSuggestion({ forceNew: true })}
          >
            次の提案をもらう
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card" aria-label="提案">
      <p className="card__label">{TIME_BAND_LABELS[view.suggestion.timeBand]}</p>
      <h2 className="card__title">{view.suggestion.title}</h2>
      <div className="card__actions">
        <button
          className="btn btn--primary"
          type="button"
          disabled={isCompleting}
          onClick={() => void completeCurrentSuggestion(false)}
        >
          Done
        </button>
        <button
          className="btn btn--success"
          type="button"
          disabled={isCompleting}
          onClick={() => void completeCurrentSuggestion(true)}
        >
          やる気が出た Done
        </button>
        <button
          className="btn btn--secondary"
          type="button"
          disabled={isCompleting}
          onClick={() => {
            if (view.kind !== 'suggestion') {
              return
            }

            void loadSuggestion({
              forceNew: true,
              excludeTaskId: view.suggestion.taskId,
              replaceSuggestionId: view.suggestion.id,
            })
          }}
        >
          別の提案
        </button>
      </div>
    </section>
  )
}
