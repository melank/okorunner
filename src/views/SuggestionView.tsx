import { useCallback, useEffect, useState } from 'react'
import {
  completeSuggestion,
  getCurrentSuggestion,
  suggestNextTask,
  TIME_BAND_LABELS,
  undoSuggestionCompletion,
  type Suggestion,
} from '../suggest'
import { formatTauriError } from '../tauriRuntime'
import { schedulePopoverResize } from '../windowBehavior'
import { completionMessage, type ViewState } from '../viewState'

export function SuggestionView() {
  const [view, setView] = useState<ViewState>({ kind: 'loading' })
  const [isCompleting, setIsCompleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadSuggestion = useCallback(async (options?: {
    forceNew?: boolean
    excludeTaskId?: number
    replaceSuggestionId?: number
    keepCurrentView?: boolean
  }) => {
    const keepCurrentView = options?.keepCurrentView === true

    if (keepCurrentView) {
      setIsRefreshing(true)
    } else {
      setView({ kind: 'loading' })
    }

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
    } finally {
      setIsRefreshing(false)
      schedulePopoverResize()
    }
  }, [])

  const requestAnotherSuggestion = useCallback((suggestion: Suggestion) => {
    void loadSuggestion({
      forceNew: true,
      excludeTaskId: suggestion.taskId,
      replaceSuggestionId: suggestion.id,
      keepCurrentView: true,
    })
  }, [loadSuggestion])

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
    <section className="card" aria-label="提案" aria-busy={isRefreshing}>
      <p className="card__label">{TIME_BAND_LABELS[view.suggestion.timeBand]}</p>
      <h2 className="card__title">{view.suggestion.title}</h2>
      <p className="card__hint">やる気は出ましたか？</p>
      <div className="done-prompt__choices">
        <button
          className="done-prompt__choice"
          type="button"
          disabled={isCompleting || isRefreshing}
          aria-label="やる気は出なかった"
          onClick={() => void completeCurrentSuggestion(false)}
        >
          <span className="done-prompt__emoji" aria-hidden="true">😐</span>
          <span className="done-prompt__choice-label">出なかった</span>
        </button>
        <button
          className="done-prompt__choice done-prompt__choice--motivated"
          type="button"
          disabled={isCompleting || isRefreshing}
          aria-label="やる気が出た"
          onClick={() => void completeCurrentSuggestion(true)}
        >
          <span className="done-prompt__emoji" aria-hidden="true">✨</span>
          <span className="done-prompt__choice-label">出た</span>
        </button>
      </div>
      <div className="card__actions">
        <button
          className="btn btn--secondary"
          type="button"
          disabled={isCompleting || isRefreshing}
          onClick={() => requestAnotherSuggestion(view.suggestion)}
        >
          別の提案
        </button>
      </div>
    </section>
  )
}
